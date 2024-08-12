import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getAllJobs(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/jobs',
    {
      schema: {
        tags: ['Jobs'],
        summary: 'Get all jobs',
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
      const jobs = await prisma.job.findMany({
        include: {
          company: true, // Inclui as informações da empresa relacionada
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
