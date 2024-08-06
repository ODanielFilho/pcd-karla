import z from 'zod'
import { trainningSchema } from '../models/trainning'

export const trainningSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('get'),
    z.literal('create'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Trainning'), trainningSchema]),
])

export type TrainningSubject = z.infer<typeof trainningSubject>
