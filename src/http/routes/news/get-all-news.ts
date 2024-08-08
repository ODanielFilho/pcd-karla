import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'

export async function getAllNews(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
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
      const news = await prisma.news.findMany()
      reply.status(200).send({ news })
    },
  )
}
