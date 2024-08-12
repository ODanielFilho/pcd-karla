import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteTrainning(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/trainnings/:trainningId',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'delete trainning',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.string(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { trainningId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('delete', 'Trainning')) {
          throw new UnauthorizedError(
            'You are not allowed to see this trainning.',
          )
        }

        const trainning = await prisma.trainning.delete({
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
            id: parseInt(trainningId),
          },
        })

        if (!trainning) {
          throw new BadRequestError('trainning not found.')
        }

        if (!trainning) {
          throw new BadRequestError('Trainning not found.')
        }

        return reply.status(204).send()
      },
    )
}
