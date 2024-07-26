"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApplication = deleteApplication;
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../../../lib/prisma");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const bad_request_error_1 = require("../_errors/bad-request-error");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function deleteApplication(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .delete('/applications/:applicationId', {
        schema: {
            tags: ['Applications'],
            summary: 'Delete an application',
            description: 'Delete an application',
            security: [{ bearerAuth: [] }],
            params: zod_1.default.object({
                applicationId: zod_1.default.string().uuid(),
            }),
            response: {
                204: zod_1.default.null(),
            },
        },
    }, async (request, reply) => {
        const { applicationId } = request.params;
        const userId = await request.getCurrentUserId();
        const userRole = await request.getUserRole();
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        if (cannot('delete', 'Application')) {
            throw new unauthorized_error_1.UnauthorizedError('You are not allowed to delete this application.');
        }
        const application = await prisma_1.prisma.application.delete({
            select: {
                id: true,
                jobId: true,
                userId: true,
            },
            where: {
                id: applicationId,
            },
        });
        if (!application) {
            throw new bad_request_error_1.BadRequestError('Application not found.');
        }
        return reply.status(204).send();
    });
}
