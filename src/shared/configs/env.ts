import dotenv from 'dotenv';
import path from 'path';
import z from 'zod';

dotenv.config({
    path: path.join(process.cwd(), '.env'),
    override: true,
});

const envSchema = z.object({
    ENV: z.enum(['development', 'production', 'stage']).default('development'),
    // Support both PORT and SERVER_PORT from .env.example
    PORT: z.coerce.number().int().positive().max(65535).default(3007),
    SERVICE_NAME: z.string().min(1).max(255).default('FinUp'),

    JWT_SECRET: z.string().min(5).max(255),

    CONSOLE_LOG_LEVEL: z
        .enum(['false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
        .default('info'),
    FILE_LOG_LEVEL: z
        .enum(['false', 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
        .default('info'),

    FILE_STORAGE_ENDPOINT: z.string().url().default('http://localhost:3007/files'),
    FILE_STORAGE_PATH: z.string().min(3).max(255).default(path.join(process.cwd(), 'files')),

    DATABASE_URL: z.string().min(1),

    REDIS_URL: z.string().default('redis://localhost:6379'),

    SMTP_HOST: z.string().default('localhost'),
    SMTP_PORT: z.coerce.number().int().positive().max(65535).default(1025),
    SMTP_USER: z.string().default('finup'),
    SMTP_PASSWORD: z.string().default('finup'),

    AWS_REGION: z.string().default('ap-south-1'),
    AWS_ACCESS_KEY_ID: z.string().default('local'),
    AWS_SECRET_ACCESS_KEY: z.string().default('local'),
    AWS_S3_BACKUP_BUCKET: z.string().default('finup-backups'),

    CORS_ORIGIN: z.string().default('*'),
    PUBLIC_API_URL: z.string().default('https://api.finup.yashchauhan.pro'),
});

// Map SERVER_PORT → PORT if needed
if (!process.env.PORT && process.env.SERVER_PORT) {
    process.env.PORT = process.env.SERVER_PORT;
}
if (!process.env.ENV && process.env.NODE_ENV) {
    const n = process.env.NODE_ENV;
    process.env.ENV = n === 'prod' || n === 'production' ? 'production' : n === 'stage' ? 'stage' : 'development';
}

const { data: env, error } = envSchema.safeParse(process.env);

if (error) throw new Error(`Invalid ENV options: ${error.message}`);

export default env!;
