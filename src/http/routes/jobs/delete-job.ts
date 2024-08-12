import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteJob(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/jobs/:jobId',
      {
        schema: {
          tags: ['Jobs'],
          summary: 'Delete a job',
          security: [{ bearerAuth: [] }],
          params: z.object({
            jobId: z.number().int(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { jobId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('delete', 'Job')) {
          throw new UnauthorizedError('You are not allowed to delete this job.')
        }

        const job = await prisma.job.delete({
          select: {
            id: true,
            title: true,
            description: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            id: jobId,
          },
        })

        if (!job) {
          throw new BadRequestError('Job not found.')
        }

        return reply.status(204).send()
      },
    )
}
