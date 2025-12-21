"use client"

import { Menu } from "lucide-react"
import { useState } from "react"
import type { Task } from "@/app/page"

interface CalendarScreenProps {
  tasks: Task[]
  onOpenDrawer: () => void
}

export default function CalendarScreen({ tasks, onOpenDrawer }: CalendarScreenProps) {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const currentDate = new Date(2025, 11, 21) // December 21, 2025

  const [selectedDate, setSelectedDate] = useState(21)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum
    return null
  })

  const tasksWithDates = tasks
    .filter((t) => !t.completed)
    .map((t) => {
      let day = null

      // Check if task has a due date in December 2025
      if (t.dueDate) {
        const dueDate = new Date(t.dueDate)
        if (dueDate.getMonth() === 11 && dueDate.getFullYear() === 2025) {
          day = dueDate.getDate()
        }
      }

      // If no due date, check for alarm (for demo purposes, use Dec 21)
      if (!day && t.alarm) {
        day = 21
      }

      return day ? { ...t, day } : null
    })
    .filter((t) => t !== null)

  const selectedDateTasks = tasksWithDates.filter((t) => t && t.day === selectedDate)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={onOpenDrawer} className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <Menu className="w-6 h-6 text-[#888]" />
        </button>
        <h1 className="text-sm font-medium tracking-[0.2em] text-[#888]">CALENDAR</h1>
        <div className="w-10" />
      </div>

      {/* Calendar Container */}
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto border border-[#2a2a2a] rounded-2xl p-6 bg-[#0f0f0f]">
          {/* Month/Year */}
          <h2 className="text-center text-xl font-light mb-6 tracking-wide">December 2025</h2>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center text-xs text-[#888] font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-8">
            {days.map((day, i) => {
              const hasTask = day && tasksWithDates.some((t) => t && t.day === day)
              const isToday = day === 21
              const isSelected = day === selectedDate

              return (
                <button
                  key={i}
                  disabled={!day}
                  onClick={() => day && setSelectedDate(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all ${
                    !day
                      ? "bg-transparent text-transparent cursor-default"
                      : isToday && isSelected
                        ? "bg-[#1a1a1a] border-2 border-[#00ff88] text-white shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                        : isSelected
                          ? "bg-[#252525] border-2 border-[#00ccff] text-white shadow-[0_0_10px_rgba(0,204,255,0.3)]"
                          : isToday
                            ? "bg-[#1a1a1a] border border-[#00ff88] text-[#ddd] hover:border-[#00ff88] hover:shadow-[0_0_8px_rgba(0,255,136,0.2)]"
                            : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#ddd] hover:border-[#444] cursor-pointer"
                  }`}
                >
                  <span>{day}</span>
                  {hasTask && !isSelected && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />}
                  {isToday && isSelected && (
                    <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Today's Tasks */}
          <div className="border-t border-[#2a2a2a] pt-6">
            <h3 className="text-sm text-[#888] mb-4 tracking-wide">
              {selectedDate === 21 ? "Today's Tasks" : `Tasks for December ${selectedDate}, 2025`}
            </h3>
            <div className="space-y-2">
              {selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task, i) => (
                  <div key={task.id} className="text-sm text-[#ddd]">
                    <span className="text-[#888]">{i + 1}. </span>
                    {task.title || task.name}
                    {task.dueDate && <span className="text-[#888]"> - Due Date</span>}
                    {!task.dueDate && task.alarm && <span className="text-[#888]"> - {task.alarm}</span>}
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#666] italic">No tasks scheduled</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
