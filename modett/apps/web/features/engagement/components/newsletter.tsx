"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

interface NewsletterProps {
  title?: string
  description?: string
  onSubmit?: (email: string) => void | Promise<void>
}

export function Newsletter({
  title = "Join the Modern Muse community",
  description = "Get the latest fashion trends and exclusive offers delivered to your inbox.",
  onSubmit,
}: NewsletterProps) {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage({ type: "error", text: "Please enter your email address" })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      if (onSubmit) {
        await onSubmit(email)
      }
      setMessage({ type: "success", text: "Thank you for subscribing!" })
      setEmail("")
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-[#4a5568] text-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
            <Mail className="h-8 w-8" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-serif mb-4">{title}</h2>

          {/* Description */}
          <p className="text-gray-300 mb-8 md:mb-10">{description}</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white"
              />
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 min-w-[140px]"
              >
                {isLoading ? "Subscribing..." : "SUBSCRIBE"}
              </Button>
            </div>

            {/* Message */}
            {message && (
              <p
                className={`text-sm ${
                  message.type === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {message.text}
              </p>
            )}
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-gray-400 mt-6">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  )
}
