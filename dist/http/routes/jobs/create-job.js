"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
const zod_1 = require("zod");
const prisma_1 = require("../../../lib/prisma");
const create_slug_1 = require("../../../utils/create-slug");
const get_user_permissions_1 = require("../../../utils/get-user-permissions");
const auth_1 = require("../../middlewares/auth");
const unauthorized_error_1 = require("../_errors/unauthorized-error");
async function createJob(app) {
    app
        .withTypeProvider()
        .register(auth_1.auth)
        .post('/jobs', {
        schema: {
            tags: ['Jobs'],
            summary: 'Create a new job',
            security: [{ bearerAuth: [] }],
            body: zod_1.z.object({
                title: zod_1.z.string(),
                description: zod_1.z.string(),
            }),
            response: {
                201: zod_1.z.object({
                    jobId: zod_1.z.string().uuid(),
                }),
            },
        },
    }, async (request, reply) => {
        const userId = await request.getCurrentUserId();
        const userRole = await request.getUserRole();
        const { cannot } = (0, get_user_permissions_1.getUserPermissions)(userId, userRole);
        if (cannot('create', 'Job')) {
            // eslint-disable-next-line quotes
            throw new unauthorized_error_1.UnauthorizedError("You're not allowed to create new jobs.");
        }
        const { title, description } = request.body;
        const job = await prisma_1.prisma.job.create({
            data: {
                title,
                slug: (0, create_slug_1.createSlug)(title),
                description,
                companyId: userId,
            },
        });
        return reply.status(201).send({
            jobId: job.id,
        });
    });
}
