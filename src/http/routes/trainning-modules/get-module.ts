import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getModule(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings/:trainningId/:moduleId',
      {
        schema: {
          tags: ['Modules'],
          summary: 'Get module details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
          }),
          response: {
            200: z.object({
              module: z.object({
                id: z.number(),
                title: z.string(),
                createdAt: z.date(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { trainningId, moduleId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'Module')) {
          throw new UnauthorizedError('You are not allowed to see this module.')
        }

        const module = await prisma.module.findUnique({
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          where: {
            id: moduleId,
          },
        })

        if (!trainningId) {
          throw new BadRequestError('trainning not found.')
        }

        if (!module) {
          throw new BadRequestError('module not found.')
        }

        const formattedModule = {
          ...module,
          createdAt: new Date(module.createdAt),
        }

        return reply.send({ module: formattedModule })
      },
    )
}
