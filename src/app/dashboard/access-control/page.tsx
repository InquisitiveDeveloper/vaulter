"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Shield, Users, Key, Lock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { GroupList } from "@/components/access-control/GroupList"
import { PermissionMatrix } from "@/components/access-control/PermissionMatrix"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NeonGradientCard } from "@/components/ui/neon-gradient-card"
import { AuroraText } from "@/components/ui/aurora-text"
import { HyperText } from "@/components/ui/hyper-text"
import { RetroGrid } from "@/components/ui/retro-grid"
import { Particles } from "@/components/ui/particles"
import { TextAnimate } from "@/components/ui/text-animate"
import { AnimatedBeam } from "@/components/ui/animated-beam"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"
import { useRef } from "react"

export default function AccessControlPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeTab, setActiveTab] = useState("groups")
  const { toast } = useToast()

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Animated beam connections between components
  const containerRef = useRef<HTMLDivElement>(null)
  const groupsRef = useRef<HTMLButtonElement>(null)
  const permissionsRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="relative min-h-screen" ref={containerRef}>
      {/* Background Effects */}
      <RetroGrid className="opacity-30" />
      <Particles
        className="absolute inset-0"
        quantity={50}
        ease={80}
        color="#ffffff"
        size={0.4}
        staticity={40}
        vx={0}
        vy={0}
      />
      <InteractiveGridPattern
        className="absolute inset-0 opacity-20"
        width={60}
        height={60}
        squares={[12, 12]}
      />

      {/* Header Section */}
      <div className="relative z-10 space-y-8 p-6">
        <div className="text-center space-y-4">
          <HyperText
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-purple-500 to-blue-600 bg-clip-text text-transparent"
            duration={800}
          >
            ACCESS CONTROL
          </HyperText>
          <AuroraText className="text-xl md:text-2xl">
            Enterprise Security & Authorization
          </AuroraText>
          <TextAnimate
            animation="fadeIn"
            delay={300}
            className="text-lg text-muted-foreground max-w-4xl mx-auto"
          >
            Implement zero-trust security with granular permissions, role-based access control, and real-time authorization monitoring across your entire infrastructure
          </TextAnimate>
        </div>

        {/* Security Overview Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            {
              title: "Active Groups",
              value: "8",
              description: "User groups configured",
              icon: Users,
              color: "from-blue-500 to-cyan-500",
            },
            {
              title: "Permissions",
              value: "47",
              description: "Total permissions set",
              icon: Key,
              color: "from-green-500 to-emerald-500",
            },
            {
              title: "Access Levels",
              value: "3",
              description: "Security tiers defined",
              icon: Shield,
              color: "from-purple-500 to-pink-500",
            },
            {
              title: "Locked Resources",
              value: "12",
              description: "Protected assets",
              icon: Lock,
              color: "from-orange-500 to-red-500",
            },
          ].map((stat, index) => (
            <NeonGradientCard key={stat.title} className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </NeonGradientCard>
          ))}
        </div>

        {/* Main Access Control Interface */}
        <NeonGradientCard className="p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Security Management Center
              </h2>
              <p className="text-muted-foreground">
                Configure and monitor access controls across your vault infrastructure
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="bg-slate-900/50 border border-slate-700 p-1">
                  <TabsTrigger
                    value="groups"
                    className="px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
                    ref={groupsRef}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    User Groups
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    className="px-8 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                    ref={permissionsRef}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Permission Matrix
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Animated Beams between tabs */}
              {containerRef.current && groupsRef.current && permissionsRef.current && (
                <AnimatedBeam
                  containerRef={containerRef}
                  fromRef={groupsRef}
                  toRef={permissionsRef}
                  curvature={-50}
                  gradientStartColor="#00FFF1"
                  gradientStopColor="#9c40ff"
                  duration={4}
                  pathOpacity={0.3}
                />
              )}

              <TabsContent value="groups" className="space-y-6">
                <div className="relative">
                  <GroupList key={`groups-${refreshKey}`} onUpdate={handleRefresh} />
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <div className="relative">
                  <PermissionMatrix key={`permissions-${refreshKey}`} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </NeonGradientCard>
      </div>
    </div>
  )
}

