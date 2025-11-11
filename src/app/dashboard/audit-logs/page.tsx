"use client"

import { AuditLogTable } from "@/components/audit/AuditLogTable"
import { HyperText } from "@/components/ui/hyper-text"
import { AuroraText } from "@/components/ui/aurora-text"
import { RetroGrid } from "@/components/ui/retro-grid"
import { Particles } from "@/components/ui/particles"
import { TextAnimate } from "@/components/ui/text-animate"

export default function AuditLogsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Effects */}
      <RetroGrid className="opacity-30" />
      <Particles
        className="absolute inset-0"
        quantity={60}
        ease={80}
        color="#ffffff"
        size={0.4}
        staticity={30}
        vx={0}
        vy={0}
      />

      {/* Header Section */}
      <div className="relative z-10 space-y-8 p-6">
        <div className="text-center space-y-4">
          <HyperText
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent"
            duration={800}
          >
            AUDIT LOGS
          </HyperText>
          <AuroraText className="text-xl md:text-2xl">
            Security Event Monitoring & Compliance
          </AuroraText>
          <TextAnimate
            animation="fadeIn"
            delay={300}
            className="text-lg text-muted-foreground max-w-4xl mx-auto"
          >
            Monitor all system activities, security events, and user actions with comprehensive audit trails for compliance and forensic analysis
          </TextAnimate>
        </div>

        {/* Audit Log Interface */}
        <AuditLogTable />
      </div>
    </div>
  )
}

