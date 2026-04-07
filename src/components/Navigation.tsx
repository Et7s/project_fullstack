/// sportcenter-wireframes/src/components/Navigation.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      {user ? (
        <>
          <NavLink to="/sections" className={({ isActive }) => (isActive ? 'active' : '')}>
            Секции
          </NavLink>
          <NavLink to="/diary" className={({ isActive }) => (isActive ? 'active' : '')}>
            Дневник
          </NavLink>
          <NavLink to="/recommendations" className={({ isActive }) => (isActive ? 'active' : '')}>
            Рекомендации
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            Профиль
          </NavLink>
          <button onClick={handleLogout}>Выйти</button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>
            Вход
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')}>
            Регистрация
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default Navigation;