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
            pay: z.number().optional(),
            location: z.string().optional(),
            benefits: z.string().optional(),
            resume: z.array(z.string()).optional(),
          }),
          response: {
            200: z.object({
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
            }),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { jobId } = request.params
        const { title, description, benefits, location, pay } = request.body
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('update', 'Job')) {
          throw new UnauthorizedError(`You're not allowed to update jobs.`)
        }

        const id = parseInt(jobId, 10)
        const job = await prisma.job.findUnique({
          where: { id },
        })

        if (!job) {
          return reply.status(404).send({ message: 'Job not found.' })
        }

        if (job.companyId !== userId && userRole !== 'ADMIN') {
          throw new UnauthorizedError(`You're not allowed to update this job.`)
        }

        const updatedJob = await prisma.job.update({
          where: { id },
          data: {
            title: title || job.title,
            description: description || job.description,
            benefits: benefits || job.benefits,
            pay: pay || job.pay,
            location: location || job.location,
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
