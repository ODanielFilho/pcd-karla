import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getTrainning(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/trainnings/:trainningId',
    {
      schema: {
        tags: ['Trainnings'],
        summary: 'Get trainning details',
        params: z.object({
          trainningId: z.string(),
        }),
        response: {
          200: z.object({
            trainning: z.object({
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
              teacherId: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { trainningId } = request.params

      const trainning = await prisma.trainning.findUnique({
        select: {
          id: true,
          image: true,
          title: true,
          format: true,
          duration: true,
          timeconclusion: true,
          intended: true,
          certificate: true,
          date: true,
          teacherLink: true,
          objective: true,
          about: true,
          trail: true,
          content: true,
          teacherId: true,
        },
        where: {
          id: parseInt(trainningId),
        },
      })

      if (!trainning) {
        throw new BadRequestError('trainning not found.')
      }

      if (!trainning) {
        throw new BadRequestError('Trainning not found.')
      }

      const formattedTrainning = {
        ...trainning,
        date: trainning.date.toISOString(),
        format: trainning.format as 'ONLINE' | 'IN_PERSON' | 'HYBRID',
      }

      return reply.send({
        trainning: {
          ...formattedTrainning,
          image: formattedTrainning.image ?? undefined,
        },
      })
    },
  )
}
