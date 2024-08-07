import { UserRole } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateLesson(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/trainnings/:trainningId/:moduleId/:lessonId',
      {
        schema: {
          tags: ['Lessons'],
          summary: 'Update a lesson for a trainning',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
            lessonId: z.number(),
          }),
          body: z.object({
            title: z.string(),
            link: z.string().url(),
            description: z.string(),
          }),
          response: {
            201: z.object({
              lessonId: z.number(),
              title: z.string(),
              link: z.string().url(),
              description: z.string(),
              createdAt: z.date(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('update', 'Module') || cannot('manage', 'Lesson')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError("You're not allowed to update a Lesson.")
        }

        const { title, link, description } = request.body
        const { trainningId, moduleId, lessonId } = request.params
        const lesson = await prisma.lesson.update({
          where: {
            id: lessonId,
          },
          data: {
            title,
            link,
            description,
            moduleId,
            trainningId,
            teacherId: userId,
          },
        })
        return reply.status(200).send({
          lessonId: lesson.id,
          title: lesson.title,
          link: lesson.link,
          description: lesson.description,
          createdAt: lesson.createdAt,
        })
      },
    )
}
