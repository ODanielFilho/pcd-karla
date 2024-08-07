import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateModule(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/trainnings/:trainningId/:moduleId',
      {
        schema: {
          tags: ['Modules'],
          summary: 'Update a module',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
          }),
          body: z.object({
            title: z.string(),
          }),
          response: {
            200: z.object({
              moduleId: z.number(),
              title: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { trainningId, moduleId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        const trainning = await prisma.trainning.findUnique({
          where: { id: trainningId },
        })

        if (cannot('update', 'Module')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError(
            "You're not allowed to update new modules.",
          )
        }

        if (trainning?.teacherId !== userId) {
          throw new UnauthorizedError(
            `You're not allowed to update this module.`,
          )
        }

        const { title } = request.body

        const updatedModule = await prisma.module.update({
          where: {
            id: moduleId,
          },
          data: {
            title,
          },
        })
        return reply.status(200).send({
          moduleId: updatedModule.id,
          title: updatedModule.title,
          createdAt: updatedModule.createdAt,
          updatedAt: updatedModule.updatedAt,
        })
      },
    )
}
