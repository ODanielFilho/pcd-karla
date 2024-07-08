import { UserRole } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { createSlug } from '../../../utils/create-slug'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createJob(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/jobs',
      {
        schema: {
          tags: ['Jobs'],
          summary: 'Create a new job',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string(),
            description: z.string(),
          }),
          response: {
            201: z.object({
              jobId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('create', 'Job')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError("You're not allowed to create new jobs.")
        }

        const { title, description } = request.body

        const job = await prisma.job.create({
          data: {
            title,
            slug: createSlug(title),
            description,
            companyId: userId,
          },
        })

        return reply.status(201).send({
          jobId: job.id,
        })
      },
    )
}
