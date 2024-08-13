import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getJob(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/jobs/:jobId',
      {
        schema: {
          tags: ['Jobs'],
          summary: 'Get job details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            jobId: z.string(),
          }),
          response: {
            200: z.object({
              job: z.object({
                id: z.number().int(),
                title: z.string(),
                description: z.string(),
                pay: z.number(),
                location: z.string(),
                benefits: z.string(),
                resume: z.array(z.string()),
                companyId: z.string().uuid(),
                company: z.object({
                  name: z.string().nullable(),
                  avatarUrl: z.string().url().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { jobId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'Job')) {
          throw new UnauthorizedError('You are not allowed to see this job.')
        }

        const job = await prisma.job.findUnique({
          select: {
            id: true,
            title: true,
            description: true,
            benefits: true,
            location: true,
            pay: true,
            resume: true,
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
            id: parseInt(jobId, 10),
          },
        })

        if (!job) {
          throw new BadRequestError('Job not found.')
        }

        return reply.send({ job })
      },
    )
}
