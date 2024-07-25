import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteApplication(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/applications/:applicationId',
      {
        schema: {
          tags: ['Applications'],
          summary: 'Delete an application',
          description: 'Delete an application',
          security: [{ bearerAuth: [] }],
          params: z.object({
            applicationId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { applicationId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()
        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('delete', 'Application')) {
          throw new UnauthorizedError(
            'You are not allowed to delete this application.',
          )
        }

        const application = await prisma.application.delete({
          select: {
            id: true,
            jobId: true,
            userId: true,
          },
          where: {
            id: applicationId,
          },
        })

        if (!application) {
          throw new BadRequestError('Application not found.')
        }

        return reply.status(204).send()
      },
    )
}
