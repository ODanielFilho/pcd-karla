import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getLesson(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings/:trainningId/:moduleId/:lessonId',
      {
        schema: {
          tags: ['Lessons'],
          summary: 'Get a lesson',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
            lessonId: z.number(),
          }),
          response: {
            200: z.object({
              lesson: z.object({
                lessonId: z.number(),
                title: z.string(),
                link: z.string().url(),
                description: z.string(),
                createdAt: z.date(),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()
        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('manage', 'Module')) {
          throw new UnauthorizedError('You are not allowed to see this lesson')
        }

        const { trainningId, moduleId, lessonId } = request.params
        const lesson = await prisma.lesson.findUnique({
          select: {
            id: true,
            title: true,
            link: true,
            description: true,
            createdAt: true,
          },
          where: {
            id: lessonId,
          },
        })

        if (!lesson) {
          throw new BadRequestError('lesson not found')
        }

        return reply.status(200).send({
          lesson: {
            lessonId: lesson.id,
            title: lesson.title,
            description: lesson.description,
            link: lesson.link,
            createdAt: lesson.createdAt,
          },
        })
      },
    )
}
