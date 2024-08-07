import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteLesson(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/trainnings/:trainningId/:moduleId/:lessonId',
      {
        schema: {
          tags: ['Lessons'],
          summary: 'delete lesson',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
            lessonId: z.number(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { trainningId, moduleId, lessonId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('delete', 'Module') || cannot('manage', 'Lesson')) {
          throw new UnauthorizedError('You are not allowed to see this module.')
        }

        const lesson = await prisma.lesson.delete({
          select: {
            id: true,
            title: true,
            description: true,
            link: true,
          },
          where: {
            id: lessonId,
            trainningId,
            moduleId,
          },
        })

        if (!lesson) {
          throw new BadRequestError('Module not found.')
        }

        return reply.status(204).send()
      },
    )
}
