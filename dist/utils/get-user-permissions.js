"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPermissions = getUserPermissions;
const __1 = require("..");
const user_1 = require("../models/user");
function getUserPermissions(userId, role) {
    const authUser = user_1.userSchema.parse({
        id: userId,
        role,
    });
    const ability = (0, __1.defineAbilityFor)(authUser);
    return ability;
}
