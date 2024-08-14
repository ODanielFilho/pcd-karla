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
    can('manage', 'Trainning')
    can('manage', 'Module')
    can('manage', 'Lesson')
    can('manage', 'Classroom')
  },
  COMPANY(user, { can }) {
    can('manage', 'Trainning')
    can('manage', 'Module')
    can('manage', 'Lesson')
    can('manage', 'Classroom')
    can('manage', 'JobResume')
    can('create', 'Job')
    can('get', 'Job', { companyId: { $eq: user.id } })
    can('update', 'Job', { companyId: { $eq: user.id } })
    can('delete', 'Job', { companyId: { $eq: user.id } })
    can('read', 'Application', { jobId: { $in: user.companyJobIds } })
    can('delete', 'Application', { jobId: { $in: user.companyJobIds } })
    can('manage', 'Trainning', { teacherId: { $eq: user.id } })
    can('get', 'Trainning')
  },
  CANDIDATE(user, { can }) {
    can('create', 'Job')
    can('get', 'Job', { companyId: { $eq: user.id } })
    can('update', 'Job', { companyId: { $eq: user.id } })
    can('delete', 'Job', { companyId: { $eq: user.id } })
    can('read', 'Application', { jobId: { $in: user.companyJobIds } })
    can('delete', 'Application', { jobId: { $in: user.companyJobIds } })
    can('manage', 'Trainning', { teacherId: { $eq: user.id } })
    can('manage', 'Application', { userId: { $eq: user.id } })
    can('manage', 'Module', { teacherId: { $eq: user.id } })
    can('manage', 'Lesson', { teacherId: { $eq: user.id } })
    can('manage', 'Classroom')
    can('get', 'Trainning')
    can('get', 'Job')
  },
  MEDIA(user, { can }) {
    can('manage', 'News', { publisherId: { $eq: user.id } })
  },
}
