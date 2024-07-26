"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationSubject = void 0;
const zod_1 = require("zod");
const application_1 = require("../models/application");
exports.applicationSubject = zod_1.z.tuple([
    zod_1.z.union([
        zod_1.z.literal('manage'),
        zod_1.z.literal('update'),
        zod_1.z.literal('read'),
        zod_1.z.literal('delete'),
    ]),
    zod_1.z.union([zod_1.z.literal('Application'), application_1.applicationSchema]),
]);
