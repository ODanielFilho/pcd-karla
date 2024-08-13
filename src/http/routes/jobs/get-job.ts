import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { BadRequestError } from '../_errors/bad-request-error'

export async function getJob(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/jobs/:jobId',
    {
      schema: {
        tags: ['Jobs'],
        summary: 'Get job details',
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
