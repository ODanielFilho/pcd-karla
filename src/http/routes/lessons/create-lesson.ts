import { UserRole } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createLesson(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/trainnings/:trainningId/:moduleId',
      {
        schema: {
          tags: ['Lessons'],
          summary: 'Create a new lesson for a trainning',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
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

        if (cannot('create', 'Module') || cannot('manage', 'Lesson')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError(
            "You're not allowed to create a new Lesson.",
          )
        }

        const { title, link, description } = request.body
        const { trainningId, moduleId } = request.params
        const lesson = await prisma.lesson.create({
          data: {
            title,
            link,
            description,
            moduleId,
            trainningId,
            teacherId: userId,
          },
        })
        return reply.status(201).send({
          lessonId: lesson.id,
          title: lesson.title,
          link: lesson.link,
          description: lesson.description,
          createdAt: lesson.createdAt,
        })
      },
    )
}
