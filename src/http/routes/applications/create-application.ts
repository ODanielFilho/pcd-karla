import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createApplication(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/applications',
      {
        schema: {
          tags: ['Applications'],
          summary: 'Create a new application',
          security: [{ bearerAuth: [] }],
          body: z.object({
            userId: z.string(),
            jobId: z.string(),
          }),
          response: {
            201: z.object({
              applicationId: z.string().uuid(),
            }),
          },
        },
      },

      async (request, reply) => {
        const userRole: UserRole = await request.getUserRole()

        const { userId, jobId } = request.body
        const { cannot } = getUserPermissions(userId, userRole)
        if (cannot('manage', 'Application')) {
          throw new UnauthorizedError(
            'You are not allowed to create new applications.',
          )
        }
        const application = await prisma.application.create({
          data: {
            userId,
            jobId,
          },
        })

        return reply.status(201).send({
          applicationId: application.id,
        })
      },
    )
}
