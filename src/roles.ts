import { z } from 'zod'

export const roleSchema = z.union([
  z.literal('ADMIN'),
  z.literal('COMPANY'),
  z.literal('CANDIDATE'),
])

export type Role = z.infer<typeof roleSchema>
