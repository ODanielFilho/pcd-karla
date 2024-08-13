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
          trainningId: z.string().refine((id) => !isNaN(Number(id)), {
            message: 'trainningId must be a number',
          }), // Validar que trainningId seja um número válido
        }),
        response: {
          200: z.object({
            trainning: z.object({
              id: z.number(),
              title: z.string(),
              image: z.string().url().nullable(),
              format: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
              duration: z.string(),
              timeconclusion: z.string(),
              intended: z.string(),
              certificate: z.string(),
              location: z.string(),
              date: z.string().datetime(),
              teacherLink: z.string(),
              objective: z.string(),
              about: z.string(),
              aboutHeader: z.string(),
              trail: z.array(z.string()),
              content: z.string(),
              teacherId: z.string(),
              teacherName: z.string(), // Adicionar o nome do professor à resposta
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
          aboutHeader: true,
          location: true,
          objective: true,
          about: true,
          trail: true,
          content: true,
          teacherId: true,
        },
        where: {
          id: parseInt(trainningId), // Verificamos se é um número válido
        },
      })

      if (!trainning) {
        throw new BadRequestError('Trainning not found.')
      }

      const teacher = await prisma.user.findUnique({
        select: {
          name: true,
        },
        where: {
          id: trainning.teacherId, // Usar o teacherId do treinamento para buscar o nome do professor
        },
      })

      if (!teacher) {
        throw new BadRequestError('Teacher not found.')
      }

      const formattedTrainning = {
        ...trainning,
        date: trainning.date.toISOString(),
        image: trainning.image || '',
        format: trainning.format as 'ONLINE' | 'IN_PERSON' | 'HYBRID', // Garantir o tipo correto
        teacherName: teacher.name, // Adicionar o nome do professor à resposta
      }
      return reply.send({
        trainning: {
          ...formattedTrainning,
          aboutHeader: formattedTrainning.aboutHeader || '',
          teacherName: formattedTrainning.teacherName || '',
        },
      })
    },
  )
}
