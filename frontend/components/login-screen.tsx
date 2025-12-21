"use client"

import { useState } from "react"
import { User, Lock, ArrowRight, UserPlus } from "lucide-react"

interface LoginScreenProps {
  onLogin: (userId: number, username: string) => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { login, register, saveUser } = await import("@/lib/api")
      
      let user
      if (isRegister) {
        user = await register(username, password)
      } else {
        user = await login(username, password)
      }
      
      saveUser(user)
      onLogin(user.id, user.username)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#333] to-[#1a1a1a] flex items-center justify-center border border-[#333]">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-light text-white tracking-wider">TASK MANAGER</h1>
          <p className="text-[#666] text-sm mt-2">
            {isRegister ? "Create your account" : "Sign in to continue"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-[#333] rounded-xl text-white placeholder:text-[#555] focus:border-[#555] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555]" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-[#333] rounded-xl text-white placeholder:text-[#555] focus:border-[#555] focus:outline-none transition-colors"
              required
              minLength={4}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm text-center p-3 bg-red-400/10 border border-red-400/20 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-black rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#eee] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <>
                {isRegister ? (
                  <>
                    <UserPlus className="w-5 h-5" />
                    CREATE ACCOUNT
                  </>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister)
              setError("")
            }}
            className="text-[#888] text-sm hover:text-white transition-colors"
          >
            {isRegister ? (
              <>Already have an account? <span className="text-white">Sign in</span></>
            ) : (
              <>Don't have an account? <span className="text-white">Create one</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
