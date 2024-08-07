import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'
import { z } from 'zod'

import { User } from './models/user'
import { permissions } from './permissions'
import { applicationSubject } from './subjects/application'
import { classroomSubject } from './subjects/classroom'
import { jobSubject } from './subjects/job'
import { lessonSubject } from './subjects/lesson'
import { moduleSubject } from './subjects/module'
import { newsSubject } from './subjects/news'
import { trainningSubject } from './subjects/trainning'
import { userSubject } from './subjects/user'

export * from './models/user'
export * from './roles'

const appAbilitiesSchema = z.union([
  jobSubject,
  userSubject,
  applicationSubject,
  newsSubject,
  trainningSubject,
  moduleSubject,
  lessonSubject,
  classroomSubject,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Permissions for role ${user.role} not found.`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.cannot.bind(ability)

  return ability
}
