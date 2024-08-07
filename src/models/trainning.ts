import z from 'zod'

export const trainningSchema = z.object({
  id: z.number(),
  imageUrl: z.string().optional(),
  format: z.string(),
  duration: z.string(),
  timeconclusion: z.string(),
  intended: z.string(),
  certificate: z.string(),
  location: z.string().optional(),
  date: z.date(),
  teacherLink: z.string(),
  objective: z.string(),
  about: z.string(),
  aboutHeader: z.string().optional(),
  trail: z.array(z.string()),
  like: z.boolean().optional(),
  content: z.string(),
  teacherId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  __typename: z.literal('Trainning'),
})
export type Trainning = z.infer<typeof trainningSchema>
