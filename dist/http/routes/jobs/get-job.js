"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJob = getJob;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const bad_request_error_1 = require("../_errors/bad-request-error");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function getJob(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .get('/jobs/:jobId', {
        schema: {
            tags: ['Jobs'],
            summary: 'Get job details',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                jobId: zod_1.z.string().uuid(),
            }),
            response: {
                200: zod_1.z.object({
                    job: zod_1.z.object({
                        id: zod_1.z.string().uuid(),
                        title: zod_1.z.string(),
                        description: zod_1.z.string(),
                        companyId: zod_1.z.string().uuid(),
                        company: zod_1.z.object({
                            id: zod_1.z.string().uuid(),
                            name: zod_1.z.string().nullable(),
                            avatarUrl: zod_1.z.string().url().nullable(),
                        }),
                    }),
                }),
            },
        },
    }, async (request, reply) => {
        const { jobId } = request.params;
        const userId = await request.getCurrentUserId();
        const userRole = await request.getUserRole();
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        if (cannot('get', 'Job')) {
            throw new unauthorized_error_1.UnauthorizedError('You are not allowed to see this job.');
        }
        const job = await prisma_1.prisma.job.findUnique({
            select: {
                id: true,
                title: true,
                description: true,
                companyId: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
            where: {
                id: jobId,
            },
        });
        if (!job) {
            throw new bad_request_error_1.BadRequestError('Job not found.');
        }
        return reply.send({ job });
    });
}
