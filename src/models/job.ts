import { z } from 'zod'

export const jobSchema = z.object({
  title: z.string(),
  description: z.string(),
  pay: z.number(),
  location: z.string(),
  benefits: z.string(),
  resume: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    }),
  ),
  companyId: z.string(),
  __typename: z.literal('Job'),
})
export type job = z.infer<typeof jobSchema>
