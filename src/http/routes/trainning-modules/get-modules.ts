import { UserRole } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getModules(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings/:trainningId/modules',
      {
        schema: {
          tags: ['Modules'],
          summary: 'Get Trainning Modules',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
          }),
          response: {
            201: z.object({
              modules: z.array(
                z.object({
                  id: z.number(),
                  title: z.string(),
                  createdAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { trainningId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('create', 'Module')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError(
            "You're not allowed to create new modules.",
          )
        }

        const modules = await prisma.module.findMany({
          select: {
            id: true,
            title: true,
            createdAt: true,
          },
          where: {
            trainningId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        const formattedModules = modules.map((module) => ({
          ...module,
          createdAt: new Date(module.createdAt),
        }))
        return reply.status(201).send({ modules: formattedModules })
      },
    )
}
