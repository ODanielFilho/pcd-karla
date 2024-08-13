import z from 'zod'

export const jobResumeSchema = z.object({
  title: z.string(),
  description: z.string(),
  jobId: z.number().int(),
  __typename: z.literal('JobResume'),
})

export type JobResume = z.infer<typeof jobResumeSchema>
