"use client"

import { useForm } from "react-hook-form"
import { useTransition, useState } from "react"
import { forgotPasswordAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>()

  const onSubmit = (data: { email: string }) => {
    setError(null)
    startTransition(async () => {
      await forgotPasswordAction(data)
      setSent(true)
    })
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verifique seu e-mail</CardTitle>
          <CardDescription>
            Se existir uma conta com esse e-mail, você receberá um link de
            redefinição de senha em breve.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <a
            href="/login"
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            Voltar para o login
          </a>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Esqueceu a senha</CardTitle>
        <CardDescription>
          Insira seu e-mail e enviaremos um link de redefinição
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email", {
                required: "E-mail é obrigatório",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "E-mail inválido",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <a
          href="/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          Voltar para o login
        </a>
      </CardFooter>
    </Card>
  )
}
