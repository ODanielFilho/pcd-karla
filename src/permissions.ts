/* eslint-disable no-unused-vars */
import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'
import { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(user, { can }) {
    can('manage', 'all')
  },
  COMPANY(user, { can }) {
    can('create', 'Job')
    can('get', 'Job', { companyId: { $eq: user.id } })
    can('update', 'Job', { companyId: { $eq: user.id } })
    can('delete', 'Job', { companyId: { $eq: user.id } })
    can('read', 'Application', { jobId: { $in: user.companyJobIds } })
    can('delete', 'Application', { jobId: { $in: user.companyJobIds } })
  },
  CANDIDATE(user, { can }) {
    can('manage', 'Application', { userId: { $eq: user.id } })
    can('get', 'Job')
  },
  MEDIA(user, { can }) {
    can('manage', 'News', { publisherId: { $eq: user.id } })
  },
}
