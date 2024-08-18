import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getUserTrainings(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth) // Certifique-se que o middleware auth está registrado
    .get(
      '/my-trainnings/:userId',
      {
        schema: {
          tags: ['Trainnings'],
          summary: 'List trainings for the authenticated user',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              trainings: z.array(
                z.object({
                  id: z.number(),
                  title: z.string(),
                  image: z.string().url().optional(),
                  format: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']),
                  duration: z.string(),
                  timeconclusion: z.string(),
                  intended: z.string(),
                  certificate: z.string(),
                  location: z.string().optional(),
                  date: z
                    .string()
                    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
                  teacherLink: z.string(),
                  objective: z.string(),
                  about: z.string(),
                  aboutHeader: z.string().optional(),
                  trail: z.array(z.string()),
                  content: z.string(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const requesterRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, requesterRole)

        if (cannot('get', 'Trainning')) {
          throw new UnauthorizedError(
            'You are not allowed to view this information.',
          )
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        const trainings = await prisma.trainning.findMany({
          where: {
            Classroom: {
              some: {
                studentId: userId,
              },
            },
          },
          select: {
            id: true,
            title: true,
            about: true,
            image: true,
            location: true,
            date: true,
            aboutHeader: true,
            format: true,
            content: true,
            duration: true,
            timeconclusion: true,
            intended: true,
            certificate: true,
            teacherLink: true,
            objective: true,
            trail: true,
          },
        })

        const formattedTrainings = trainings.map((training) => ({
          ...training,
          imageUrl: training.image || undefined,
          location: training.location || undefined,
          aboutHeader: training.aboutHeader || undefined,
          format: training.format as 'ONLINE' | 'IN_PERSON' | 'HYBRID',
          date: training.date.toISOString(), // Convertendo Date para string ISO 8601
        }))

        return reply.send({
          trainings: formattedTrainings.map((training) => ({
            ...training,
            image: training.imageUrl, // Corrigir a chave da imagem
          })),
        })
      },
    )
}
