import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { BadRequestError } from '../_errors/bad-request-error'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(['ADMIN', 'COMPANY', 'CANDIDATE', 'MEDIA']).optional(), // {{ edit_1 }} Tornar a role opcional
        }),
      },
    },
    async (request, reply) => {
      const { name, email, password, role = 'CANDIDATE' } = request.body // {{ edit_2 }} Atribuição padrão da role

      const userWithSameEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithSameEmail) {
        throw new BadRequestError('User with same e-mail already exists.')
      }

      const passwordHash = await hash(password, 6)

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
      })

      return reply.status(201).send()
    },
  )
}
