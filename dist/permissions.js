"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissions = void 0;
exports.permissions = {
    ADMIN(user, { can }) {
        can('manage', 'all');
    },
    COMPANY(user, { can }) {
        can('create', 'Job');
        can('get', 'Job', { companyId: { $eq: user.id } });
        can('update', 'Job', { companyId: { $eq: user.id } });
        can('delete', 'Job', { companyId: { $eq: user.id } });
        can('read', 'Application', { jobId: { $in: user.companyJobIds } });
        can('delete', 'Application', { jobId: { $in: user.companyJobIds } });
    },
    CANDIDATE(user, { can }) {
        can('manage', 'Application', { userId: { $eq: user.id } });
        can('get', 'Job');
    },
};
