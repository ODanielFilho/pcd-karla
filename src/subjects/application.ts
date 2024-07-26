import { z } from 'zod'

import { applicationSchema } from '../models/application'

export const applicationSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('update'),
    z.literal('read'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Application'), applicationSchema]),
])

export type ApplicationSubject = z.infer<typeof applicationSubject>
