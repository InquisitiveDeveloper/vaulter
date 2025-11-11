"use client"

import { ApplicationForm } from "@/components/applications/ApplicationForm"

export default function NewApplicationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Application</h1>
        <p className="text-muted-foreground">
          Configure a new application secret path
        </p>
      </div>

      <ApplicationForm />
    </div>
  )
}



