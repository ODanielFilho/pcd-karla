import { z } from 'zod'

import { jobSchema } from '../models/job'

export const jobSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Job'), jobSchema]),
])

export type JobSubject = z.infer<typeof jobSubject>
