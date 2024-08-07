import { UserRole } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createModule(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/trainnings/:trainningId',
      {
        schema: {
          tags: ['Modules'],
          summary: 'Create a new module for a trainning',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
          }),
          body: z.object({
            title: z.string(),
          }),
          response: {
            201: z.object({
              moduleId: z.number(),
              title: z.string(),
              createdAt: z.date(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('create', 'Module')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError(
            "You're not allowed to create new modules.",
          )
        }

        const { title } = request.body
        const { trainningId } = request.params
        const module = await prisma.module.create({
          data: {
            title,
            trainningId,
            teacherId: userId,
          },
        })
        return reply.status(201).send({
          moduleId: module.id,
          title: module.title,
          createdAt: module.createdAt,
        })
      },
    )
}
