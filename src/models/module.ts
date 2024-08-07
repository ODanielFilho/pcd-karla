import z from 'zod'

export const moduleSchema = z.object({
  id: z.number(),
  title: z.string(),
  teacherId: z.string(),
  trainningId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  __typename: z.literal('Module'),
})

export type Module = z.infer<typeof moduleSchema>
