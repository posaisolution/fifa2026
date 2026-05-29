'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { AuthCard } from '@/components/auth/auth-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({ email: z.email('Email inválido') })
type Input = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input>({ resolver: zodResolver(schema) })

  async function onSubmit() {
    // TODO Fase 4: integrar proveedor de email (Resend / SendGrid)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    toast.success('Si el email existe, recibirás las instrucciones.')
  }

  if (sent) {
    return (
      <AuthCard
        title="Email enviado"
        description="Revisa tu bandeja de entrada y sigue las instrucciones."
      >
        <div className="py-4 text-center">
          <div className="mb-4 text-4xl">📬</div>
          <Link href="/login" className="text-primary font-medium hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Recuperar contraseña"
      description="Ingresá tu email y te enviamos las instrucciones"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="text-muted-foreground hover:text-foreground">
          ← Volver al inicio de sesión
        </Link>
      </div>
    </AuthCard>
  )
}
