import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateNews(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/news/:newsId',
      {
        schema: {
          tags: ['News'],
          summary: 'Update a news',
          security: [{ bearerAuth: [] }],
          params: z.object({
            newsId: z.string().uuid(),
          }),
          body: z.object({
            title: z.string().optional(),
            content: z.string().optional(),
            imageUrl: z.string().optional(),
          }),
          response: {
            200: z.object({
              id: z.string().uuid(),
              title: z.string(),
              content: z.string(),
              imageUrl: z.string().optional(),
              createdAt: z.string().datetime(),
              updatedAt: z.string().datetime(),
              publisherId: z.string().uuid(),
            }),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { newsId } = request.params
        const { title, content, imageUrl } = request.body
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('update', 'News')) {
          throw new UnauthorizedError(`You're not allowed to update news.`)
        }

        const news = await prisma.news.findUnique({
          where: { id: newsId },
        })

        if (!news) {
          return reply.status(404).send({ message: 'News not found.' })
        }

        if (news.publisherId !== userId && userRole !== 'ADMIN') {
          throw new UnauthorizedError(`You're not allowed to update this news.`)
        }

        const updatedNews = await prisma.news.update({
          where: { id: newsId },
          data: {
            title: title || news.title,
            content: content || news.content,
            imageUrl: imageUrl || news.imageUrl,
          },
        })

        const formattedNews = {
          ...updatedNews,
          createdAt: updatedNews.createdAt.toISOString(),
          updatedAt: updatedNews.updatedAt.toISOString(),
        }

        return reply.send({
          id: updatedNews.id,
          createdAt: updatedNews.createdAt.toISOString(),
          updatedAt: updatedNews.updatedAt.toISOString(),
          title: updatedNews.title,
          content: updatedNews.content,
          publisherId: updatedNews.publisherId,
          imageUrl: updatedNews.imageUrl || undefined,
        })
      },
    )
}
