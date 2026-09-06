export interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  year: string;
}

const USERS_KEY = "nova-users";
const CURRENT_USER_KEY = "nova-current-user";

function getUsers(): User[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(USERS_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(CURRENT_USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function signupUser(
  name: string,
  email: string,
  password: string,
  department: string,
  year: string
): { success: boolean; message: string } {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.email === normalizedEmail
  );

  if (existingUser) {
    return {
      success: false,
      message: "An account with this email already exists.",
    };
  }

  const newUser: User = {
    id: Date.now(),
    name: name.trim(),
    email: normalizedEmail,
    department: department.trim(),
    year,
  };

  const usersWithPassword = [
    ...users,
    {
      ...newUser,
      password,
    },
  ];

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(usersWithPassword)
  );

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(newUser)
  );

  return {
    success: true,
    message: "Account created successfully.",
  };
}

export function loginUser(
  email: string,
  password: string
): { success: boolean; message: string } {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const storedUser = users.find(
    (user) =>
      user.email === normalizedEmail &&
      (user as User & { password: string }).password === password
  );

  if (!storedUser) {
    return {
      success: false,
      message: "Incorrect email or password.",
    };
  }

  const currentUser: User = {
    id: storedUser.id,
    name: storedUser.name,
    email: storedUser.email,
    department: storedUser.department,
    year: storedUser.year,
  };

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(currentUser)
  );

  return {
    success: true,
    message: "Login successful.",
  };
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}