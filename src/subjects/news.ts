import z from 'zod'
import { newsSchema } from '../models/news'

export const newsSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('News'), newsSchema]),
])

export type NewsSubject = z.infer<typeof newsSubject>
