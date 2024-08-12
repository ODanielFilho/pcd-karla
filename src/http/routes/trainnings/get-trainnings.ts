import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getTrainnings(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings/:teacherId/trainnings',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'Get all trainnings for a teacher',
          security: [{ bearerAuth: [] }],
          params: z.object({
            teacherId: z.string().uuid(),
          }),
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
                  content: z.string().uuid(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { teacherId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'Trainning')) {
          throw new UnauthorizedError(
            'You are not allowed to see trainnings for this teacher.',
          )
        }

        const trainnings = await prisma.trainning.findMany({
          select: {
            id: true,
            title: true,
            format: true,
            image: true,
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
            teacherId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        const formattedTrainnings = trainnings.map((trainning) => ({
          ...trainning,
          date: trainning.date.toISOString(),
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
