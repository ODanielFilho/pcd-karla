import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getTrainningStudents(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/trainnings/:trainningId/classrooms',
      {
        schema: {
          tags: ['Classrooms'],
          summary: 'List classrooms for a specific training',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
          }),
          response: {
            200: z.object({
              classrooms: z.array(
                z.object({
                  student: z.object({
                    name: z.string().nullable(),
                    email: z.string(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)
        if (cannot('read', 'Classroom') || cannot('manage', 'Trainning')) {
          throw new UnauthorizedError(
            'You are not allowed to view these classrooms.',
          )
        }

        const { trainningId } = request.params
        const trainning = await prisma.trainning.findUnique({
          where: {
            id: trainningId,
          },
        })

        if (!trainning) {
          throw new BadRequestError('Training not found')
        }

        const classrooms = await prisma.classroom.findMany({
          where: {
            trainningId,
          },
          select: {
            studentId: true,
          },
        })

        if (!classrooms || classrooms.length === 0) {
          throw new BadRequestError('No classrooms found for this training.')
        }

        const studentIds = classrooms.map((classroom) => classroom.studentId)

        const students = await prisma.user.findMany({
          where: {
            id: {
              in: studentIds,
            },
          },
          select: {
            name: true,
            email: true,
          },
        })

        return reply.status(200).send({
          classrooms: students.map((student) => ({
            student,
          })),
        })
      },
    )
}
