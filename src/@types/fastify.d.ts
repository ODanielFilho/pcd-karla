/* eslint-disable no-unused-vars */
import type { Application, Job, User } from '@prisma/client'
import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserInfo(): Promise<User>
    getCompanyJobs(userId: string): Promise<Job[]>
    getUserApplications(userId: string): Promise<Application[]>
    getUserRole(): Promise<UserRole>
  }
}
