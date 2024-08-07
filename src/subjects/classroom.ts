import { z } from 'zod'

import { classroomSchema } from '../models/classroom'

export const classroomSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('update'),
    z.literal('create'),
    z.literal('read'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Classroom'), classroomSchema]),
])

export type ClassroomSubject = z.infer<typeof classroomSubject>
