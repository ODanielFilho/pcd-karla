import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'



export async function updateJob(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/jobs/:jobId',
      {
        schema: {
          tags: ['Jobs'],
          summary: 'Update a job',
          security: [{ bearerAuth: [] }],
          params: z.object({
            jobId: z.string().uuid(),
          }),
          body: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
          }),
          response: {
            200: z.object({
              id: z.string().uuid(),
              title: z.string(),
              description: z.string(),
              createdAt: z.string().datetime(),
              updatedAt: z.string().datetime(),
              companyId: z.string().uuid(),
            }),
            404: z.object({ 
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { jobId } = request.params
        const { title, description } = request.body
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('update', 'Job')) {
          throw new UnauthorizedError(`You're not allowed to update jobs.`)
        }

        const job = await prisma.job.findUnique({
          where: { id: jobId },
        })

        if (!job) {
          return reply.status(404).send({ message: 'Job not found.' })
        }

        if (job.companyId !== userId && userRole !== 'ADMIN') {
          throw new UnauthorizedError(
            `You're not allowed to update this job.`,
          )
        }

        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data: {
            title: title || job.title,
            description: description || job.description,
          },
        })

        const formattedJob = {
          ...updatedJob,
          createdAt: updatedJob.createdAt.toISOString(),
          updatedAt: updatedJob.updatedAt.toISOString(),
        }

        return reply.send(formattedJob)
      },
    )
}
