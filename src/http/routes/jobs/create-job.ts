import { UserRole } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
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
            pay: z.number(),
            location: z.string(),
            benefits: z.string(),
            resume: z.array(
              z.object({
                title: z.string(),
                description: z.string(),
              }),
            ),
          }),
          response: {
            201: z.object({
              jobId: z.number().int(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('create', 'Job')) {
          throw new UnauthorizedError("You're not allowed to create new jobs.")
        }

        const { title, description, benefits, location, pay, resume } =
          request.body

        const job = await prisma.job.create({
          data: {
            title,
            description,
            companyId: userId,
            benefits,
            location,
            pay,
            resume: {
              create: resume.map((r) => ({
                title: r.title,
                description: r.description,
              })),
            },
          },
        })

        return reply.status(201).send({
          jobId: job.id,
        })
      },
    )
}
