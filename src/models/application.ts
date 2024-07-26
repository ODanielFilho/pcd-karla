import { z } from 'zod'

export const applicationSchema = z.object({
  applicationId: z.string().uuid(),
  userId: z.string().uuid(),
  jobId: z.string().uuid(),
  __typename: z.literal('Application'),
})

export type Application = z.infer<typeof applicationSchema>
