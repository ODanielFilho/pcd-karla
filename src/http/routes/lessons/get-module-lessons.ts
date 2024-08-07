import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getModuleLessons(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings/:trainningId/:moduleId/lessons',
      {
        schema: {
          tags: ['Lessons'],
          summary: `Get Module's Lessons`,
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
            moduleId: z.number(),
          }),
          response: {
            200: z.object({
              lessons: z.array(
                z.object({
                  lessonId: z.number(),
                  title: z.string(),
                  link: z.string().url(),
                  description: z.string(),
                  createdAt: z.date(),
                }),
              ),
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

        const { trainningId, moduleId } = request.params

        const module = await prisma.module.findUnique({
          where: {
            id: moduleId,
            trainningId,
          },
        })

        if (!module) {
          throw new BadRequestError('Module not Found')
        }

        const lessons = await prisma.lesson.findMany({
          where: {
            moduleId,
          },
          select: {
            id: true,
            title: true,
            link: true,
            description: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        })

        if (!lessons) {
          throw new BadRequestError('lesson not found')
        }

        return reply.status(200).send({
          lessons: lessons.map((lesson) => ({
            ...lesson,
            lessonId: lesson.id,
          })),
        })
      },
    )
}
