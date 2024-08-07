import z from 'zod'

export const classroomSchema = z.object({
  id: z.bigint(),
  studentId: z.string(),
  trainningId: z.bigint(),
  createdAt: z.date(),
  updatedAt: z.date(),
  __typename: z.literal('Classroom'),
})

export type Classroom = z.infer<typeof classroomSchema>
