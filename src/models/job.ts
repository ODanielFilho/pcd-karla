import { z } from 'zod'

export const jobSchema = z.object({
  title: z.string(),
  description: z.string(),
  companyId: z.string(),
  __typename: z.literal('Job'),
})
export type job = z.infer<typeof jobSchema>
