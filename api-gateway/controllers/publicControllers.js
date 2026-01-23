import axios from "axios";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import sendMail from "../utils/sendMail.js";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "crypto";
import speakeasy from "speakeasy";
// import { matchClient } from "../app.js";

function isRateLimited(store, key, limit, windowMs) {
  if (!key) return false;
  const now = Date.now();
  const entries = store.get(key) || [];
  const fresh = entries.filter((ts) => now - ts < windowMs);
  fresh.push(now);
  store.set(key, fresh);
  return fresh.length > limit;
}

const publicControllers = {
  // JSON API stores (in-memory, short-lived)
  captchaStore: new Map(),
  pending2FA: new Map(),
  resetCodeStore: new Map(),
  resetTokenStore: new Map(),
  forgotPasswordLimiter: new Map(),
  verifyResetLimiter: new Map(),
  resetPasswordLimiter: new Map(),

  //GETTERS

  getIcon: function getIcon(req, reply) {
    return reply.sendFile("favicon.ico");
  },

  // JSON: Get captcha for Next.js
  getCaptchaJson: async function getCaptchaJson(req, reply) {
    try {
      const response = await axios.get("https://auth-service:3001/getCaptcha");
      const { code, data } = response.data;
      const captchaId = randomUUID();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      publicControllers.captchaStore.set(captchaId, { code, expiresAt });

      return reply.code(200).send({ captchaId, image: data });
    } catch (err) {
      console.error("Error loading captcha:", err.message);
      return reply.code(500).send({ error: "Failed to generate CAPTCHA" });
    }
  },

  homePage: function getHomePage(req, reply) {
    return reply.view("homePage");
  },

  login: async function getLoginPage(req, reply) {
    let success = [];
    let error = [];

    success = req.session.success ?? [];
    error = req.session.error ?? [];

    delete req.session.captcha;
    delete req.session.captchaExpires;
    delete req.session.email;
    delete req.session.permission;
    delete req.session.success;
    delete req.session.error;

    try {
      const response = await axios.get("https://auth-service:3001/getCaptcha");
      const { code, data } = response.data;
      req.session.captcha = code;
      req.session.data = data;
      req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

      return reply.view("login", { success, error, captcha: data });
    } catch (err) {
      console.error("Error loading captcha for login page:", err.message);
      req.session.error = [`Error loading the captcha D= : ${err.message}`];
      return reply.redirect("/login");
    }
  },

  register: async function getRegisterPage(req, reply) {
    let success = [];
    let error = [];

    success = req.session.success ?? [];
    error = req.session.error ?? [];

    delete req.session.captcha;
    delete req.session.captchaExpires;
    delete req.session.email;
    delete req.session.permission;
    delete req.session.success;
    delete req.session.error;

    try {
      const response = await axios.get("https://auth-service:3001/getCaptcha");
      const { code, data } = response.data;
      req.session.captcha = code;
      req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

      return reply.view("register", { success, error, captcha: data });
    } catch (err) {
      req.session.error = [`An error happened: ${err.message}`];
      return reply.redirect("/register");
    }
  },

  //SETTERS

  // JSON: Login for Next.js
  loginJson: async function loginJson(req, reply) {
    try {
      const { email, password, captchaId, captchaInput } = req.body || {};
      if (!email || !password || !captchaId || !captchaInput) {
        return reply.code(400).send({ error: "Missing credentials or captcha" });
      }

      const captchaRecord = publicControllers.captchaStore.get(captchaId);
      if (!captchaRecord || captchaRecord.expiresAt < Date.now()) {
        publicControllers.captchaStore.delete(captchaId);
        return reply.code(400).send({ error: "CAPTCHA expired" });
      }
      if (captchaInput.toLowerCase() !== captchaRecord.code.toLowerCase()) {
        return reply.code(400).send({ error: "Invalid code" });
      }

      // Invalidate captcha after use
      publicControllers.captchaStore.delete(captchaId);

      const response = await axios.post(
        "https://auth-service:3001/checkLogin",
        { email, password }
      );

      const token = response?.data?.token;
      if (!token) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      // Check if 2FA is enabled
      const twoFARes = await axios.post(
        "https://auth-service:3001/get2FAEnable",
        { email }
      );
      const twoFactorEnable = twoFARes?.data?.twoFactorEnable;

      if (twoFactorEnable) {
        const tempToken = randomUUID();
        publicControllers.pending2FA.set(tempToken, {
          token,
          email,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
        return reply.code(200).send({ requires2FA: true, tempToken });
      }

      return reply.code(200).send({ token });
    } catch (err) {
      const status = err?.response?.status || 500;
      const backendPayload = err?.response?.data;
      const backendError =
        backendPayload?.error ||
        backendPayload?.success ||
        backendPayload;
      const message = Array.isArray(backendError)
        ? backendError[0]
        : backendError;
      if (status === 401 || status === 404) {
        return reply.code(status).send({ error: message || "Invalid credentials" });
      }
      console.error("Login JSON error:", err.message);
      return reply.code(500).send({ error: "Login failed" });
    }
  },

  // JSON: Register for Next.js
  registerJson: async function registerJson(req, reply) {
    try {
      const { username, nickname, email, password, confirmPassword, captchaId, captchaInput } =
        req.body || {};

      if (!username || !nickname || !email || !password || !confirmPassword) {
        return reply.code(400).send({ error: "Please fill all fields" });
      }
      if (!captchaId || !captchaInput) {
        return reply.code(400).send({ error: "Missing captcha" });
      }

      const captchaRecord = publicControllers.captchaStore.get(captchaId);
      if (!captchaRecord || captchaRecord.expiresAt < Date.now()) {
        publicControllers.captchaStore.delete(captchaId);
        return reply.code(400).send({ error: "CAPTCHA expired" });
      }
      if (captchaInput.toLowerCase() !== captchaRecord.code.toLowerCase()) {
        return reply.code(400).send({ error: "Invalid code" });
      }
      publicControllers.captchaStore.delete(captchaId);

      const user_id = randomUUID();
      const response = await axios.post(
        "https://auth-service:3001/checkRegister",
        {
          user_id,
          username,
          nickname,
          email,
          password,
          confirmPassword,
        }
      );

      // Create default avatar (same as legacy register)
      await mkdir("/app/public/uploads", { recursive: true });
      await sharp("/app/public/images/default.jpg")
        .resize(350, 350)
        .composite([
          {
            input: Buffer.from(
              `<svg width="350" height="350">
                         <circle cx="175" cy="175" r="175" fill="white"/>
                         </svg>`
            ),
            blend: "dest-in",
          },
        ])
        .png()
        .toFile(`/app/public/uploads/avatar_${user_id}.png`);
      const avatar = `/public/uploads/avatar_${user_id}.png`;
      await axios.post("https://users-service:3003/setUserAvatar", {
        user_id,
        avatar,
      });

      const loginResponse = await axios.post(
        "https://auth-service:3001/checkLogin",
        { email, password }
      );
      const token = loginResponse?.data?.token;
      if (!token) {
        return reply.code(200).send({ success: response?.data?.success || [] });
      }

      const twoFARes = await axios.post(
        "https://auth-service:3001/get2FAEnable",
        { email }
      );
      const twoFactorEnable = twoFARes?.data?.twoFactorEnable;

      if (twoFactorEnable) {
        const tempToken = randomUUID();
        publicControllers.pending2FA.set(tempToken, {
          token,
          email,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });
        return reply.code(200).send({ requires2FA: true, tempToken });
      }

      return reply.code(200).send({ token });
    } catch (err) {
      if (err?.response?.status === 409) {
        return reply.code(409).send({ error: "User already exists" });
      }
      console.error("Register JSON error:", err.message);
      return reply.code(500).send({ error: "Registration failed" });
    }
  },

  // JSON: Verify 2FA for login
  verify2FALoginJson: async function verify2FALoginJson(req, reply) {
    try {
      const { tempToken, code } = req.body || {};
      if (!tempToken || !code) {
        return reply.code(400).send({ error: "Missing verification data" });
      }

      const pending = publicControllers.pending2FA.get(tempToken);
      if (!pending || pending.expiresAt < Date.now()) {
        publicControllers.pending2FA.delete(tempToken);
        return reply.code(401).send({ error: "Session expired" });
      }

      const secretRes = await axios.post(
        "https://auth-service:3001/get2FASecret",
        { email: pending.email }
      );
      const secret = secretRes?.data?.twoFactorSecret;
      if (!secret) {
        return reply.code(400).send({ error: "2FA not configured" });
      }

      const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token: String(code).trim(),
        window: 1,
      });

      if (!verified) {
        return reply.code(400).send({ error: "Invalid verification code" });
      }

      publicControllers.pending2FA.delete(tempToken);
      return reply.code(200).send({ token: pending.token });
    } catch (err) {
      console.error("Verify 2FA JSON error:", err.message);
      return reply.code(500).send({ error: "Verification failed" });
    }
  },

  // JSON: Forgot password (send code)
  forgotPasswordJson: async function forgotPasswordJson(req, reply) {
    try {
      if (isRateLimited(publicControllers.forgotPasswordLimiter, req.ip, 5, 15 * 60 * 1000)) {
        return reply.code(429).send({ error: "Too many requests. Try again later." });
      }
      if (!req.body || !req.body.email) {
        return reply.code(400).send({ error: "Missing email" });
      }

      const email = req.body.email.toLowerCase();
      await axios.post("https://auth-service:3001/checkEmail", { email });

      const response = await axios.get("https://auth-service:3001/getCaptcha");
      const { code } = response.data;
      const expiresAt = Date.now() + 10 * 60 * 1000;
      publicControllers.resetCodeStore.set(email, { code, expiresAt });

      const receiver = email;
      const subject = "Forgot Password - Transcendence";
      const webPage = `
                                <h2>Forgot Password - Your Pong Transcendence</h2>
                                <p>Please, you need to inform the code below to change the password of your account</p>
                                <p>The code is <strong>${code}</strong>. Type it in the verify page to validate it</p>
                        `;
      await sendMail(receiver, subject, webPage);

      return reply.code(200).send({ success: true });
    } catch (err) {
      if (err?.response?.status === 404)
        return reply.code(404).send({ error: "User not found" });
      console.error("Forgot password JSON error:", err.message);
      return reply.code(500).send({ error: "Failed to send reset code" });
    }
  },

  // JSON: Verify reset code
  verifyResetCodeJson: async function verifyResetCodeJson(req, reply) {
    try {
      if (isRateLimited(publicControllers.verifyResetLimiter, req.ip, 10, 15 * 60 * 1000)) {
        return reply.code(429).send({ error: "Too many attempts. Try again later." });
      }
      const { email, code } = req.body || {};
      if (!email || !code) {
        return reply.code(400).send({ error: "Missing email or code" });
      }

      const normalizedEmail = email.toLowerCase();
      const record = publicControllers.resetCodeStore.get(normalizedEmail);
      if (!record || record.expiresAt < Date.now()) {
        publicControllers.resetCodeStore.delete(normalizedEmail);
        return reply.code(401).send({ error: "Invalid or expired code" });
      }

      if (record.code.toLowerCase() !== code.toLowerCase()) {
        return reply.code(401).send({ error: "Invalid or expired code" });
      }

      publicControllers.resetCodeStore.delete(normalizedEmail);
      const resetToken = randomUUID();
      const expiresAt = Date.now() + 10 * 60 * 1000;
      publicControllers.resetTokenStore.set(resetToken, {
        email: normalizedEmail,
        expiresAt,
      });

      return reply.code(200).send({ success: true, token: resetToken });
    } catch (err) {
      console.error("Verify reset code JSON error:", err.message);
      return reply.code(500).send({ error: "Failed to verify code" });
    }
  },

  // JSON: Reset password
  resetPasswordJson: async function resetPasswordJson(req, reply) {
    try {
      if (isRateLimited(publicControllers.resetPasswordLimiter, req.ip, 5, 15 * 60 * 1000)) {
        return reply.code(429).send({ error: "Too many requests. Try again later." });
      }
      const { email, token, password, confirmPassword } = req.body || {};
      if (!email || !token || !password || !confirmPassword) {
        return reply.code(400).send({ error: "Missing fields" });
      }

      if (password !== confirmPassword) {
        return reply.code(400).send({ error: "Passwords do not match" });
      }

      const normalizedEmail = email.toLowerCase();
      const record = publicControllers.resetTokenStore.get(token);
      if (!record || record.expiresAt < Date.now()) {
        publicControllers.resetTokenStore.delete(token);
        return reply.code(401).send({ error: "Invalid or expired reset token" });
      }

      if (record.email !== normalizedEmail) {
        return reply.code(401).send({ error: "Invalid or expired reset token" });
      }

      const response = await axios.post("https://auth-service:3001/newPassword", {
        email: normalizedEmail,
        password,
        confirmPassword,
      });

      publicControllers.resetTokenStore.delete(token);

      return reply.code(200).send({ success: true, data: response?.data || {} });
    } catch (err) {
      if (err?.response?.status === 401)
        return reply.code(401).send({ error: "Invalid code" });
      console.error("Reset password JSON error:", err.message);
      return reply.code(500).send({ error: "Failed to reset password" });
    }
  },

  checkRegister: async function tryRegisterNewUser(req, reply) {
    let success = [];
    let error = [];
    try {
      req.body.user_id = randomUUID();
      if (
        !req.body.username ||
        !req.body.nickname ||
        req.body.username.toLowerCase() === "system" ||
        req.body.nickname.toLowerCase() === "system"
      )
        throw new Error("Fill everything or Forbidden Username/Nickname");
      const response = await axios.post(
        "https://auth-service:3001/checkRegister",
        req.body
      );

      success = response.data.success || [];
      error = response.data.error || [];

      req.session.success = success;
      req.session.error = error;

      await mkdir("/app/public/uploads", { recursive: true });
      await sharp("/app/public/images/default.jpg")
        .resize(350, 350)
        .composite([
          {
            input: Buffer.from(
              `<svg width="350" height="350">
                         <circle cx="175" cy="175" r="175" fill="white"/>
                         </svg>`
            ),
            blend: "dest-in",
          },
        ])
        .png()
        .toFile(`/app/public/uploads/avatar_${req.body.user_id}.png`);
      let avatar = `/public/uploads/avatar_${req.body.user_id}.png`;
      await axios.post("https://users-service:3003/setUserAvatar", {
        user_id: req.body.user_id,
        avatar: avatar,
      });

      return reply.redirect("/login");
    } catch (err) {
      if (err?.response?.status === 409) {
        req.session.error = ["Registration failed. Try again"];
        return reply.redirect("/register");
      }
      error = [`${err.message}`];
      req.session.success = success;
      req.session.error = error;

      return reply.redirect("/register");
    }
  },

  // Authentication

  checkLogin: async function tryLoginTheUser(req, reply) {
    try {
      if (!req.body.captchaInput) {
        req.session.error = ["You forgot to fill captcha code"];
        return reply.redirect("/login");
      }

      const response = await axios.post(
        "https://auth-service:3001/checkLogin",
        req.body
      );

      const token = response?.data?.token;
      if (!token) {
        req.session.error = ["Invalid credentials"];
        return reply.redirect("/login");
      }

      const isProduction = process.env.NODE_ENV === "production";

      reply.setCookie("jwt", token, {
        httpOnly: true,
        secure: isProduction,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1h
      });

      return reply.redirect("/home");
    } catch (err) {
      if (err?.response?.status === 404) {
        req.session.error = ["Invalid credentials"];
        return reply.redirect("/login");
      }
      req.session.error = ["Invalid credentials"];
      console.error("Error trying login:", err);
      return reply.redirect("/login");
    }
  },

  forgotPasswordPage: async function forgotPasswordPage(req, reply) {
    let success = [];
    let error = [];

    success = req.session.success || [];
    error = req.session.error || [];

    delete req.session.success;
    delete req.session.error;

    return reply.view("forgotPasswordPage", { success, error });
  },

  checkEmail: async function checkEmail(req, reply) {
    let success = [];
    let error = [];

    try {
      if (!req.body || !req.body.email) {
        error.push("User not found");
        req.session.success = success;
        req.session.error = error;
        return reply.redirect("/forgotPassword");
      }

      await axios.post("https://auth-service:3001/checkEmail", req.body);

      req.session.email = req.body.email;

      const response = await axios.get("https://auth-service:3001/getCaptcha");
      const { code, data } = response.data;
      req.session.captcha = code;
      req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

      const receiver = req.session.email;
      const subject = "Forgot Password - Transcendence";
      const webPage = `
                                <h2>Forgot Password - Your Pong Transcendence</h2>
                                <p>Please, you need to inform the code below to change the password of your account</p>
                                <p>The code is <strong>${code}</strong>. Type it in the checkEmailCode page to validate it</p>
                        `;
      await sendMail(receiver, subject, webPage);

      return reply.redirect("/validateEmailCode");
    } catch (err) {
      delete req.session.email;
      delete req.session.captcha;
      delete req.session.captchaExpires;
      delete req.session.email;
      delete req.session.permission;

      if (err?.response?.status === 400)
        error.push("You need to fill all fields");
      else if (err?.response?.status === 404) error.push("User not found");
      else error.push("An error happened trying to checking E-mail");
      req.session.success = success;
      req.session.error = error;
      console.error("api-gateway error no checkEmail:", err.message);
      return reply.redirect("/forgotPassword");
    }
  },

  validateEmailCode: async function validateEmailCode(req, reply) {
    if (!req.session.email) {
      req.session.error = ["You need to follow step by step"];
      return redirect("/login");
    }
    const error = req.session.error || [];
    delete req.session.error;
    return reply.view("checkEmailCode", { error });
  },

  checkEmailCode: async function checkEmailCode(req, reply) {
    if (!req.session.email || !req.body || !req.body.captchaInput) {
      req.session.success = [];
      req.session.error = ["You need to follow step by step"];
      return reply.redirect("/login");
    }

    // validator hook validates the captchaInput

    req.session.permission = true;
    return reply.redirect("/newPasswordPage");
  },

  newPasswordPage: async function validateEmailCode(req, reply) {
    if (!req.session.email || !req.session.permission) {
      req.session.error = ["You need to follow step by step"];
      return reply.redirect("/login");
    }
    const error = req.session.error ?? [];
    const success = req.session.success ?? [];
    delete req.session.error;

    return reply.view("newPasswordPage", { success, error });
  },

  newPassword: async function newPassword(req, reply) {
    if (
      !req.body ||
      !req.session.permission ||
      !req.session.email ||
      !req.body.password ||
      !req.body.confirmPassword
    ) {
      req.session.error = ["You need to follow step by step"];
      return reply.redirect("/login");
    }

    try {
      if (req.body.new2FA === undefined) req.body.new2FA = false;
      else req.body.new2FA = true;
      req.body.email = req.session.email;
      await axios.post("https://auth-service:3001/newPassword", req.body);
      req.session.success = ["Password changed successfully"];
      if (req.body.new2FA)
        await axios.post("https://auth-service:3001/set2FASecret", {
          email: req.body.email,
          secret: null,
        });
      return reply.redirect("/login");
    } catch (err) {
      if (err?.response?.status === 409) {
        req.session.error = ["You cannot put the same password as a new one"];
        return reply.redirect("/login");
      }
      req.session.error = [
        "An error happened when we are trying to change your password as requested D=",
      ];
      return reply.redirect("/newPasswordPage");
    }
  },

  //TESTS
  hello: async function testAuthServiceConnection(req, reply) {
    try {
      const result = await axios.get("https://auth-service:3001/hello");
      return reply.send(`API GATEWAY - auth: ${result.data}`);
    } catch (err) {
      console.error(
        "Unfortunately, the api-gateway failed to communicate with auth-service by:",
        err.message
      );
      return reply.code(500).send("Error:", err.message);
    }
  },

  checkDb: async function testGatewayConnectionWithSqlite(req, reply) {
    try {
      const result = await axios.get("https://sqlite-db:3002/hello");
      return reply.send(`API GATEWAY - sqlite: ${result.data}`);
    } catch (err) {
      console.error(
        "Unfortunately, the api-gateway failed to communicate with sqlite-db by:",
        err.message
      );
      return reply.send("The API-GATEWAY cannot access database anymore");
    }
  },
};

export default publicControllers;
