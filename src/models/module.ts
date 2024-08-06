import z from 'zod'

export const moduleSchema = z.object({
  id: z.bigint(),
  title: z.string(),
  teazherId: z.string(),
  trainningId: z.bigint(),
  createdAt: z.date(),
  updatedAt: z.date(),
  __typename: z.literal('Module'),
})

export type Module = z.infer<typeof moduleSchema>
