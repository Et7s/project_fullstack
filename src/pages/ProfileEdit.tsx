/// sportcenter-wireframes/src/pages/ProfileEdit.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '../context/AuthContext';

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 25,
    gender: 'male',
    experience: 'beginner',
    height: 175,
    weight: 70,
    limitations: '',
    weeklyGoal: 3,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Загружаем существующий профиль, если он есть
  useEffect(() => {
    if (user?.profile) {
      setProfile(user.profile);
    }
  }, [user]);

  // Редирект после успешного сохранения
  useEffect(() => {
    if (saved && user?.profile) {
      navigate('/sections');
    }
  }, [saved, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setProfile(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const profileData: UserProfile = {
        age: Number(profile.age),
        gender: profile.gender as any,
        experience: profile.experience as any,
        height: Number(profile.height),
        weight: Number(profile.weight),
        limitations: profile.limitations || '',
        weeklyGoal: Number(profile.weeklyGoal),
      };
      await updateProfile(profileData);
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения профиля');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return <div>Загрузка пользователя...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h1>Заполните информацию</h1>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label htmlFor="age">Возраст</label>
          <input
            type="number"
            id="age"
            name="age"
            value={profile.age ?? ''}
            onChange={handleChange}
            required
            min="1"
            max="120"
          />
        </div>

        <div>
          <label htmlFor="gender">Пол</label>
          <select id="gender" name="gender" value={profile.gender ?? 'male'} onChange={handleChange}>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
            <option value="other">Другой</option>
          </select>
        </div>

        <div>
          <label htmlFor="experience">Стаж занятий</label>
          <select id="experience" name="experience" value={profile.experience ?? 'beginner'} onChange={handleChange}>
            <option value="none">Не занимался</option>
            <option value="beginner">Новичок (менее года)</option>
            <option value="amateur">Любитель (1-3 года)</option>
            <option value="pro">Профи (более 3 лет)</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="height">Рост (см)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={profile.height ?? ''}
              onChange={handleChange}
              required
              min="100"
              max="250"
            />
          </div>
          <div>
            <label htmlFor="weight">Вес (кг)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={profile.weight ?? ''}
              onChange={handleChange}
              required
              min="20"
              max="300"
            />
          </div>
        </div>

        <div>
          <label htmlFor="limitations">Ограничения по здоровью (если есть)</label>
          <textarea
            id="limitations"
            name="limitations"
            value={profile.limitations ?? ''}
            onChange={handleChange}
            rows={3}
            placeholder="Например: проблемы с коленями, астма и т.д."
          />
        </div>

        <div>
          <label htmlFor="weeklyGoal">Сколько дней в неделю планируете тренироваться?</label>
          <input
            type="number"
            id="weeklyGoal"
            name="weeklyGoal"
            value={profile.weeklyGoal ?? ''}
            onChange={handleChange}
            required
            min="1"
            max="7"
          />
        </div>

        <button type="submit" className="primary" disabled={isSaving}>
          {isSaving ? 'Сохранение...' : 'Сохранить и продолжить'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;