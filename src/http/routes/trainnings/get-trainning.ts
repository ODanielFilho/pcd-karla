import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getTrainning(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings/:trainningId',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'Get trainning details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
          }),
          response: {
            200: z.object({
              trainning: z.object({
                id: z.number(),
                title: z.string(),
                imageUrl: z.string().url().optional(),
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
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'Trainning')) {
          throw new UnauthorizedError(
            'You are not allowed to see this trainning.',
          )
        }

        const trainning = await prisma.trainning.findUnique({
          select: {
            id: true,
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
            id: trainningId,
          },
        })

        if (!trainningId) {
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

        return reply.send({ trainning: formattedTrainning })
      },
    )
}
