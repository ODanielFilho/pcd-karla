import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getAllTrainnings(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'Get all trainnings',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              trainnings: z.array(
                z.object({
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
                  teacherId: z.string().uuid(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'Trainning')) {
          throw new UnauthorizedError(
            'You are not allowed to see the trainnings.',
          )
        }

        const trainnings = await prisma.trainning.findMany()

        const formattedTrainnings = trainnings.map((trainning) => ({
          ...trainning,
          date: trainning.date.toISOString(),
          imageUrl: trainning.imageUrl || undefined,
          location: trainning.location || undefined,
          aboutHeader: trainning.aboutHeader || undefined,
          format: trainning.format as 'ONLINE' | 'IN_PERSON' | 'HYBRID',
        }))

        return reply.send({ trainnings: formattedTrainnings })
      },
    )
}
