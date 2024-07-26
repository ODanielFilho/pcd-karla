"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobApplications = listJobApplications;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function listJobApplications(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .get('/companies/jobs/:jobId/applications', {
        schema: {
            tags: ['Applications'],
            summary: 'List applications for a specific job',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                jobId: zod_1.z.string().uuid(),
            }),
            response: {
                200: zod_1.z.object({
                    applications: zod_1.z.array(zod_1.z.object({
                        user: zod_1.z.object({
                            name: zod_1.z.string().nullable(),
                            email: zod_1.z.string(),
                        }),
                    })),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const userRole = await request.getUserRole();
        // Obtém as permissões do usuário
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        // Verifica se o usuário pode ver as aplicações para o emprego especificado
        if (cannot('read', 'Application')) {
            throw new unauthorized_error_1.UnauthorizedError('You are not authorized to view these applications.');
        }
        // Obtém o ID do emprego a partir dos parâmetros de rota
        const { jobId } = request.params;
        // Verifica se o emprego pertence à empresa do usuário autenticado
        const job = await prisma_1.prisma.job.findUnique({
            where: {
                id: jobId,
                companyId: userId, // Verifica se o job pertence ao usuário autenticado
            },
        });
        if (!job) {
            throw new unauthorized_error_1.UnauthorizedError("You do not have access to this job's applications.");
        }
        // Busca as aplicações para o emprego específico
        const applications = await prisma_1.prisma.application.findMany({
            where: {
                jobId: jobId,
            },
            select: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return reply.send({ applications });
    });
}
