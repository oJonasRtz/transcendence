import { z } from 'zod';

// Match backend validation exactly: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

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
  nickname: z
    .string()
    .min(3, 'Invalid nickname')
    .max(20, 'Invalid nickname')
    .regex(usernameRegex, 'Invalid nickname')
    .optional()
    .or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
