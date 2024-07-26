"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationSchema = void 0;
const zod_1 = require("zod");
exports.applicationSchema = zod_1.z.object({
    applicationId: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    jobId: zod_1.z.string().uuid(),
    __typename: zod_1.z.literal('Application'),
});
