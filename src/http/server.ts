import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler } from './error-handler'

const app = fastify().withTypeProvider<ZodTypeProvider>()
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.setErrorHandler(errorHandler)

app.register(fastifyCors)

app.register(fastifyJwt, {
  secret: 'your_jwt_secret_here', // Substitua pelo seu segredo JWT
})

app.listen({ port: 3000 }).then(() => {
  console.log('HTTP server runnig')
})
