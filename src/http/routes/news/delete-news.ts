import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteNews(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/news/:newsId',
      {
        schema: {
          tags: ['News'],
          summary: 'Delete a news',
          security: [{ bearerAuth: [] }],
          params: z.object({
            newsId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { newsId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('delete', 'News')) {
          throw new UnauthorizedError(
            'You are not allowed to delete this news.',
          )
        }

        const news = await prisma.news.delete({
          select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
            publisherId: true,
            publisher: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            id: newsId,
          },
        })

        if (!news) {
          throw new BadRequestError('News not found.')
        }

        return reply.status(204).send()
      },
    )
}
