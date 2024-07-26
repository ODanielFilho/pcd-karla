"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppAbility = void 0;
exports.defineAbilityFor = defineAbilityFor;
const ability_1 = require("@casl/ability");
const zod_1 = require("zod");
const permissions_1 = require("./permissions");
const application_1 = require("./subjects/application");
const job_1 = require("./subjects/job");
const user_1 = require("./subjects/user");
__exportStar(require("./models/user"), exports);
__exportStar(require("./roles"), exports);
const appAbilitiesSchema = zod_1.z.union([
    job_1.jobSubject,
    user_1.userSubject,
    application_1.applicationSubject,
    zod_1.z.tuple([zod_1.z.literal('manage'), zod_1.z.literal('all')]),
]);
exports.createAppAbility = ability_1.createMongoAbility;
function defineAbilityFor(user) {
    const builder = new ability_1.AbilityBuilder(exports.createAppAbility);
    if (typeof permissions_1.permissions[user.role] !== 'function') {
        throw new Error(`Permissions for role ${user.role} not found.`);
    }
    permissions_1.permissions[user.role](user, builder);
    const ability = builder.build({
        detectSubjectType(subject) {
            return subject.__typename;
        },
    });
    ability.can = ability.can.bind(ability);
    ability.cannot = ability.cannot.bind(ability);
    return ability;
}
