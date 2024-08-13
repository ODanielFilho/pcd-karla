import z from 'zod'
import { jobResumeSchema } from '../models/job-resume'

export const jobResumeSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('JobResume'), jobResumeSchema]),
])

export type JobResumeSubject = z.infer<typeof jobResumeSubject>
