"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const fastify_1 = __importDefault(require("fastify"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const error_handler_1 = require("./error-handler");
const create_application_1 = require("./routes/applications/create-application");
const delete_application_1 = require("./routes/applications/delete-application");
const list_job_appplications_1 = require("./routes/applications/list-job-appplications");
const list_user_applications_1 = require("./routes/applications/list-user-applications");
const authenticate_with_password_1 = require("./routes/auth/authenticate-with-password");
const create_account_1 = require("./routes/auth/create-account");
const get_profile_1 = require("./routes/auth/get-profile");
const request_password_recover_1 = require("./routes/auth/request-password-recover");
const reset_password_1 = require("./routes/auth/reset-password");
const create_job_1 = require("./routes/jobs/create-job");
const delete_job_1 = require("./routes/jobs/delete-job");
const get_job_1 = require("./routes/jobs/get-job");
const get_jobs_1 = require("./routes/jobs/get-jobs");
const update_job_1 = require("./routes/jobs/update-job");
const app = (0, fastify_1.default)().withTypeProvider();
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setErrorHandler(error_handler_1.errorHandler);
app.register(swagger_1.default, {
    openapi: {
        info: {
            title: 'PCD Protagozina Cultura',
            description: 'Plataforma de vagas para projetos culturais voltada às pessoas com Deficiência.',
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
    transform: fastify_type_provider_zod_1.jsonSchemaTransform,
});
app.register(swagger_ui_1.default, {
    routePrefix: '/docs',
});
app.register(jwt_1.default, {
    secret: 'your_jwt_secret_here', // Substitua pelo seu segredo JWT
});
app.register(cors_1.default);
app.register(create_account_1.createAccount);
app.register(authenticate_with_password_1.authenticateWithPassword);
app.register(get_profile_1.getProfile);
app.register(request_password_recover_1.requestPasswordRecover);
app.register(reset_password_1.resetPassword);
app.register(create_job_1.createJob);
app.register(get_job_1.getJob);
app.register(get_jobs_1.getJobs);
app.register(update_job_1.updateJob);
app.register(delete_job_1.deleteJob);
app.register(create_application_1.createApplication);
app.register(delete_application_1.deleteApplication);
app.register(list_user_applications_1.listUserApplications);
app.register(list_job_appplications_1.listJobApplications);
app.listen({ port: 3000 }).then(() => {
    console.log('HTTP server runnig');
});
