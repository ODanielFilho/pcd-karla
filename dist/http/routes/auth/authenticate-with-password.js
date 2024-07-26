"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWithPassword = authenticateWithPassword;
const bcryptjs_1 = require("bcryptjs");
const zod_1 = __importDefault(require("zod"));
const prisma_1 = require("../../../lib/prisma");
const bad_request_error_1 = require("../_errors/bad-request-error");
async function authenticateWithPassword(app) {
    app.withTypeProvider().post('/sessions/password', {
        schema: {
            tags: ['Auth'],
            summary: 'Authenticate with e-mail & password',
            body: zod_1.default.object({
                email: zod_1.default.string().email(),
                password: zod_1.default.string(),
            }),
            response: {
                201: zod_1.default.object({
                    token: zod_1.default.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { email, password } = request.body;
        const userFromEmail = await prisma_1.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!userFromEmail) {
            throw new bad_request_error_1.BadRequestError('Invalid credentials.');
        }
        if (userFromEmail.passwordHash === null) {
            throw new bad_request_error_1.BadRequestError('User does not have a password, use social login.');
        }
        const isPasswordValid = await (0, bcryptjs_1.compare)(password, userFromEmail.passwordHash);
        if (!isPasswordValid) {
            throw new bad_request_error_1.BadRequestError('Invalid credentials.');
        }
        const token = await reply.jwtSign({
            sub: userFromEmail.id,
        }, {
            sign: {
                expiresIn: '7d',
            },
        });
        return reply.status(201).send({ token });
    });
}
