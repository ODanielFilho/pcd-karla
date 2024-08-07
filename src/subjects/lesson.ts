import z from 'zod'
import { lessonSchema } from '../models/lesson'

export const lessonSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('update'),
    z.literal('read'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Lesson'), lessonSchema]),
])

export type LessonSubject = z.infer<typeof lessonSubject>
