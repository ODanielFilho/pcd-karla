import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getUserTrainings(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/users/:userId/trainings',
      {
        schema: {
          tags: ['Classrooms'],
          summary: 'List trainings for a specific user',
          security: [{ bearerAuth: [] }],
          params: z.object({
            userId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              trainings: z.array(
                z.object({
                  id: z.number(),
                  title: z.string(),
                  description: z.string().optional(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const requesterId = await request.getCurrentUserId()
        const requesterRole = await request.getUserRole()

        const { userId } = request.params
        const { cannot } = getUserPermissions(requesterId, requesterRole)

        if (cannot('get', 'Trainning')) {
          throw new UnauthorizedError(
            'You are not allowed to view this information.',
          )
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        const trainings = await prisma.trainning.findMany({
          where: {
            students: {
              some: {
                id: userId,
              },
            },
          },
          select: {
            id: true,
            title: true,
          },
        })

        return reply.status(200).send({
          trainings,
        })
      },
    )
}
