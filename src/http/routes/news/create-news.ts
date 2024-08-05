import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createNews(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/news',
      {
        schema: {
          tags: ['News'],
          summary: 'Create a new news',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string(),
            content: z.string(),
            imageUrl: z.string().nullable(),
          }),
          response: {
            201: z.object({
              newsId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)
        if (cannot('manage', 'News')) {
          throw new UnauthorizedError("You're not allowed to create new news.")
        }

        const { title, content, imageUrl } = request.body

        const news = await prisma.news.create({
          data: {
            title,
            content,
            imageUrl,
            publisherId: userId,
          },
        })

        reply.status(201).send({ newsId: news.id })
      },
    )
}
