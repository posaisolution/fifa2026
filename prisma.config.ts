import { defineConfig } from '@prisma/config'

// process.env con fallback para que prisma generate no explote en CI/build
export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost/placeholder',
  },
})
