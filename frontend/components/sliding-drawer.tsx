"use client"

import type { Screen } from "@/app/page"
import { Calendar, ListTodo, CheckCircle2, LogOut, User } from "lucide-react"

interface SlidingDrawerProps {
  isOpen: boolean
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  username?: string
  onLogout?: () => void
}

export default function SlidingDrawer({ isOpen, currentScreen, onNavigate, username, onLogout }: SlidingDrawerProps) {
  return (
    <div
      className={`fixed top-0 left-0 h-full w-[75%] max-w-[280px] bg-[#121212] border-r border-[#2a2a2a] z-50 transition-transform duration-300 ease-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* User Info */}
      {username && (
        <div className="p-6 pt-12 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
              <User className="w-6 h-6 text-[#888]" />
            </div>
            <div>
              <p className="text-white font-medium capitalize">{username}</p>
              <p className="text-xs text-[#666]">Personal Tasks</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 p-6 space-y-2">
        <button
          onClick={() => onNavigate("tasks")}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-left transition-all ${
            currentScreen === "tasks"
              ? "bg-[#1f1f1f] text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border-l-2 border-white"
              : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <ListTodo className="w-5 h-5" />
          <span className="text-lg font-medium tracking-wide">TASKS</span>
        </button>
        <button
          onClick={() => onNavigate("calendar")}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-left transition-all ${
            currentScreen === "calendar"
              ? "bg-[#1f1f1f] text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border-l-2 border-white"
              : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-lg font-medium tracking-wide">CALENDAR</span>
        </button>
        <button
          onClick={() => onNavigate("completed")}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg text-left transition-all ${
            currentScreen === "completed"
              ? "bg-[#1f1f1f] text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border-l-2 border-white"
              : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-lg font-medium tracking-wide">COMPLETED</span>
        </button>
      </div>

      {/* Logout */}
      {onLogout && (
        <div className="p-6 border-t border-[#2a2a2a]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[#888] hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium tracking-wide">LOG OUT</span>
          </button>
        </div>
      )}
    </div>
  )
}
