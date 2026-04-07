/// sportcenter-wireframes/src/pages/Profile.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const levelMap = {
    beginner: 'Новичок',
    amateur: 'Любитель',
    pro: 'Профи',
  };

  return (
    <div>
      <h1>Профиль</h1>
      <div className="card" style={{ maxWidth: '600px' , marginLeft: '10px'}}>
        <p><strong>Имя:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        
        {user.profile ? (
          <>
            <h3>Анкета</h3>
            <p><strong>Возраст:</strong> {user.profile.age}</p>
            <p><strong>Пол:</strong> {user.profile.gender === 'male' ? 'Мужской' : user.profile.gender === 'female' ? 'Женский' : 'Другой'}</p>
            <p><strong>Стаж:</strong> {
              user.profile.experience === 'none' ? 'Не занимался' :
              user.profile.experience === 'beginner' ? 'Новичок' :
              user.profile.experience === 'amateur' ? 'Любитель' : 'Профи'
            }</p>
            <p><strong>Рост:</strong> {user.profile.height} см</p>
            <p><strong>Вес:</strong> {user.profile.weight} кг</p>
            <p><strong>Ограничения:</strong> {user.profile.limitations || 'Нет'}</p>
            <p><strong>Цель (дней в неделю):</strong> {user.profile.weeklyGoal}</p>
            <p><strong>Рекомендованный уровень:</strong> {levelMap[user.profile.level || 'beginner']}</p>
            <Link to="/profile/edit" className="details-link">Редактировать анкету</Link>
          </>
        ) : (
          <p>Анкета не заполнена. <Link to="/profile/edit">Заполнить</Link></p>
        )}
      </div>
    </div>
  );
};

export default Profile;