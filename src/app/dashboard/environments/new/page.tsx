"use client"

import { EnvironmentForm } from "@/components/environments/EnvironmentForm"

export default function NewEnvironmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Environment</h1>
        <p className="text-muted-foreground">
          Configure a new Vault environment
        </p>
      </div>

      <EnvironmentForm />
    </div>
  )
}



