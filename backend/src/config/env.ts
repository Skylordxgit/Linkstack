import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  isProd: process.env.NODE_ENV === "production",
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  COOKIE_NAME: process.env.COOKIE_NAME ?? "linkapp_session",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
  UPLOAD_PATH: process.env.UPLOAD_PATH ?? "uploads",
  MAX_UPLOAD_SIZE: Number(process.env.MAX_UPLOAD_SIZE ?? 10 * 1024 * 1024),
  ANALYTICS_RETENTION_DAYS: Number(process.env.ANALYTICS_RETENTION_DAYS ?? 365),
};
