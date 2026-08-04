"use client"

import { useForm } from "react-hook-form"
import { useTransition, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPasswordAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordStrength } from "@/components/password-strength"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ newPassword: string; confirmPassword: string }>()

  const onSubmit = (data: { newPassword: string }) => {
    if (!token) {
      setError("Token de redefinição inválido ou ausente")
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await resetPasswordAction({
        token,
        newPassword: data.newPassword,
      })
      if (res?.error) {
        setError(res.error)
      } else {
        router.push("/login")
      }
    })
  }

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Link inválido</CardTitle>
          <CardDescription>
            Este link de redefinição de senha é inválido ou expirou.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <a
            href="/forgot-password"
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            Solicitar novo link de redefinição
          </a>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Redefinir senha</CardTitle>
        <CardDescription>Insira sua nova senha abaixo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Digite a nova senha"
              {...register("newPassword", {
                required: "Senha é obrigatória",
                minLength: {
                  value: 8,
                  message: "Senha deve ter pelo menos 8 caracteres",
                },
                validate: (val: string) => {
                  if (!/[a-z]/.test(val)) return "Deve conter letra minúscula"
                  if (!/[A-Z]/.test(val)) return "Deve conter letra maiúscula"
                  if (!/\d/.test(val)) return "Deve conter um número"
                  if (!/[^a-zA-Z0-9]/.test(val)) return "Deve conter um símbolo"
                  return true
                },
              })}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
            <PasswordStrength value={watch("newPassword") ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme a nova senha"
              {...register("confirmPassword", {
                required: "Por favor, confirme sua senha",
                validate: (val: string) =>
                  val === watch("newPassword") || "Senhas não conferem",
              })}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Redefinindo..." : "Redefinir senha"}
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
