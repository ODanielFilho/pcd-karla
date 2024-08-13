import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getAllTrainnings(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    // {{ edit_1 }} Removido o middleware de autenticação
    .get(
      '/trainnings',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'Get all trainnings',
          response: {
            200: z.object({
              trainnings: z.array(
                z.object({
                  id: z.number(),
                  title: z.string(),
                  image: z.string().url().optional(),
                  format: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
                  duration: z.string(),
                  timeconclusion: z.string(),
                  intended: z.string(),
                  certificate: z.string(),
                  location: z.string().optional(),
                  date: z.string().datetime(),
                  teacherLink: z.string(),
                  objective: z.string(),
                  about: z.string(),
                  aboutHeader: z.string().optional(),
                  trail: z.array(z.string()),
                  content: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const trainnings = await prisma.trainning.findMany()

        const formattedTrainnings = trainnings.map((trainning) => ({
          ...trainning,
          date: trainning.date.toISOString(),
          imageUrl: trainning.image || undefined,
          location: trainning.location || undefined,
          aboutHeader: trainning.aboutHeader || undefined,
          format: trainning.format as 'ONLINE' | 'IN_PERSON' | 'HYBRID',
        }))

        return reply.send({
          trainnings: formattedTrainnings.map((trainning) => ({
            ...trainning,
            image: trainning.image || undefined,
          })),
        })
      },
    )
}
