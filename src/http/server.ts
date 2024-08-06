import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'
import { createApplication } from './routes/applications/create-application'
import { deleteApplication } from './routes/applications/delete-application'
import { listJobApplications } from './routes/applications/list-job-appplications'
import { listUserApplications } from './routes/applications/list-user-applications'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import { createAccount } from './routes/auth/create-account'
import { getProfile } from './routes/auth/get-profile'
import { requestPasswordRecover } from './routes/auth/request-password-recover'
import { resetPassword } from './routes/auth/reset-password'
import { createJob } from './routes/jobs/create-job'
import { deleteJob } from './routes/jobs/delete-job'
import { getJob } from './routes/jobs/get-job'
import { getJobs } from './routes/jobs/get-jobs'
import { updateJob } from './routes/jobs/update-job'
import { createNews } from './routes/news/create-news'
import { deleteNews } from './routes/news/delete-news'
import { getAllNews } from './routes/news/get-all-news'
import { getNews } from './routes/news/get-news'
import { getNewsByPublishers } from './routes/news/get-news-by-publishers'
import { updateNews } from './routes/news/update-news'
import { createTrainning } from './routes/trainnings/create-trainning'
import { getTrainning } from './routes/trainnings/get-trainning'

const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'PCD Protagozina Cultura',
      description:
        'Plataforma de vagas para projetos culturais voltada às pessoas com Deficiência.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.register(fastifyJwt, {
  secret: 'your_jwt_secret_here', // Substitua pelo seu segredo JWT
})
app.register(fastifyCors)

app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)
app.register(requestPasswordRecover)
app.register(resetPassword)

app.register(createJob)
app.register(getJob)
app.register(getJobs)
app.register(updateJob)
app.register(deleteJob)

app.register(createApplication)
app.register(deleteApplication)
app.register(listUserApplications)
app.register(listJobApplications)

app.register(createNews)
app.register(getAllNews)
app.register(getNews)
app.register(getNewsByPublishers)
app.register(deleteNews)
app.register(updateNews)

app.register(createTrainning)
app.register(getTrainning)

app.listen({ port: 3001, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running on port 3001')
})
