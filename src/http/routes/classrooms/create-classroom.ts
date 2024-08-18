import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createClassroom(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/classrooms',
      {
        schema: {
          tags: ['Classrooms'],
          summary: 'Create a new classroom',
          security: [{ bearerAuth: [] }],
          body: z.object({
            trainningId: z.number(),
          }),
          response: {
            201: z.object({
              classroomId: z.number(),
            }),
          },
        },
      },

      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()
        const { cannot } = getUserPermissions(userId, userRole)
        const { trainningId } = request.body
        if (cannot('manage', 'Classroom')) {
          throw new UnauthorizedError(
            'You are not allowed to create new classrooms.',
          )
        }

        const trainning = await prisma.trainning.findUnique({
          where: { id: Number(trainningId) },
        })

        if (!trainning) {
          throw new BadRequestError('Trainning not found')
        }

        const classroom = await prisma.classroom.create({
          data: {
            studentId: userId,
            trainningId: trainning.id,
          },
        })

        return reply.status(201).send({
          classroomId: classroom.id,
        })
      },
    )
}
