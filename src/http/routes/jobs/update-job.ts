import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { getUserPermissions } from '../../../utils/get-user-permissions'
import { auth } from '../../middlewares/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function updateJob(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/jobs/:jobId',
      {
        schema: {
          tags: ['Jobs'],
          summary: 'Update a job',
          security: [{ bearerAuth: [] }],
          params: z.object({
            jobId: z.string().uuid(),
          }),
          body: z.object({
            title: z.string().optional(),
            description: z.string().optional(),
            pay: z.number().optional(),
            location: z.string().optional(),
            benefits: z.string().optional(),
            resume: z
              .array(
                z.object({
                  id: z.number().optional(),
                  title: z.string().optional(),
                  description: z.string().optional(),
                }),
              )
              .optional(),
          }),
          response: {
            200: z.object({
              id: z.number().int(),
              title: z.string(),
              description: z.string(),
              pay: z.number(),
              location: z.string(),
              benefits: z.string(),
              resume: z.array(
                z.object({
                  id: z.number().int(),
                  title: z.string(),
                  description: z.string(),
                }),
              ),
              createdAt: z.string().datetime(),
              updatedAt: z.string().datetime(),
              companyId: z.string().uuid(),
            }),
            404: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { jobId } = request.params
        const { title, description, benefits, location, pay, resume } =
          request.body
        const userId = await request.getCurrentUserId()
        const userRole = await request.getUserRole()

        const { cannot } = getUserPermissions(userId, userRole)

        if (cannot('update', 'Job')) {
          throw new UnauthorizedError(`You're not allowed to update jobs.`)
        }

        const id = parseInt(jobId, 10)
        const job = await prisma.job.findUnique({
          where: { id },
          include: {
            resume: true, // Include existing resumes for the job
          },
        })

        if (!job) {
          return reply.status(404).send({ message: 'Job not found.' })
        }

        if (job.companyId !== userId && userRole !== 'ADMIN') {
          throw new UnauthorizedError(`You're not allowed to update this job.`)
        }

        // Update resumes if provided
        if (resume) {
          for (const resumeItem of resume) {
            if (resumeItem.id) {
              // Update existing resume
              await prisma.jobResume.update({
                where: { id: resumeItem.id },
                data: {
                  title: resumeItem.title || undefined,
                  description: resumeItem.description || undefined,
                },
              })
            } else {
              // Create new resume
              await prisma.jobResume.create({
                data: {
                  jobId: id,
                  title: resumeItem.title!,
                  description: resumeItem.description!,
                },
              })
            }
          }
        }

        const updatedJob = await prisma.job.update({
          where: { id },
          data: {
            title: title || job.title,
            description: description || job.description,
            benefits: benefits || job.benefits,
            pay: pay || job.pay,
            location: location || job.location,
          },
          include: {
            resume: true, // Include updated resumes in the response
          },
        })

        const formattedJob = {
          ...updatedJob,
          createdAt: updatedJob.createdAt.toISOString(),
          updatedAt: updatedJob.updatedAt.toISOString(),
        }

        return reply.send(formattedJob)
      },
    )
}
