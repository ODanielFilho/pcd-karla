import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getAllNews(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/news',
      {
        schema: {
          tags: ['News'],
          summary: 'Get all news',
          response: {
            200: z.object({
              news: z.array(
                z.object({
                  id: z.string().uuid(),
                  title: z.string(),
                  imageUrl: z.string().nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'News')) {
          throw new UnauthorizedError('You are not allowed to see news.')
        }

        const news = await prisma.news.findMany()

        reply.status(200).send({ news })
      },
    )
}
