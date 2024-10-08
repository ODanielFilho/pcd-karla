import { z } from 'zod'

import { roleSchema } from '../roles'

export const userSchema = z.object({
  id: z.string(),
  role: roleSchema,
  companyJobIds: z.array(z.string()).optional(),
})

export type User = z.infer<typeof userSchema>
