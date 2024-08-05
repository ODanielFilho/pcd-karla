import z from 'zod'

export const newsSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().nullable(),
  publisherId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  __typename: z.literal('News'),
})

export type News = z.infer<typeof newsSchema>
