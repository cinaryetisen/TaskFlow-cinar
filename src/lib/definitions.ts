import { z } from 'zod'

export const SignupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .trim(),
})

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z.string().min(1, { message: 'Password is required.' }).trim(),
})

export type FormState =
  | {
      errors?: Record<string, string[]>
      message?: string
    }
  | undefined
