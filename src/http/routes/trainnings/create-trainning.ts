import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function createTrainning(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/trainnings',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'Create a new trainning',
          security: [{ bearerAuth: [] }],
          body: z.object({
            title: z.string(),
            imageUrl: z.string().url(),
            format: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
            duration: z.string(),
            timeconclusion: z.string(),
            intended: z.string(),
            certificate: z.string(),
            location: z.string(),
            date: z.string().datetime(),
            teacherLink: z.string(),
            objective: z.string(),
            about: z.string(),
            aboutHeader: z.string(),
            trail: z.array(z.string()),
            content: z.string(),
            teacherId: z.string(),
          }),
          response: {
            201: z.object({
              trainningId: z.number(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('create', 'Trainning')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError(
            "You're not allowed to create new trainnings.",
          )
        }

        const {
          title,
          imageUrl,
          format,
          duration,
          timeconclusion,
          intended,
          certificate,
          location,
          date,
          teacherLink,
          objective,
          about,
          aboutHeader,
          trail,
          content,
        } = request.body

        const trainning = await prisma.trainning.create({
          data: {
            title,
            imageUrl,
            format,
            duration,
            timeconclusion,
            intended,
            certificate: certificate.toString(),
            location: location || '',
            date,
            teacherLink,
            objective,
            about,
            aboutHeader,
            trail,
            content,
            teacherId: userId,
          },
        })
        return reply.status(201).send({
          trainningId: trainning.id,
        })
      },
    )
}
