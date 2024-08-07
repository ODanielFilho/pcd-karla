import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteModule(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/trainnings/:trainningId/:moduleId',
      {
        schema: {
          tags: ['Modules'],
          summary: 'delete module',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { trainningId, moduleId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('delete', 'Module')) {
          throw new UnauthorizedError('You are not allowed to see this module.')
        }

        const module = await prisma.module.delete({
          select: {
            id: true,
            title: true,
          },
          where: {
            id: moduleId,
          },
        })

        if (!module) {
          throw new BadRequestError('Module not found.')
        }

        return reply.status(204).send()
      },
    )
}
