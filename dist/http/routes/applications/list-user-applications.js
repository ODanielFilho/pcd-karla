"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUserApplications = listUserApplications;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function listUserApplications(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .get('/applications', {
        schema: {
            tags: ['Applications'],
            summary: 'List user applications',
            security: [{ bearerAuth: [] }],
            response: {
                200: zod_1.z.object({
                    applications: zod_1.z.array(zod_1.z.object({
                        id: zod_1.z.string().uuid(),
                        jobId: zod_1.z.string(),
                        userId: zod_1.z.string(),
                        createdAt: zod_1.z.date(),
                    })),
                }),
            },
        },
    }, async (request, reply) => {
        // Obtém o ID do usuário autenticado
        const userId = await request.getCurrentUserId();
        // Verifica se o usuário está autenticado
        if (!userId) {
            throw new unauthorized_error_1.UnauthorizedError('User is not authenticated.');
        }
        // Busca as aplicações do usuário autenticado
        const applications = await prisma_1.prisma.application.findMany({
            where: { userId },
            select: {
                id: true,
                jobId: true,
                userId: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Retorna as aplicações encontradas
        return reply.send({ applications });
    });
}
