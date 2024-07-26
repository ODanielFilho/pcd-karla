"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = deleteJob;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const bad_request_error_1 = require("../_errors/bad-request-error");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function deleteJob(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .delete('/jobs/:jobId', {
        schema: {
            tags: ['Jobs'],
            summary: 'Delete a job',
            security: [{ bearerAuth: [] }],
            params: zod_1.z.object({
                jobId: zod_1.z.string().uuid(),
            }),
            response: {
                204: zod_1.z.null(),
            },
        },
    }, async (request, reply) => {
        const { jobId } = request.params;
        const userId = await request.getCurrentUserId();
        const userRole = await request.getUserRole();
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        if (cannot('delete', 'Job')) {
            throw new unauthorized_error_1.UnauthorizedError('You are not allowed to delete this job.');
        }
        const job = await prisma_1.prisma.job.delete({
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
        return reply.status(204).send();
    });
}
