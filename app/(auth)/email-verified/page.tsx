import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "E-mail Verificado",
  description: "Seu e-mail foi verificado com sucesso",
  openGraph: { title: "E-mail Verificado", description: "Seu e-mail foi verificado com sucesso" },
}

export default function EmailVerifiedPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">E-mail verificado</CardTitle>
        <CardDescription>
          Seu e-mail foi verificado com sucesso. Sua conta está ativa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-100">
            <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href="/protected">
          <Button>Go to protected page</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
