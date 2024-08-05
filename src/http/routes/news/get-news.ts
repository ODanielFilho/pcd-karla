import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getNews(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/news/:newsId',
      {
        schema: {
          tags: ['News'],
          summary: 'Get news',
          security: [{ bearerAuth: [] }],
          params: z.object({
            newsId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              news: z.object({
                id: z.string().uuid(),
                title: z.string(),
                content: z.string(),
                imageUrl: z.string().nullable(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)
        const { newsId } = request.params as { newsId: string }
        if (cannot('get', 'News')) {
          throw new UnauthorizedError('You are not allowed to see news.')
        }

        const news = await prisma.news.findUnique({
          select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
          },
          where: {
            id: newsId,
          },
        })
        if (!news) {
          throw new BadRequestError('News not found.')
        }

        return reply.send({ news })
      },
    )
}
