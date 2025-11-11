"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Eye, EyeOff } from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

interface SecretEditorProps {
  data: Record<string, any>
  onChange: (data: Record<string, any>) => void
  disabled?: boolean
}

export function SecretEditor({ data, onChange, disabled }: SecretEditorProps) {
  const [hiddenFields, setHiddenFields] = useState<Set<string>>(new Set())

  const entries = Object.entries(data)

  const addPair = () => {
    const newKey = `key_${Date.now()}`
    onChange({ ...data, [newKey]: "" })
  }

  const updateKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return
    
    const newData = { ...data }
    const value = newData[oldKey]
    delete newData[oldKey]
    newData[newKey] = value
    onChange(newData)
  }

  const updateValue = (key: string, value: any) => {
    onChange({ ...data, [key]: value })
  }

  const removePair = (key: string) => {
    const newData = { ...data }
    delete newData[key]
    onChange(newData)
  }

  const toggleHidden = (key: string) => {
    const newHidden = new Set(hiddenFields)
    if (newHidden.has(key)) {
      newHidden.delete(key)
    } else {
      newHidden.add(key)
    }
    setHiddenFields(newHidden)
  }

  const isLongValue = (value: any) => {
    return typeof value === "string" && value.length > 50
  }

  return (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <p>No key-value pairs</p>
              <p className="text-sm">Click "Add Pair" to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        entries.map(([key, value]) => (
          <div
            key={key}
            className="flex gap-2 p-3 border rounded-lg bg-card"
          >
            <div className="flex-1 space-y-2">
              <Input
                value={key}
                onChange={(e) => updateKey(key, e.target.value)}
                placeholder="Key"
                disabled={disabled}
                className="font-mono text-sm"
              />
              {isLongValue(value) ? (
                <Textarea
                  value={hiddenFields.has(key) ? "••••••••" : value}
                  onChange={(e) => updateValue(key, e.target.value)}
                  placeholder="Value"
                  disabled={disabled || hiddenFields.has(key)}
                  className="font-mono text-sm"
                  rows={3}
                />
              ) : (
                <Input
                  type={hiddenFields.has(key) ? "password" : "text"}
                  value={value}
                  onChange={(e) => updateValue(key, e.target.value)}
                  placeholder="Value"
                  disabled={disabled}
                  className="font-mono text-sm"
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleHidden(key)}
                disabled={disabled}
                title={hiddenFields.has(key) ? "Show" : "Hide"}
              >
                {hiddenFields.has(key) ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePair(key)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addPair}
        disabled={disabled}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Pair
      </Button>
    </div>
  )
}



