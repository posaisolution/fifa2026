import { defineConfig } from '@prisma/config'

// DATABASE_DIRECT_URL: conexion directa sin pooler — necesaria para migraciones
// DATABASE_URL: conexion pooled (PgBouncer) — usada por el app en runtime
// Si no hay DIRECT_URL, cae al DATABASE_URL (funciona local sin pooler)
const placeholder = 'postgresql://placeholder:placeholder@localhost/placeholder'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_DIRECT_URL ?? process.env.DATABASE_URL ?? placeholder,
  },
})
