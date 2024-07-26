"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobs = getJobs;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function getJobs(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .get('/companies/:companyId/jobs', {
        schema: {
            tags: ['Jobs'],
            summary: 'Get all jobs for a company',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                companyId: zod_1.z.string().uuid(),
            }),
            response: {
                200: zod_1.z.object({
                    jobs: zod_1.z.array(zod_1.z.object({
                        id: zod_1.z.string().uuid(),
                        title: zod_1.z.string(),
                        description: zod_1.z.string(),
                        createdAt: zod_1.z.string().datetime(),
                        updatedAt: zod_1.z.string().datetime(),
                        companyId: zod_1.z.string().uuid(),
                        company: zod_1.z.object({
                            id: zod_1.z.string().uuid(),
                            name: zod_1.z.string().nullable(),
                            email: zod_1.z.string().email().nullable(),
                            avatarUrl: zod_1.z.string().url().nullable(),
                        }),
                    })),
                }),
            },
        },
    }, async (request, reply) => {
        const { companyId } = request.params;
        const userId = await request.getCurrentUserId();
        const userRole = await request.getUserRole();
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        if (cannot('get', 'Job')) {
            throw new unauthorized_error_1.UnauthorizedError('You are not allowed to see jobs for this company.');
        }
        const jobs = await prisma_1.prisma.job.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                createdAt: true,
                updatedAt: true,
                companyId: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
            where: {
                companyId: companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        const formattedJobs = jobs.map((job) => ({
            ...job,
            createdAt: job.createdAt.toISOString(),
            updatedAt: job.updatedAt.toISOString(),
        }));
        return reply.send({ jobs: formattedJobs });
    });
}
