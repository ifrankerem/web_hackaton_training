"use client"

import { useState, useEffect, useCallback } from "react"
import TasksGridScreen from "@/components/tasks-grid-screen"
import CalendarScreen from "@/components/calendar-screen"
import TaskDetailScreen from "@/components/task-detail-screen"
import AddTaskScreen from "@/components/add-task-screen"
import SlidingDrawer from "@/components/sliding-drawer"
import LoginScreen from "@/components/login-screen"
import { getTasks, createTask, deleteTask, toggleTaskComplete, getUserId, clearUser, type ApiTask, type CreateTaskData } from "@/lib/api"

export type Task = {
  id: string
  name: string
  title: string
  type: "picture" | "text" | "mixed"
  photo?: string
  detail?: string
  createdDate: Date
  lastEditedDate: Date
  alarm?: string
  repeats?: string
  completed?: boolean
  dueDate?: string
}

export type Screen = "tasks" | "calendar" | "detail" | "add" | "completed"

// Transform API task to frontend Task format
function apiTaskToTask(apiTask: ApiTask): Task {
  return {
    id: String(apiTask.id),
    name: apiTask.title,
    title: apiTask.title,
    type: apiTask.photo ? "picture" : "text",
    photo: apiTask.photo || undefined,
    detail: apiTask.details || undefined,
    createdDate: new Date(apiTask.created_at),
    lastEditedDate: new Date(apiTask.updated_at),
    alarm: apiTask.alarm_time || undefined,
    repeats: apiTask.repeat_days?.length > 0 ? apiTask.repeat_days.join(", ") : undefined,
    completed: apiTask.is_completed,
    dueDate: apiTask.due_date || undefined,
  }
}

// Helper to convert 12h to 24h format
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ');
  if (!modifier) return time12h; // Already 24h format
  let [hours, minutes] = time.split(':');
  if (hours === '12') hours = '00';
  if (modifier.toUpperCase() === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  return `${hours.padStart(2, '0')}:${minutes}`;
}

export default function Page() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [username, setUsername] = useState<string>("")
  
  // App state
  const [currentScreen, setCurrentScreen] = useState<Screen>("tasks")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check auth on mount
  useEffect(() => {
    const userId = getUserId()
    const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null
    if (userId) {
      setIsAuthenticated(true)
      setUsername(storedUsername || '')
    } else {
      setIsAuthenticated(false)
    }
  }, [])

  // Handle login
  const handleLogin = (userId: number, username: string) => {
    setIsAuthenticated(true)
    setUsername(username)
  }

  // Handle logout
  const handleLogout = () => {
    clearUser()
    setIsAuthenticated(false)
    setUsername("")
    setTasks([])
    setCurrentScreen("tasks")
  }

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      setError(null)
      const apiTasks = await getTasks()
      setTasks(apiTasks.map(apiTaskToTask))
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Fetch tasks on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated, fetchTasks])

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setCurrentScreen("detail")
  }

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen)
    setDrawerOpen(false)
  }

  const handleAddTask = async (newTask: Task, photoFile?: File) => {
    try {
      const createData: CreateTaskData = {
        title: newTask.title || newTask.name,
        details: newTask.detail,
        due_date: newTask.dueDate,
        alarm_time: newTask.alarm ? convertTo24Hour(newTask.alarm) : undefined,
        repeat_days: newTask.repeats ? newTask.repeats.split(", ").map(d => d.trim()) : undefined,
        photo: photoFile,
      }
      
      const created = await createTask(createData)
      setTasks([apiTaskToTask(created), ...tasks])
      setCurrentScreen("tasks")
    } catch (err) {
      console.error("Failed to create task:", err)
      alert("Failed to create task. Please try again.")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(Number(taskId))
      setTasks(tasks.filter((t) => t.id !== taskId))
    } catch (err) {
      console.error("Failed to delete task:", err)
      alert("Failed to delete task. Please try again.")
    }
  }

  const handleToggleComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    try {
      await toggleTaskComplete(Number(taskId), task.completed || false)
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed, lastEditedDate: new Date() } : t)))
    } catch (err) {
      console.error("Failed to toggle task:", err)
    }
  }

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { updateTask } = await import("@/lib/api")
      
      const apiUpdates: Record<string, unknown> = {}
      if (updates.title) apiUpdates.title = updates.title
      if (updates.detail !== undefined) apiUpdates.details = updates.detail
      if (updates.dueDate !== undefined) apiUpdates.due_date = updates.dueDate || null
      if (updates.alarm !== undefined) {
        apiUpdates.alarm_time = updates.alarm ? convertTo24Hour(updates.alarm) : null
      }
      if (updates.repeats !== undefined) {
        apiUpdates.repeat_days = updates.repeats ? updates.repeats.split(", ").map(d => d.trim()) : []
      }
      
      await updateTask(Number(taskId), apiUpdates)
      
      setTasks(tasks.map((t) => 
        t.id === taskId 
          ? { ...t, ...updates, lastEditedDate: new Date() } 
          : t
      ))
      
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...selectedTask, ...updates, lastEditedDate: new Date() })
      }
    } catch (err) {
      console.error("Failed to update task:", err)
      alert("Failed to update task. Please try again.")
    }
  }

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center">
        <div className="text-[#888] animate-pulse">Loading...</div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />
  }

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center">
        <div className="text-[#888] animate-pulse">Loading tasks...</div>
      </div>
    )
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center gap-4">
        <div className="text-[#ff3b30]">{error}</div>
        <button 
          onClick={fetchTasks}
          className="px-6 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg hover:bg-[#222] transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#0B0B0B] text-white overflow-hidden">
      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
      )}

      {/* Sliding Drawer */}
      <SlidingDrawer 
        isOpen={drawerOpen} 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate}
        username={username}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {currentScreen === "tasks" && (
          <TasksGridScreen
            tasks={tasks.filter((t) => !t.completed)}
            onTaskClick={handleTaskClick}
            onAddTask={() => setCurrentScreen("add")}
            onDeleteTask={handleDeleteTask}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        )}
        {currentScreen === "completed" && (
          <TasksGridScreen
            tasks={tasks.filter((t) => t.completed)}
            onTaskClick={handleTaskClick}
            onAddTask={() => setCurrentScreen("add")}
            onDeleteTask={handleDeleteTask}
            onOpenDrawer={() => setDrawerOpen(true)}
            isCompletedView={true}
          />
        )}
        {currentScreen === "calendar" && <CalendarScreen tasks={tasks} onOpenDrawer={() => setDrawerOpen(true)} />}
        {currentScreen === "detail" && selectedTask && (
          <TaskDetailScreen
            task={selectedTask}
            onBack={() => setCurrentScreen("tasks")}
            onOpenDrawer={() => setDrawerOpen(true)}
            onToggleComplete={handleToggleComplete}
            onUpdateTask={handleUpdateTask}
          />
        )}
        {currentScreen === "add" && (
          <AddTaskScreen
            onSave={handleAddTask}
            onCancel={() => setCurrentScreen("tasks")}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        )}
      </div>
    </div>
  )
}
