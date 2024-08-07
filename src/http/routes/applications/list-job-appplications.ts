import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function listJobApplications(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/companies/jobs/:jobId/applications',
      {
        schema: {
          tags: ['Applications'],
          summary: 'List applications for a specific job',
          security: [{ bearerAuth: [] }],
          params: z.object({
            jobId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              applications: z.array(
                z.object({
                  user: z.object({
                    name: z.string().nullable(),
                    email: z.string(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        // Obtém as permissões do usuário
        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('read', 'Application')) {
          throw new UnauthorizedError(
            'You are not authorized to view these applications.',
          )
        }

        const { jobId } = request.params

        const job = await prisma.job.findUnique({
          where: {
            id: jobId,
            companyId: userId,
          },
        })

        if (!job) {
          throw new UnauthorizedError(
            "You do not have access to this job's applications.",
          )
        }

        // Busca as aplicações para o emprego específico
        const applications = await prisma.application.findMany({
          where: {
            jobId: jobId,
          },
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return reply.send({ applications })
      },
    )
}
