/// sportcenter-wireframes/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { API_BASE_URL, getAuthHeaders } from '../api/config';

export interface UserProfile {
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  experience: 'none' | 'beginner' | 'amateur' | 'pro' | null;
  height: number | null;
  weight: number | null;
  limitations: string;
  weeklyGoal: number | null;
  level?: 'beginner' | 'amateur' | 'pro' | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const transformUser = (data: any): User => {
  const { id, name, email, age, gender, experience, height, weight, limitations, weeklyGoal, level } = data;
  // Считаем профиль заполненным, если возраст не null
  const hasProfile = age != null;
  if (hasProfile) {
    const profile: UserProfile = {
      age: age,
      gender: gender,
      experience: experience,
      height: height,
      weight: weight,
      limitations: limitations || '',
      weeklyGoal: weeklyGoal,
      level: level,
    };
    return { id, name, email, profile };
  } else {
    return { id, name, email };
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(transformUser(data));
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('token', data.access_token);

      const userRes = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(transformUser(userData));
        return true;
      } else {
        localStorage.removeItem('token');
        return false;
      }
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem('token', data.access_token);

      const userRes = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(transformUser(userData));
        return true;
      } else {
        localStorage.removeItem('token');
        return false;
      }
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profile: UserProfile) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/users/me/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        console.log('Updated user from server:', updatedUser); // для отладки
        setUser(transformUser(updatedUser));
      } else {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Ошибка обновления профиля');
      }
    } catch (err) {
      console.error('Update profile error', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};