import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getNewsByPublishers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/news/publisher/:publisherId',
      {
        schema: {
          tags: ['News'],
          summary: 'Get all news by publishers',
          security: [{ bearerAuth: [] }],
          params: z.object({
            publisherId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              news: z.array(
                z.object({
                  id: z.string().uuid(),
                  title: z.string(),
                  content: z.string(),
                  imageUrl: z.string().nullable(),
                  createdAt: z.string().datetime(),
                  updatedAt: z.string().datetime(),
                  publisherId: z.string().uuid(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { publisherId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('get', 'News')) {
          throw new UnauthorizedError('You are not allowed to see news.')
        }

        const news = await prisma.news.findMany({
          select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            updatedAt: true,
            publisherId: true,
          },
          where: {
            publisherId: publisherId,
          },
        })
        const formattedNews = news.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        }))
        return reply.status(200).send({ news: formattedNews })
      },
    )
}
