"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSchema = void 0;
const zod_1 = require("zod");
exports.jobSchema = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    companyId: zod_1.z.string(),
    __typename: zod_1.z.literal('Job'),
});
