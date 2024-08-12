import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getJobs(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/companies/:companyId/jobs',
      {
        schema: {
          tags: ['Jobs'],
          summary: 'Get all jobs for a company',
          security: [{ bearerAuth: [] }],
          params: z.object({
            companyId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              jobs: z.array(
                z.object({
                  id: z.number().int(),
                  title: z.string(),
                  description: z.string(),
                  pay: z.number(),
                  location: z.string(),
                  benefits: z.string(),
                  resume: z.array(z.string()),
                  createdAt: z.string().datetime(),
                  updatedAt: z.string().datetime(),
                  companyId: z.string().uuid(),
                  company: z.object({
                    id: z.string().uuid(),
                    name: z.string().nullable(),
                    email: z.string().email().nullable(),
                    avatarUrl: z.string().url().nullable(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { companyId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'Job')) {
          throw new UnauthorizedError(
            'You are not allowed to see jobs for this company.',
          )
        }

        const jobs = await prisma.job.findMany({
          select: {
            id: true,
            title: true,
            description: true,
            benefits: true,
            location: true,
            pay: true,
            resume: true,
            createdAt: true,
            updatedAt: true,
            companyId: true,
            company: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            companyId: companyId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        const formattedJobs = jobs.map((job) => ({
          ...job,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
        }))

        return reply.send({ jobs: formattedJobs })
      },
    )
}
