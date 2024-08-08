import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function deleteClassroom(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/classrooms/:classroomId',
      {
        schema: {
          tags: ['Classrooms'],
          summary: 'Delete a classroom',
          security: [{ bearerAuth: [] }],
          params: z.object({
            classroomId: z.number(),
          }),
          response: {
            200: z.object({
              message: z.string(),
            }),
          },
        },
      },

      async (request, reply) => {
        const userRole: UserRole = await request.getUserRole()
        const userId = await request.getCurrentUserId()
        const { classroomId } = request.params
        const { cannot } = getUserPermissions(userId, userRole)
        if (cannot('manage', 'Classroom')) {
          throw new UnauthorizedError(
            'You are not allowed to delete classrooms.',
          )
        }

        const classroom = await prisma.classroom.findUnique({
          where: { id: classroomId },
        })

        if (!classroom) {
          throw new BadRequestError('Classroom not found')
        }

        await prisma.classroom.delete({
          where: { id: classroomId },
        })

        return reply.status(200).send({
          message: 'Classroom deleted successfully',
        })
      },
    )
}
