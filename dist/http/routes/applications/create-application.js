"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApplication = createApplication;
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../../../lib/prisma");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function createApplication(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .post('/applications', {
        schema: {
            tags: ['Applications'],
            summary: 'Create a new application',
            security: [{ bearerAuth: [] }],
            body: zod_1.default.object({
                userId: zod_1.default.string(),
                jobId: zod_1.default.string(),
            }),
            response: {
                201: zod_1.default.object({
                    applicationId: zod_1.default.string().uuid(),
                }),
            },
        },
    }, async (request, reply) => {
        const userRole = await request.getUserRole();
        const { userId, jobId } = request.body;
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        if (cannot('manage', 'Application')) {
            throw new unauthorized_error_1.UnauthorizedError('You are not allowed to create new applications.');
        }
        const application = await prisma_1.prisma.application.create({
            data: {
                userId,
                jobId,
            },
        });
        return reply.status(201).send({
            applicationId: application.id,
        });
    });
}
