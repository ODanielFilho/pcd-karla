import z from 'zod'

export const lessonSchema = z.object({
  id: z.bigint(),
  title: z.string(),
  link: z.string(),
  description: z.string(),
  teacherId: z.string(),
  trainningId: z.bigint(),
  moduleId: z.bigint(),
  createdAt: z.date(),
  updatedAt: z.date(),
  __typename: z.literal('Lesson'),
})

export type Module = z.infer<typeof lessonSchema>
