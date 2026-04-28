'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import { SignupSchema, LoginSchema, FormState } from '@/lib/definitions'

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const validated = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, password } = validated.data
  const hashedPassword = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { errors: { email: ['An account with this email already exists.'] } }
  }

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  })

  await createSession(user.id)
  redirect('/dashboard')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { errors: { email: ['Invalid email or password.'] } }
  }

  await createSession(user.id)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
