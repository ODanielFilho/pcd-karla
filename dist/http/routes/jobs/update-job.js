"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateJob = updateJob;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function updateJob(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .put('/jobs/:jobId', {
        schema: {
            tags: ['Jobs'],
            summary: 'Update a job',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                jobId: zod_1.z.string().uuid(),
            }),
            body: zod_1.z.object({
                title: zod_1.z.string().optional(),
                description: zod_1.z.string().optional(),
            }),
            response: {
                200: zod_1.z.object({
                    id: zod_1.z.string().uuid(),
                    title: zod_1.z.string(),
                    description: zod_1.z.string(),
                    createdAt: zod_1.z.string().datetime(),
                    updatedAt: zod_1.z.string().datetime(),
                    companyId: zod_1.z.string().uuid(),
                }),
                404: zod_1.z.object({
                    message: zod_1.z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { jobId } = request.params;
        const { title, description } = request.body;
        const userId = await request.getCurrentUserId();
        const userRole = await request.getUserRole();
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        if (cannot('update', 'Job')) {
            throw new unauthorized_error_1.UnauthorizedError(`You're not allowed to update jobs.`);
        }
        const job = await prisma_1.prisma.job.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            return reply.status(404).send({ message: 'Job not found.' });
        }
        if (job.companyId !== userId && userRole !== 'ADMIN') {
            throw new unauthorized_error_1.UnauthorizedError(`You're not allowed to update this job.`);
        }
        const updatedJob = await prisma_1.prisma.job.update({
            where: { id: jobId },
            data: {
                title: title || job.title,
                description: description || job.description,
            },
        });
        const formattedJob = {
            ...updatedJob,
            createdAt: updatedJob.createdAt.toISOString(),
            updatedAt: updatedJob.updatedAt.toISOString(),
        };
        return reply.send(formattedJob);
    });
}
