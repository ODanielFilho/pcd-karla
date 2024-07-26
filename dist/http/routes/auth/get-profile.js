"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function getProfile(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth) // Adiciona o middleware de autenticação
        .get('/profile', {
        schema: {
            tags: ['Auth'],
            summary: 'Get authenticated user profile',
            security: [{ bearerAuth: [] }], // Indica que a rota requer um token Bearer
            response: {
                200: zod_1.z.object({
                    user: zod_1.z.object({
                        id: zod_1.z.string().uuid(),
                        name: zod_1.z.string().nullable(),
                        email: zod_1.z.string().email(),
                        avatarUrl: zod_1.z.string().url().nullable(),
                    }),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const user = await prisma_1.prisma.user.findUnique({
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
            },
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new bad_request_error_1.BadRequestError('User not found.');
        }
        return reply.send({ user });
    });
}
