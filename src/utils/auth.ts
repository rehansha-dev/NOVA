export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  year: string;
  role?: string;
}

const CURRENT_USER_KEY = "nova-current-user";
const API_URL = "https://nova-backend-1-fbh9.onrender.com";

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored) as User; } catch { return null; }
}

export async function signupUser(
  name: string,
  email: string,
  password: string,
  department: string,
  year: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, department, year })
    });
    const data = await response.json();
    
    if (data.success && data.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    return { success: false, message: 'Network error connecting to backend.' };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (data.success && data.user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    return { success: false, message: 'Network error connecting to backend.' };
  }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}
