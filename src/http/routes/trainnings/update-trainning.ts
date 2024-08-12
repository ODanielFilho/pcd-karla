import { UserRole } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateTrainning(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/trainnings/:trainningId',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'Update a trainning',
          security: [{ bearerAuth: [] }],
          params: z.object({
            trainningId: z.number(),
          }),
          body: z.object({
            title: z.string(),
            image: z.string().url().optional(),
            format: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
            duration: z.string(),
            timeconclusion: z.string(),
            intended: z.string(),
            certificate: z.string(),
            location: z.string().optional(),
            date: z.string().datetime(),
            teacherLink: z.string(),
            objective: z.string(),
            about: z.string(),
            aboutHeader: z.string().optional(),
            trail: z.array(z.string()),
            content: z.string(),
          }),
          response: {
            200: z.object({
              id: z.number(),
              title: z.string(),
              imageUrl: z.string().url().optional(),
              format: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
              duration: z.string(),
              timeconclusion: z.string(),
              intended: z.string(),
              certificate: z.string(),
              location: z.string().optional(),
              date: z.string().datetime(),
              teacherLink: z.string(),
              objective: z.string(),
              about: z.string(),
              aboutHeader: z.string().optional(),
              trail: z.array(z.string()),
              content: z.string(),
              createdAt: z.string().datetime(),
              updatedAt: z.string().datetime(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { trainningId } = request.params
        const userId = await request.getCurrentUserId()
        const userRole: UserRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        const trainning = await prisma.trainning.findUnique({
          where: { id: trainningId },
        })

        if (cannot('update', 'Trainning')) {
          // eslint-disable-next-line quotes
          throw new UnauthorizedError(
            "You're not allowed to update this trainning.",
          )
        }

        if (trainning?.teacherId !== userId) {
          throw new UnauthorizedError(
            `You're not allowed to update this trainning.`,
          )
        }

        const {
          title,
          image,
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

        const updatedTrainning = await prisma.trainning.update({
          where: {
            id: trainningId,
          },
          data: {
            title,
            image,
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

        // Convert Date objects to ISO string format
        const formattedTrainning = {
          ...updatedTrainning,
          createdAt: updatedTrainning.createdAt.toISOString(),
          updatedAt: updatedTrainning.updatedAt.toISOString(),
          date: updatedTrainning.date.toISOString(),
        }

        return reply.status(200).send({
          id: updatedTrainning.id,
          createdAt: formattedTrainning.createdAt,
          updatedAt: formattedTrainning.updatedAt,
          title: updatedTrainning.title,
          imageUrl: updatedTrainning.image || undefined,
          format: updatedTrainning.format as 'ONLINE' | 'IN_PERSON' | 'HYBRID',
          duration: updatedTrainning.duration,
          timeconclusion: updatedTrainning.timeconclusion,
          intended: updatedTrainning.intended,
          certificate: updatedTrainning.certificate,
          location: updatedTrainning.location || '',
          date: formattedTrainning.date,
          teacherLink: updatedTrainning.teacherLink,
          objective: updatedTrainning.objective,
          about: updatedTrainning.about,
          aboutHeader: updatedTrainning.aboutHeader || undefined,
          trail: updatedTrainning.trail,
          content: updatedTrainning.content,
        })
      },
    )
}
