"use client"

import { useState } from "react"
import { Menu, X, CheckCircle } from "lucide-react"
import type { Task } from "@/app/page"

interface TasksGridScreenProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: () => void
  onDeleteTask: (taskId: string) => void
  onOpenDrawer: () => void
  isCompletedView?: boolean
}

export default function TasksGridScreen({
  tasks,
  onTaskClick,
  onAddTask,
  onDeleteTask,
  onOpenDrawer,
  isCompletedView = false,
}: TasksGridScreenProps) {
  const [eraseMode, setEraseMode] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <button onClick={onOpenDrawer} className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <Menu className="w-6 h-6 text-[#888]" />
        </button>
        <h1 className="text-sm font-medium tracking-[0.2em] text-[#888]">{isCompletedView ? "COMPLETED" : "TASKS"}</h1>
        <div className="w-10" />
      </div>

      {/* Task Grid */}
      <div className="flex-1 p-6 pt-8">
        {isCompletedView && tasks.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <CheckCircle className="w-16 h-16 text-[#333] mx-auto mb-4" />
            <p className="text-[#888] text-sm">No completed tasks yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {tasks.map((task) => (
              <div key={task.id} className={`relative ${eraseMode ? "animate-wiggle" : ""}`}>
                <button
                  onClick={() => !eraseMode && onTaskClick(task)}
                  className="w-full aspect-square border border-[#333] rounded-xl bg-[#121212] hover:bg-[#1a1a1a] hover:border-[#444] transition-all overflow-hidden"
                >
                  {task.photo ? (
                    <div className="w-full h-full flex flex-col">
                      <div className="flex-1 relative">
                        <img
                          src={task.photo || "/placeholder.svg"}
                          alt={task.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="px-3 py-2 bg-[#0f0f0f] border-t border-[#2a2a2a]">
                        <p className="text-xs text-[#ddd] font-medium truncate">{task.title}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <p className="text-sm text-[#ddd] font-medium text-center line-clamp-3">{task.title}</p>
                    </div>
                  )}
                </button>
                {task.completed && !eraseMode && (
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-[#34c759] rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                {eraseMode && (
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-[#ff3b30] rounded-full flex items-center justify-center shadow-lg hover:bg-[#ff453a] transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="border-t border-[#2a2a2a] flex">
        <button
          onClick={onAddTask}
          className="flex-1 py-5 text-sm font-medium tracking-wider text-[#ddd] hover:bg-[#1a1a1a] transition-colors"
        >
          ADD TASK
        </button>
        <div className="w-px bg-[#2a2a2a]" />
        <button
          onClick={() => setEraseMode(!eraseMode)}
          className={`flex-1 py-5 text-sm font-medium tracking-wider transition-colors ${
            eraseMode ? "bg-[#1f1f1f] text-white" : "text-[#ddd] hover:bg-[#1a1a1a]"
          }`}
        >
          {eraseMode ? "DONE" : "ERASE TASK"}
        </button>
      </div>
    </div>
  )
}
