import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function listUserApplications(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/applications',
      {
        schema: {
          tags: ['Applications'],
          summary: 'List user applications',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              applications: z.array(
                z.object({
                  id: z.string().uuid(),
                  jobId: z.string(),
                  userId: z.string(),
                  createdAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        // Obtém o ID do usuário autenticado
        const userId = await request.getCurrentUserId()

        // Verifica se o usuário está autenticado
        if (!userId) {
          throw new UnauthorizedError('User is not authenticated.')
        }

        // Busca as aplicações do usuário autenticado
        const applications = await prisma.application.findMany({
          where: { userId },
          select: {
            id: true,
            jobId: true,
            userId: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        // Retorna as aplicações encontradas
        return reply.send({ applications })
      },
    )
}
