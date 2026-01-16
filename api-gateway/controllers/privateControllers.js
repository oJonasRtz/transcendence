import axios from "axios";
import jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail.js";
import speakeasy from "speakeasy";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import { pipeline } from "stream/promises";
import { checkImageSafety } from "../utils/apiCheckImages.js";
import { fileTypeFromFile } from "file-type";
import sharp from "sharp";
import { MatchClient } from "../utils/MatchClient.class.js";
import { matchClient } from "../app.js";
import { waitForDebugger } from "inspector";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_IMAGE_PATH = "/app/public/images/default.jpg";

function getState(user) {
  const colour = {
    IDLE: "green",
    OFFLINE: "red",
    IN_GAME: "blue",
    IN_QUEUE: "yellow",
  }
  const labels = {
    IDLE: "ONLINE",
    OFFLINE: "OFFLINE",
    IN_GAME: "IN GAME",
    IN_QUEUE: "IN QUEUE",
  }
  const key = user.isOnline ? user.state : "OFFLINE";

  return {colour: colour[key], text: labels[key]};
}

async function getRank(user) {
  try {
    const res = await axios.post("https://users-service:3003/getRank", {
      user_id: user.user_id,
    });
    return res?.data ?? { rank: "UNRANKED", pts: 0 };
  } catch (error) {
    console.error("GET RANK ERROR:", error.message);
    return { rank: "UNRANKED", pts: 0 };
  }
}

