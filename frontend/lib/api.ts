const API_BASE = '/api';

// ============== AUTH TYPES ==============

export interface AuthUser {
  id: number;
  username: string;
}

// ============== AUTH API ==============

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Login failed');
  }
  return res.json();
}

export async function register(username: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Registration failed');
  }
  return res.json();
}

// Get stored user ID
export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
}

// Save user to localStorage
export function saveUser(user: AuthUser) {
  localStorage.setItem('userId', String(user.id));
  localStorage.setItem('username', user.username);
}

// Clear user from localStorage
export function clearUser() {
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
}

// Get auth headers
function getAuthHeaders(): Record<string, string> {
  const userId = getUserId();
  return userId ? { 'X-User-ID': userId } : {};
}

// ============== TASK TYPES ==============

export interface ApiTask {
  id: number;
  title: string;
  is_completed: boolean;
  details: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
  alarm_time: string | null;
  repeat_days: string[];
  due_date: string | null;
}

export interface CreateTaskData {
  title: string;
  details?: string;
  photo?: File;
  alarm_time?: string;
  repeat_days?: string[];
  due_date?: string;
}

export interface UpdateTaskData {
  title?: string;
  details?: string;
  is_completed?: boolean;
  photo?: File;
  alarm_time?: string | null;
  repeat_days?: string[] | null;
  due_date?: string | null;
}

// ============== TASK API ==============

export async function getTasks(): Promise<ApiTask[]> {
  const res = await fetch(`${API_BASE}/todos`, { 
    cache: 'no-store',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function getTask(id: number): Promise<ApiTask> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch task');
  return res.json();
}

export async function createTask(data: CreateTaskData): Promise<ApiTask> {
  const formData = new FormData();
  formData.append('title', data.title);
  
  if (data.details) formData.append('details', data.details);
  if (data.photo) formData.append('photo', data.photo);
  if (data.alarm_time) formData.append('alarm_time', data.alarm_time);
  if (data.repeat_days && data.repeat_days.length > 0) {
    formData.append('repeat_days', JSON.stringify(data.repeat_days));
  }
  if (data.due_date) formData.append('due_date', data.due_date);

  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to create task');
  }
  return res.json();
}

export async function updateTask(id: number, data: UpdateTaskData): Promise<ApiTask> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to update task');
  }
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function toggleTaskComplete(id: number, currentState: boolean): Promise<ApiTask> {
  return updateTask(id, { is_completed: !currentState });
}
