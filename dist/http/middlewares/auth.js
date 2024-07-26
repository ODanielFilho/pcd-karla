"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const fastify_plugin_1 = require("fastify-plugin");
const prisma_1 = require("../../lib/prisma");
const unauthorized_error_1 = require("../routes/_errors/unauthorized-error");
exports.auth = (0, fastify_plugin_1.fastifyPlugin)(async (app) => {
    app.addHook('preHandler', async (request) => {
        request.getCurrentUserId = async () => {
            try {
                const { sub } = await request.jwtVerify();
                return sub;
            }
            catch {
                throw new unauthorized_error_1.UnauthorizedError('Invalid token');
            }
        };
        request.getUserRole = async () => {
            const userId = await request.getCurrentUserId();
            const user = await prisma_1.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new unauthorized_error_1.UnauthorizedError('User not found.');
            }
            return user.role;
        };
    });
});
