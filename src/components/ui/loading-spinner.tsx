import { cn } from "@/lib/utils"
import { TextAnimate } from "./text-animate"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  color?: string
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
}

export function LoadingSpinner({
  className,
  size = "md",
  color = "border-cyan-400"
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent",
        color,
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>

          <TextAnimate
            animation="blurIn"
            className="text-xl font-semibold text-white"
          >
            {message}
          </TextAnimate>

          <TextAnimate
            animation="fadeIn"
            delay={500}
            className="text-sm text-muted-foreground"
          >
            Initializing secure systems...
          </TextAnimate>
        </div>

        {/* Progress Indicator */}
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export function InlineLoader({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg">
      <LoadingSpinner size="sm" color="border-blue-400" />
      <TextAnimate
        animation="fadeIn"
        className="text-sm text-muted-foreground"
      >
        {message}
      </TextAnimate>
    </div>
  )
}



