import { z } from 'zod';

// Match backend validation exactly: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

// Match backend validation exactly: /^[a-zA-Z0-9._-]{3,20}$/
const usernameRegex = /^[a-zA-Z0-9._-]{3,20}$/;

export const loginSchema = z.object({
  email: z.string().email('Invalid e-mail'),
  password: z.string().min(1, 'Password must be a string'),
});

export const signupSchema = z.object({
  username: z.string()
    .min(3, 'Invalid username')
    .max(20, 'Invalid username')
    .regex(usernameRegex, 'Invalid username'),
  email: z.string().email('Invalid e-mail'),
  password: z
    .string()
    .min(8, 'Password must contain eight or more characters')
    .regex(passwordRegex, 'Password must have numbers, letters, special characters'),
  confirmPassword: z
    .string()
    .min(8, 'Password must contain eight or more characters')
    .regex(passwordRegex, 'Password must have numbers, letters, special characters'),
  nickname: z
    .string()
    .min(3, 'Invalid nickname')
    .max(20, 'Invalid nickname')
    .regex(usernameRegex, 'Invalid nickname')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// Profile update schemas
export const changeUsernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(usernameRegex, 'Username can only contain letters, numbers, dots, dashes and underscores'),
});

export const changeEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must contain eight or more characters')
    .regex(passwordRegex, 'Password must have uppercase, lowercase, numbers, and special characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changeNicknameSchema = z.object({
  nickname: z.string()
    .min(3, 'Nickname must be at least 3 characters')
    .max(20, 'Nickname must be at most 20 characters')
    .regex(usernameRegex, 'Nickname can only contain letters, numbers, dots, dashes and underscores'),
});

export const changeDescriptionSchema = z.object({
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
    .or(z.literal('')),
});

export type ChangeUsernameInput = z.infer<typeof changeUsernameSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ChangeNicknameInput = z.infer<typeof changeNicknameSchema>;
export type ChangeDescriptionInput = z.infer<typeof changeDescriptionSchema>;