const privateControllers = {
  // JSON API store for email verification (in-memory, short-lived)
  emailVerificationStore: new Map(),
  goFlappyBird: function goFlappyBird(req, reply) {
    return reply.sendFile("flappy-bird/index.html");
  },

  goPong: function goPong(req, reply) {
    return reply.sendFile("pong/index.html");
  },

  match: async function match(req, reply) {
    const {token} = req.params;
    console.log("id: " + req.user.user_id);

    if (token) {
      console.log("temos um token: " + token);
      try {
        const url = 'https://match-service:3010/join_party/' + token;
        await axios.post(url, {id: req.user.user_id});
      } catch (error) {
        console.error("MATCH PAGE ERROR:", error.message);    
      }
    }

    const match = matchClient.get(req.jwt);
    const state = match ? match.state : 'OFFLINE';
    return reply.view("matchMaking", {state});
  },

  joinQueue: async function joinQueue(req, reply) {
    try {
      console.log('JOIN QUEUE REQUEST');

      const token = req.jwt;
      if (!token) throw new Error("No token provided");

      const match = matchClient.get(token);
      if (!match || !match.isConnected) throw new Error("Not connected to Match Service");

      match.enqueue();
      return reply.code(204).send();
    } catch (error) {
      console.error("JOIN QUEUE ERROR:", error.message);
      return reply.code(500).send("Error: " + error.message);
    }
  },

  leaveQueue: async function leaveQueue(req, reply) {
    try {
      console.log('LEAVE QUEUE REQUEST');

      const token = req.jwt;
      if (!token) throw new Error("No token provided");

      const match = matchClient.get(token);
      if (!match || !match.isConnected) throw new Error("Not connected to Match Service");

      match.dequeue();
      return reply.code(204).send();
    } catch (error) {
      console.error("LEAVE QUEUE ERROR:", error.message);
      return reply.code(500).send("Error: " + error.message);
    }
  },

  matchFound: async function matchFound(req, reply) {
    try {
      const token = req.jwt;
      if (!token) throw new Error("No token provided");

      const match = matchClient.get(token);
      if (!match || !match.isConnected) throw new Error("Not connected to Match Service");

      reply.redirect('/pong');
    } catch (error) {
      console.error("MATCH FOUND ERROR:", error.message);
      return reply.code(500).send("Error: " + error.message);
    }
  },

  helloDb: async function testPrivateRoute(req, reply) {
    try {
      const result = await axios.get("https://auth-service:3001/helloDb");
      return reply.send(`API GATEWAY - auth: ${result.data}`);
    } catch (err) {
      return reply.send(
        `Unfortunately, the auth-service cannot access the database: ${err.message}`
      );
    }
  },

  getHomePage: async function getHomePage(req, reply) {
    try {
      const token = req.jwt;

      if (!token) {
        console.log("You are not authenticated");
        return reply.redirect("/login");
      }

      const username = req.user.username;

      const success = req.session.success || [];
      const error = req.session.error || [];

      delete req.session.success;
      delete req.session.error;

      req.user.isOnline = true;

      //get the user's avatar

      const response = await axios.post(
        "https://users-service:3003/getUserAvatar",
        { user_id: req.user.user_id, email: req.user.email }
      );
      let avatar = response?.data.avatar;

      /*if (avatar === '/public/images/default.jpg') {
				try {
					await fs.access(`/app/public/uploads/avatar_${req.user.user_id}.png`);
				} catch (err) {
					 await mkdir("/app/public/uploads", { recursive: true });
					 await sharp(BASE_IMAGE_PATH)
                			.resize(350, 350)
                			.composite([{
                    			input: Buffer.from(
                        			`<svg width="350" height="350">
                            			<circle cx="175" cy="175" r="175" fill="white"/>
                        			</svg>`
                    			),
                    			blend: "dest-in"
                		}])
                		.png()
                		.toFile(`/app/public/uploads/avatar_${req.user.user_id}.png`);
				}
				avatar = `/public/uploads/avatar_${req.user.user_id}.png`;
				await axios.post("https://users-service:3003/setUserAvatar", { user_id: req.user.user_id, avatar: avatar });
			}*/

      const myData = await axios.post(
        "https://users-service:3003/getUserInformation",
        { user_id: req.user.user_id }
      );

      if (!matchClient.has(token)) {
        const mc = new MatchClient();
        mc.connect({
          name: req.user.username,
          email: req.user.email,
          id: req.user.user_id,
          token: token,
        });
        matchClient.set(token, mc);
      }

      const match = matchClient.get(token);
      const data = myData?.data;

      // console.log("USER Info: " + JSON.stringify(data));

      data.state = getState({isOnline: req.user.isOnline, state: match.state});
      // const rank = await getRank(req.user);
      // data.rank = rank;
// 
      return reply.view("home", { username, success, data, avatar, error });
    } catch (err) {
      console.error("getHomePage API-GATEWAY ERROR:", err);
      return reply.redirect("/login");
    }
  },

  logout: async function logoutTheUser(req, reply) {
    // erase all cookies

    const token = req.cookies.jwt;
    const decoded = jwt.decode(token) || {};

    req.user.isOnline = false;
    req.user.state = 'OFFLINE';

    try {
      await axios.post("https://users-service:3003/setIsOnline", req.user);

      await req.session.destroy();

      reply.clearCookie("jwt");
      reply.clearCookie("session");

      const match = matchClient.get(token);
      if (match && match.isConnected)
         await match.disconnect();

      await axios.post("https://auth-service:3001/set2FAValidate", {
        email: decoded.email,
        signal: false,
      });
    } catch (err) {
      console.error(
        "API-GATEWAY logout ERROR:",
        err?.response.data || err.message
      );
    }

    return reply.redirect("/login");
  },

  confirmUserEmail: async function confirmUserEmail(req, reply) {
    try {
      const token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;

      const response = await axios.get("https://auth-service:3001/getCaptcha");
      const { code, data } = response.data;

      delete req.session.captcha;
      delete req.session.captchaExpires;

      req.session.captcha = code;
      req.session.captchaExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

      const receiver = email;
      const subject = "Confirm your e-mail, Transcendence Pong";
      const webPage = `
				<h2>Confirm your e-mail</h2>
				<p>Congratulations! Confirming your e-mail is a great choice to recover your password easily later</p>
				<p> Your code is <strong>${code}</strong>. Please inform it to us. See you =D</p>
			`;

      await sendMail(receiver, subject, webPage);

      return reply.redirect("/confirmUserEmailCode");
    } catch (err) {
      delete req.session.captcha;
      delete req.session.captchaExpires;

      if (err.response.status === 401) req.session.error = ["Invalid code"];
      else req.session.error = ["Unexpected error happened"];
      return reply.redirect("/confirmUserEmailCode");
    }
  },

  // JSON: Send verification code for Next.js
  sendVerificationEmailJson: async function sendVerificationEmailJson(req, reply) {
    try {
      const { email, user_id } = req.user || {};
      if (!email || !user_id) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const userInfoRes = await axios.post(
        "https://users-service:3003/getUserInformation",
        { user_id }
      );
      if (userInfoRes?.data?.isEmailConfirmed) {
        return reply.code(200).send({
          success: true,
          alreadyVerified: true,
        });
      }

      const response = await axios.get("https://auth-service:3001/getCaptcha");
      const { code } = response.data;
      const expiresAt = Date.now() + 5 * 60 * 1000;
      privateControllers.emailVerificationStore.set(email, { code, expiresAt });

      const subject = "Confirm your e-mail, Transcendence Pong";
      const webPage = `
				<h2>Confirm your e-mail</h2>
				<p>Congratulations! Confirming your e-mail is a great choice to recover your password easily later</p>
				<p> Your code is <strong>${code}</strong>. Please inform it to us. See you =D</p>
			`;

      await sendMail(email, subject, webPage);
      return reply.code(200).send({ success: true });
    } catch (err) {
      console.error("SEND VERIFICATION JSON ERROR:", err?.message || err);
      return reply.code(500).send({ error: "Failed to send verification code" });
    }
  },

  confirmUserEmailCode: async function confirmUserEmailCode(req, reply) {
    const error = req.session.error || [];
    delete req.session.error;
    return reply.view("confirmUserEmailCode", { error });
  },

  validateUserEmailCode: async function validateUserEmailCode(req, reply) {
    try {
      if (!req.body || !req.body.captchaInput) {
        req.session.error = ["You need to follow step by step"];
        return reply.redirect("/confirmUserEmailCode");
      }

      // validator hook, do your job

      await axios.post("https://users-service:3003/validateUserEmail", {
        email: req.user.email,
        user_id: req.user.user_id,
        stats: true,
      });

      req.session.success = ["Your e-mail is validated now =D"];
      return reply.redirect("/home");
    } catch (err) {
      console.error("VALIDATE USER EMAIL CODE API-GATEWAY:", err);
      req.session.error = ["An error happened trying to validating your code"];
      return reply.redirect("/confirmUserEmailCode");
    }
  },

  // JSON: Verify email code for Next.js
  verifyEmailCodeJson: async function verifyEmailCodeJson(req, reply) {
    try {
      const { email, user_id } = req.user || {};
      const { code } = req.body || {};
      if (!email || !user_id) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      if (!code) {
        return reply.code(400).send({ error: "Missing code" });
      }

      const userInfoRes = await axios.post(
        "https://users-service:3003/getUserInformation",
        { user_id }
      );
      if (userInfoRes?.data?.isEmailConfirmed) {
        return reply.code(200).send({
          success: true,
          alreadyVerified: true,
        });
      }

      const record = privateControllers.emailVerificationStore.get(email);
      if (!record || record.expiresAt < Date.now()) {
        privateControllers.emailVerificationStore.delete(email);
        return reply.code(401).send({ error: "Invalid or expired code" });
      }

      if (record.code.toLowerCase() !== String(code).toLowerCase()) {
        return reply.code(401).send({ error: "Invalid or expired code" });
      }

      privateControllers.emailVerificationStore.delete(email);
      await axios.post("https://users-service:3003/validateUserEmail", {
        email,
        user_id,
        stats: true,
      });

      return reply.code(200).send({ success: true });
    } catch (err) {
      console.error("VERIFY EMAIL JSON ERROR:", err?.message || err);
      return reply.code(500).send({ error: "Failed to verify code" });
    }
  },

  // JSON: Email verification status for Next.js
  getVerificationStatus: async function getVerificationStatus(req, reply) {
    try {
      const { email, user_id } = req.user || {};
      if (!email || !user_id) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      let isEmailVerified = false;
      let has2FA = false;

      try {
        const userInfoRes = await axios.post(
          "https://users-service:3003/getUserInformation",
          { user_id }
        );
        isEmailVerified = userInfoRes?.data?.isEmailConfirmed ?? false;
      } catch (err) {
        console.error("getVerificationStatus user info error:", err?.message || err);
      }

      try {
        const twoFaRes = await axios.post(
          "https://auth-service:3001/get2FAEnable",
          { email }
        );
        has2FA = twoFaRes?.data?.twoFactorEnable ?? false;
      } catch (err) {
        console.error("getVerificationStatus 2FA error:", err?.message || err);
      }

      return reply.code(200).send({
        isEmailVerified,
        has2FA,
      });
    } catch (err) {
      console.error("GET VERIFICATION STATUS ERROR:", err?.message || err);
      return reply.code(500).send({ error: "Failed to get verification status" });
    }
  },

  get2FAQrCode: async function get2FAQrCode(req, reply) {
    const accept = req.headers?.accept || "";
    const wantsJson =
      accept.includes("application/json") ||
      req.headers?.["x-requested-with"] === "XMLHttpRequest";

    try {
      const token = req.cookies.jwt;
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      const res = await axios.post("https://auth-service:3001/get2FAEnable", {
        email: decoded.email,
      });
      if (!res.data.twoFactorEnable) {
        if (wantsJson) {
          return reply
            .code(400)
            .send({ error: ["2FA not activated"] });
        }
        req.session.error = ["You do not have 2FA activated at the moment"];
        return reply.redirect("/home");
      }
      const response = await axios.post(
        "https://auth-service:3001/get2FAQrCode",
        { email: decoded.email }
      );
      if (response.data.qrCodeDataURL == null && response.data.image == null) {
        if (wantsJson) {
          return reply
            .code(500)
            .send({ error: ["Error generating the qrCode"] });
        }
        return reply.code(500).send("Error generating the qrCode");
      }

      const qrCodeDataURL = response.data.qrCodeDataURL;
      const image = response.data.image;

      if (wantsJson) {
        return reply.code(200).send({ qrCodeDataURL, image });
      }

      req.session.qrCodeDataURL = qrCodeDataURL;
      req.session.image = image;
      return reply.redirect("/check2FAQrCode");
    } catch (err) {
      console.error("get2FAQrCode");
      if (wantsJson) {
        return reply
          .code(500)
          .send({ error: ["Error getting get2FAQrCode"] });
      }
      req.session.error = ["Error getting get2FAQrCode"];
      return reply.redirect("/home");
    }
  },

  check2FAQrCode: async function check2FAQrCode(req, reply) {
    const isValidate = await axios.post(
      "https://auth-service:3001/get2FAValidate",
      { email: req.user.email }
    );
    if (isValidate?.data.twoFactorValidate) {
      req.session.success = ["You already done the 2FA :)"];
      return reply.redirect("/home");
    }

    if (req.session.qrCodeDataURL == null && req.session.image == null) {
      req.session.error = ["You need to follow step by step"];
      return reply.redirect("/home");
    }
    const qrCodeDataURL = req.session.qrCodeDataURL ?? null;
    const image = req.session.image ?? null;

    const error = req.session.error || [];
    delete req.session.error;
    req.session.canValidate = true;
    return reply.view("check2FAQrCode", { qrCodeDataURL, image, error });
  },

  validate2FAQrCode: async function validate2FAQrCode(req, reply) {
    const accept = req.headers?.accept || "";
    const wantsJson =
      accept.includes("application/json") ||
      req.headers?.["x-requested-with"] === "XMLHttpRequest";

    try {
      if (wantsJson) {
        if (!req.body || !req.body.code) {
          return reply
            .code(400)
            .send({ error: ["Verification code is required"] });
        }
        const token = req.cookies.jwt;
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const response = await axios.post(
          "https://auth-service:3001/get2FASecret",
          { email: decoded.email }
        );
        if (!response.data.twoFactorSecret) {
          return reply
            .code(400)
            .send({ error: ["2FA not configured"] });
        }

        const verified = speakeasy.totp.verify({
          secret: response.data.twoFactorSecret,
          encoding: "base32",
          token: String(req.body.code).trim(),
          window: 1,
        });

        if (!verified) {
          return reply
            .code(400)
            .send({ error: ["Invalid verification code"] });
        }

        await axios.post("https://auth-service:3001/set2FAValidate", {
          email: decoded.email,
          signal: true,
        });

        return reply
          .code(200)
          .send({ success: ["2FA verified successfully"] });
      }

      if (!req.session.canValidate) {
        req.session.error = ["You need to follow step by step"];
        delete req.session.canValidate;
        return reply.redirect("/home");
      }
      if (!req.body || !req.body.code) {
        req.session.error = ["You need to follow step by step"];
        return reply.redirect("/check2FAQrCode");
      }
      const token = req.cookies.jwt;
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      const response = await axios.post(
        "https://auth-service:3001/get2FASecret",
        { email: decoded.email }
      );
      if (!response.data.twoFactorSecret) {
        req.session.error = ["You cannot have 2FA activate"];
        return reply.redirect("/home");
      }

      const code = req.body.code;
      const twoFactorSecret = response.data.twoFactorSecret;
      const verified = speakeasy.totp.verify({
        secret: twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
      });

      if (!verified) {
        req.session.error = ["The code is incorrect. Try again"];
        return reply.redirect("/check2FAQrCode");
      }
      req.session.success = ["2FA passed successfully"];
      await axios.post("https://auth-service:3001/set2FAValidate", {
        email: decoded.email,
        signal: true,
      });
      return reply.redirect("/home");
    } catch (err) {
      console.error("Validate2FAQrCode Api-Gateway", err);
      req.session.error = [
        "An error happened trying to validate your 2FA Code",
      ];
      return reply.redirect("/home");
    }
  },

  upload: async function upload(req, reply) {
    const accept = req.headers?.accept || "";
    const wantsJson =
      accept.includes("application/json") ||
      req.headers?.["x-requested-with"] === "XMLHttpRequest";

    try {
      const file = await req.file();

      if (!file) {
        if (wantsJson) {
          return reply.code(400).send({ error: "You need to send an image" });
        }
        req.session.error = ["You need to send an image"];
        return reply.redirect("/home");
      }

      const uploadDir = path.join(__dirname, "..", "public", "uploads");

      await mkdir(uploadDir, { recursive: true });

      const allowed_extensions = [".png", ".webp", ".jpg", ".jpeg"];

      const user_id = req.user.user_id;
      const ext = path.extname(file.filename);

      if (!allowed_extensions.includes(ext)) {
        if (wantsJson) {
          return reply
            .code(415)
            .send({ error: "Forbidden extension detected" });
        }
        req.session.error = ["Forbidden extension detected"];
        return reply.redirect("/home");
      }

      // temporary file to check nsfw and also format it

      const filePath = path.join(uploadDir, `avatar_${user_id}.tmp`);

      await pipeline(file.file, fs.createWriteStream(filePath));

      const type = await fileTypeFromFile(filePath);

      if (!type || !type.mime.startsWith("image/")) {
        await unlink(filePath);
        if (wantsJson) {
          return reply
            .code(400)
            .send({ error: "The file is not a valid image" });
        }
        req.session.error = ["The file is not a valid image"];
        return reply.redirect("/home");
      }

      // api check starts here and erase the temporary file if fails
      const response = await checkImageSafety(filePath);

      // Innapropriate image
      if (response.nsfw) {
        await unlink(filePath); // destroy the innapropriate file
        if (wantsJson) {
          return reply.code(422).send({
            error: "Innapropriate image detected! Be careful choosing images!",
          });
        }
        req.session.error = [
          "Innapropriate image detected! Be careful choosing images!",
        ];
        return reply.redirect("/home");
      }

      // Corrupted image
      if (response.isError) {
        if (wantsJson) {
          return reply.code(400).send({ error: "Invalid image" });
        }
        req.session.error = ["Invalid image"];
        return reply.redirect("/home");
      }

      const avatarFile = path.join(uploadDir, `avatar_${user_id}.png`);

      // svg starts here and erase the temporary file, setting the new in the database, redirecting to the users' home

      await sharp(filePath)
        .resize(350, 350)
        .png()
        .composite([
          {
            input: Buffer.from(
              `<svg><circle cx="175" cy="175" r="175"/></svg>`
            ),
            blend: "dest-in",
          },
        ])
        .toFile(avatarFile);

      // erase the last temporary file

      await unlink(filePath);

      const avatarDb = `/public/uploads/avatar_${user_id}.png`;
      await axios.post("https://users-service:3003/setUserAvatar", {
        user_id: req.user.user_id,
        avatar: avatarDb,
      });

      if (wantsJson) {
        return reply.send({ success: true, avatar: avatarDb });
      }
      req.session.success = ["Upload successfully"];
      return reply.redirect("/home");
    } catch (err) {
      try {
        await unlink(`/app/public/uploads/avatar_${req.user.user_id}.tmp`);
      } catch {}

      console.error("API-GATEWAY upload error:", err);
      if (wantsJson) {
        return reply.code(500).send({ error: "Error in the upload process" });
      }
      req.session.error = ["Error in the upload process"];
      return reply.redirect("/home");
    }
  },

  changeUsername: async function changeUsername(req, reply) {
    const success = req.session.success ?? [];
    const error = req.session.error ?? [];

    delete req.session.success;
    delete req.session.error;

    return reply.view("changeUsername", { success, error });
  },

  changeNickname: async function changeNickname(req, reply) {
    const success = req.session.success ?? [];
    const error = req.session.error ?? [];

    delete req.session.success;
    delete req.session.error;

    return reply.view("changeNickname", { success, error });
  },

  changeEmail: async function changeEmail(req, reply) {
    const success = req.session.success ?? [];
    const error = req.session.error ?? [];

    delete req.session.success;
    delete req.session.error;

    return reply.view("changeEmail", { success, error });
  },

  changeDescription: async function changeDescription(req, reply) {
    const success = req.session.success ?? [];
    const error = req.session.error ?? [];

    delete req.session.success;
    delete req.session.error;

    return reply.view("changeDescription", { success, error });
  },

  setUserDescription: async function setUserDescription(req, reply) {
    try {
      if (!req.body || !req.body.description) {
        req.session.error = ["You need to fill all information"];
        return reply.redirect("/changeDescription");
      }
      req.body.user_id = req.user.user_id;
      await axios.post(
        "https://users-service:3003/setUserDescription",
        req.body
      );
      req.session.success = ["Description changed successfully"];
      return reply.redirect("/home");
    } catch (err) {
      console.error("API-GATEWAY setUserDescription Error:", err);
      req.session.error = ["Error setting your new description"];
      return reply.redirect("/changeDescription");
    }
  },

  changePassword: async function changePassword(req, reply) {
    const success = req.session.success ?? [];
    const error = req.session.error ?? [];

    delete req.session.success;
    delete req.session.error;

    return reply.view("changePassword", { success, error });
  },

  setAuthPassword: async function setAuthPassword(req, reply) {
    try {
      if (!req.body || !req.body.password || !req.body.confirmPassword) {
        req.session.error = ["You need to fill all input boxes"];
        return reply.redirect("/changeYourPassword");
      }
      if (req.body.confirmPassword !== req.body.password) {
        req.session.error = ["Password mismatch"];
        return reply.redirect("/changeYourPassword");
      }

      req.body.user_id = req.user.user_id;
      req.body.email = req.user.email;

      await axios.post("https://auth-service:3001/setAuthPassword", req.body);
      req.session.success = ["Password changed"];
      return reply.redirect("/home");
    } catch (err) {
      if (err?.response.status === 400) {
        req.session.error = [
          "You cannot change to the same password you have now",
        ];
        return reply.redirect("/changePassword");
      }
      console.error("setAuthPassword Api-gateway error:", err);
      req.session.error = ["Error trying to change your password"];
      return reply.redirect("/home");
    }
  },

  setAuthEmail: async function setAuthEmail(req, reply) {
    const accept = req.headers?.accept || "";
    const wantsJson =
      accept.includes("application/json") ||
      req.headers?.["x-requested-with"] === "XMLHttpRequest";

    try {
      if (!req.body || !req.body.email) {
        if (wantsJson) {
          return reply
            .code(400)
            .send({ error: ["You need to fill everything"] });
        }
        req.session.error = ["You need to fill everything"];
        return reply.redirect("/changeEmail");
      }

      req.body.user_id = req.user.user_id;
      req.body.username = req.user.username;
      if (req.body.email === req.user.email) {
        if (wantsJson) {
          return reply
            .code(400)
            .send({ error: ["Email is already in use"] });
        }
        req.session.error = ["Email is already in use"];
        return reply.redirect("/changeEmail");
      }

      const twoFaRes = await axios.post("https://auth-service:3001/get2FAEnable", {
        email: req.user.email,
      });
      const had2FA = twoFaRes?.data?.twoFactorEnable ?? false;

      await axios.post("https://auth-service:3001/setAuthEmail", req.body);

      await axios.post("https://users-service:3003/validateUserEmail", {
        email: req.body.email,
        user_id: req.user.user_id,
        stats: false,
      });

      if (had2FA) {
        await axios.post("https://auth-service:3001/set2FAOnOff", {
          user_id: req.user.user_id,
        });
      }

      await axios.post("https://auth-service:3001/set2FAValidate", {
        email: req.body.email,
        signal: false,
      });

      req.session.success = ["Email changed successfully"];

      const response = await axios.post(
        "https://auth-service:3001/createNewToken",
        req.body
      );

      const token = response?.data.token;

      if (!token) {
        if (wantsJson) {
          return reply.code(500).send({ error: ["Error recreating the jwt"] });
        }
        req.session.error = ["Error recreating the jwt"];
        return reply.redirect("/home");
      }

      const isProduction = process.env.NODE_ENV === "production";

      reply.setCookie("jwt", token, {
        httpOnly: true,
        secure: isProduction,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1h
      });

      if (wantsJson) {
        return reply.code(200).send({ success: true });
      }
      return reply.redirect("/home");
    } catch (err) {
      if (err?.response?.status === 409) {
        if (wantsJson) {
          return reply.code(409).send({ error: ["Email already in use"] });
        }
        req.session.error = ["Email already in use"];
        return reply.redirect("/changeEmail");
      }
      console.error("API-GATEWAY setAuthEmail error:", err);
      if (wantsJson) {
        return reply.code(500).send({ error: ["Error trying to change your email"] });
      }
      req.session.error = ["Error trying to change your email"];
      return reply.redirect("/changeEmail");
    }
  },

  setAuthNickname: async function setAuthNickname(req, reply) {
    const accept = req.headers?.accept || "";
    const wantsJson =
      accept.includes("application/json") ||
      req.headers?.["x-requested-with"] === "XMLHttpRequest";

    try {
      if (!req.body || !req.body.nickname) {
        if (wantsJson) {
          return reply
            .code(400)
            .send({ error: ["You need to fill everything"] });
        }
        req.session.error = ["You need to fill everything"];
        return reply.redirect("/changeNickname");
      }
      req.body.user_id = req.user.user_id;
      req.body.email = req.user.email;
      req.body.username = req.user.username;

      if (req.body.nickname.toLowerCase() === "system")
        throw new Error("You cannot use that nickname");

      await axios.post("https://auth-service:3001/setAuthNickname", req.body);

      req.session.success = ["Nickname changed successfully"];

      const response = await axios.post(
        "https://auth-service:3001/createNewToken",
        req.body
      );

      const token = response?.data.token;

      if (!token) {
        if (wantsJson) {
          return reply
            .code(500)
            .send({ error: ["Error recreating the jwt"] });
        }
        req.session.error = ["Error recreating the jwt"];
        return reply.redirect("/home");
      }

      const isProduction = process.env.NODE_ENV === "production";

      reply.setCookie("jwt", token, {
        httpOnly: true,
        secure: isProduction,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1h
      });

      if (wantsJson) {
        return reply.send({
          success: ["Nickname changed successfully"],
          token,
        });
      }

      return reply.redirect("/home");
    } catch (err) {
      if (err.message === "You cannot use that nickname") {
        if (wantsJson) {
          return reply.code(403).send({ error: ["Forbidden nickname"] });
        }
        req.session.error = ["Forbidden nickname"];
        return reply.redirect("/changeNickname");
      }
      console.error("API-GATEWAY setAuthNickname error:", err);
      if (wantsJson) {
        return reply
          .code(500)
          .send({ error: ["Error trying to change your nickname"] });
      }
      req.session.error = ["Error trying to change your nickname"];
      return reply.redirect("/home");
    }
  },

  setAuthUsername: async function setAuthUsername(req, reply) {
    const accept = req.headers?.accept || "";
    const wantsJson =
      accept.includes("application/json") ||
      req.headers?.["x-requested-with"] === "XMLHttpRequest";

    try {
      if (!req.body || !req.body.username) {
        if (wantsJson) {
          return reply
            .code(400)
            .send({ error: ["You need to fill everything"] });
        }
        req.session.error = ["You need to fill everything"];
        return reply.redirect("/changeUsername");
      }

      req.body.user_id = req.user.user_id;
      req.body.email = req.user.email;

      if (req.body.username.toLowerCase() === "system")
        throw new Error("You cannot use that username");

      await axios.post("https://auth-service:3001/setAuthUsername", req.body);

      req.session.success = ["Username changed successfully"];

      const response = await axios.post(
        "https://auth-service:3001/createNewToken",
        req.body
      );

      const token = response?.data.token;

      if (!token) {
        if (wantsJson) {
          return reply
            .code(500)
            .send({ error: ["Error recreating the jwt"] });
        }
        req.session.error = ["Error recreating the jwt"];
        return reply.redirect("/home");
      }

      const isProduction = process.env.NODE_ENV === "production";

      reply.setCookie("jwt", token, {
        httpOnly: true,
        secure: isProduction,
        path: "/",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1h
      });

      if (wantsJson) {
        return reply.send({
          success: ["Username changed successfully"],
          token,
        });
      }

      return reply.redirect("/home");
    } catch (err) {
      if (err.message === "You cannot use that username") {
        if (wantsJson) {
          return reply.code(403).send({ error: ["Forbidden username"] });
        }
        req.session.error = ["Forbidden username"];
        return reply.redirect("/changeUsername");
      }
      console.error("Api-Gateway setAuthUsername:", err);
      if (wantsJson) {
        return reply
          .code(500)
          .send({ error: ["Error during setting your new username"] });
      }
      req.session.error = ["Error during setting your new username"];
      return reply.redirect("/changeUsername");
    }
  },

  seeAllUsers: async function seeAllUsers(req, reply) {
    try {
      const success = req.session.success ?? [];
      const error = req.session.error ?? [];

      delete req.session.success;
      delete req.session.error;

      const response = await axios.get(
        "https://users-service:3003/getAllUsersInformation"
      );

      const users = response?.data ?? [];

      for (const user of users)
        user.state = getState(user);

      return reply.view("seeAllUsers", { success, error, users });
    } catch (err) {
      console.error("API-GATEWAY seeAllUsers:", err);
      req.session.error = ["Error opening the page to see all users"];
      return reply.redirect("/home");
    }
  },

  seeProfile: async function seeProfile(req, reply) {
    try {
      const { user } = req.query;
      const response = await axios.post(
        "https://users-service:3003/getDataByPublicId",
        { public_id: user }
      );
      const data = response?.data;

      console.log("User info: " +  JSON.stringify(data));

      data.state = getState(data);
      // const rank = await getRank(data);
      // data.rank = rank;

      return reply.view("publicProfile", { data });
    } catch (err) {
      console.error("API-GATEWAY seeProfile Error:", err);
      req.session.error = [
        "Error trying to see the profile of the target user",
      ];
      return reply.redirect("/home");
    }
  },

  chatAllUsers: async function chatAllUsers(req, reply) {
    try {
      const response = await axios.post(
        "https://users-service:3003/getUserInformation",
        { user_id: req.user.user_id }
      );
      return reply.view("chatAllUsers", {
        public_id: response?.data.public_id,
        username: req.user.username,
      });
    } catch (err) {
      console.error("API-GATEWAY chatAllUsers:", err);
      req.session.error = ["Error opening the chat"];
      return reply.redirect("/home");
    }
  },

  deleteUserAccount: async function deleteUserAccount(req, reply) {
    try {
      await axios.post("https://auth-service:3001/deleteUserAccount", {
        user_id: req.user.user_id,
      });
      await req.session.destroy();

      reply.clearCookie("jwt");
      reply.clearCookie("session");

      console.log("The account was successfully deleted");
      return reply.redirect("/login");
    } catch (err) {
      console.error("API-GATEWAY deleteUserAccount ERROR:", err);
      return reply.redirect("/login");
    }
  },

  blockTheUser: async function blockUserAccount(req, reply) {
    try {
      if (!req.body || !req.body.public_id) {
        req.session.error = ["An error happened trying to block the user"];
        return reply.redirect("/home");
      }
      req.body.user_id = req.user.user_id;
      const response = await axios.post(
        "https://users-service:3003/blockTheUser",
        req.body
      );
      if (response?.status === 201) req.session.success = ["Target blocked"];
      else req.session.success = ["Target user unblocked"];
      return reply.redirect("/home");
    } catch (err) {
      if (
        err?.response?.status === 403 ||
        err?.response?.message === "SAME_USER"
      ) {
        req.session.error = ["You cannot block yourself"];
        return reply.redirect("/home");
      }
      console.error("API-GATEWAY blockTheUser");
      req.session.error = ["Error trying to block the user"];
      return reply.redirect("/home");
    }
  },

  friendInvite: async function friendInvite(req, reply) {
    try {
      if (!req.body || !req.body.public_id) {
        req.session.error = ["An error happened trying to invite the user"];
        return reply.redirect("/home");
      }
      req.body.user_id = req.user.user_id;
      const response = await axios.post(
        "https://users-service:3003/friendInvite",
        req.body
      );
      if (response?.status === 201)
        req.session.success = ["Friend request sent successfully"];
      else
        req.session.success = [
          "You already sent the request, do not need another :)",
        ];
      return reply.redirect("/home");
    } catch (err) {
      if (
        err?.response?.data === "SAME_USER" ||
        err?.response?.status === 403
      ) {
        req.session.error = ["You cannot invite yourself as a friend"];
        return reply.redirect("/home");
      }
      console.error("API-GATEWAY friendInvite ERROR:", err);
      req.session.error = ["An error happened inviting the user as a friend"];
      return reply.redirect("/home");
    }
  },

  handlerFriendsPage: async function handlerFriendsPage(req, reply) {
    let success = req.session.success ?? [];
    let error = req.session.error ?? [];

    delete req.session.success;
    delete req.session.error;

    try {
      const response_friends = await axios.post(
        "https://users-service:3003/getAllFriends",
        { user_id: req.user.user_id }
      );
      const response_pendencies = await axios.post(
        "https://users-service:3003/getAllPendencies",
        { user_id: req.user.user_id }
      );

      return reply.view("handlerFriendsPage", {
        success,
        error,
        friends: response_friends?.data ?? [],
        pendings: response_pendencies?.data ?? [],
      });
    } catch (err) {
      console.error("API-GATEWAY handlerFriendsPage ERROR:", err);
      req.session.error = ["Error trying to opening the handlerFriendsPage"];
      return reply.redirect("/home");
    }
  },

  setAcceptFriend: async function setAcceptFriend(req, reply) {
    try {
      if (!req.body || !req.body.public_id) {
        req.session.error = ["Invalid action"];
        return reply.redirect("/handlerFriendsPage");
      }
      req.body.user_id = req.user.user_id;
      req.body.accept = true;
      await axios.post("https://users-service:3003/setAcceptFriend", req.body);
      req.session.success = ["Friend added successfully"];
      return reply.redirect("/handlerFriendsPage");
    } catch (err) {
      console.error("API-GATEWAY setAcceptFriend ERROR:", err);
      req.session.error = ["An error happened trying to accept that person"];
      return reply.redirect("/handlerFriendsPage");
    }
  },

  deleteAFriend: async function deleteAFriend(req, reply) {
    try {
      if (!req.body || !req.body.public_id) {
        req.session.error = ["Invalid action"];
        return reply.redirect("/handlerFriendsPage");
      }
      req.body.user_id = req.user.user_id;
      await axios.post("https://users-service:3003/deleteAFriend", req.body);
      req.session.success = ["User relation deleted successfully"];
      return reply.redirect("/handlerFriendsPage");
    } catch (err) {
      console.error("API-GATEWAY deleteAFriend ERROR:", err);
      req.session.error = [
        "An error happened trying to delete that person friendship",
      ];
      return reply.redirect("/handlerFriendsPage");
    }
  },

  directMessage: async function directMessages(req, reply) {
    try {
      if (!req.query || !req.query.public_id) {
        req.session.error = ["Error opening direct Messages Page"];
        return reply.redirect("/home");
      }

      const response = await axios.post(
        "https://users-service:3003/getUserInformation",
        { user_id: req.user.user_id }
      );
      return reply.view("chatDirectUsers", { target_id: req.query.public_id });
    } catch (err) {
      console.error("API-GATEWAY chatAllUsers ERROR:", err);
      req.session.error = ["Error opening the chat"];
      return reply.redirect("/home");
    }
  },

  set2FAOnOff: async function set2FAOnOff(req, reply) {
    const accept = req.headers?.accept || "";
    const wantsJson =
      accept.includes("application/json") ||
      req.headers?.["x-requested-with"] === "XMLHttpRequest";

    try {
      const result = await axios.post("https://auth-service:3001/set2FAOnOff", {
        user_id: req.user.user_id,
      });
      let enabled = false;
      let successMessage = "2FA status updated";
      if (result?.data.message === "2FA_ENABLED") {
        req.session.success = ["2FA enabled successfully"];
        enabled = true;
        successMessage = "2FA enabled successfully";
      } else if (result?.data.message === "2FA_DISABLED") {
        req.session.success = ["2FA disabled successfully"];
        enabled = false;
        successMessage = "2FA disabled successfully";
      }
      if (wantsJson) {
        return reply.code(200).send({
          enabled,
          message: result?.data?.message,
          success: [successMessage],
        });
      }
      return reply.redirect("/home");
    } catch (err) {
      console.error("API-GATEWAY set2FAOnOff");
      req.session.error = ["Error setting the new status of 2FA"];
      if (wantsJson) {
        return reply
          .code(500)
          .send({ error: ["Error setting the new status of 2FA"] });
      }
      return reply.redirect("/home");
    }
  },

  // JSON API Endpoints for Next.js frontend
  getProfileData: async function getProfileData(req, reply) {
    try {
      const { public_id } = req.query;
      if (!public_id) {
        return reply.status(400).send({ error: "public_id is required" });
      }
      const response = await axios.post(
        "https://users-service:3003/getDataByPublicId",
        { public_id }
      );
      const data = response?.data;
      data.state = getState(data);
      try {
        data.rank = await getRank(data);
      } catch (err) {
        console.error("API-GATEWAY getRank fallback:", err.message);
        data.rank = { rank: "UNRANKED", pts: 0 };
      }
      return reply.send(data);
    } catch (err) {
      console.error("API-GATEWAY getProfileData Error:", err.message);
      return reply.status(500).send({ error: "Error fetching profile data" });
    }
  },

  apiFriendInvite: async function apiFriendInvite(req, reply) {
    try {
      if (!req.body || !req.body.public_id) {
        return reply.status(400).send({ success: false, message: "public_id is required" });
      }
      req.body.user_id = req.user.user_id;
      await axios.post("https://users-service:3003/friendInvite", req.body);
      return reply.send({ success: true, message: "Friend invitation sent" });
    } catch (err) {
      if (err?.response?.status === 403 || err?.response?.data?.message === "SAME_USER") {
        return reply.status(403).send({ success: false, message: "You cannot add yourself as a friend" });
      }
      if (err?.response?.data?.message === "ALREADY_FRIENDS") {
        return reply.status(400).send({ success: false, message: "Already friends or invitation pending" });
      }
      console.error("API-GATEWAY apiFriendInvite Error:", err.message);
      return reply.status(500).send({ success: false, message: "Error sending friend invitation" });
    }
  },

  apiBlockUser: async function apiBlockUser(req, reply) {
    try {
      if (!req.body || !req.body.public_id) {
        return reply.status(400).send({ success: false, message: "public_id is required" });
      }
      req.body.user_id = req.user.user_id;
      const response = await axios.post(
        "https://users-service:3003/blockTheUser",
        req.body
      );
      const blocked = response?.status === 201;
      return reply.send({
        success: true,
        blocked,
        message: blocked ? "User blocked" : "User unblocked"
      });
    } catch (err) {
      if (err?.response?.status === 403 || err?.response?.data?.message === "SAME_USER") {
        return reply.status(403).send({ success: false, message: "You cannot block yourself" });
      }
      console.error("API-GATEWAY apiBlockUser Error:", err.message);
      return reply.status(500).send({ success: false, message: "Error blocking/unblocking user" });
    }
  },
};

export default privateControllers;
