// sportcenter-wireframes/src/pages/SectionDetail.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Section } from '../types';
import { API_BASE_URL, getAuthHeaders } from '../api/config';

const SectionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  const loadSection = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Секция не найдена');
      }

      const data = await response.json();
      setSection(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить секцию');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSection();
  }, [loadSection]);

  const handleSignUp = async () => {
    if (!selectedDate) {
      setEnrollError('Выберите дату для записи.');
      return;
    }

    setEnrolling(true);
    setEnrollError('');

    try {
      const response = await fetch(`${API_BASE_URL}/sections/enroll`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          section_id: Number(id),
          date: selectedDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Ошибка записи');
      }

      alert('Вы успешно записаны на тренировку!');
      navigate('/profile');
    } catch (err: any) {
      setEnrollError(err.message || 'Не удалось записаться');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <div className="page-state">Загрузка секции...</div>;

  if (error) {
    return (
      <div className="page-state card" style={{ maxWidth: 560, margin: '2rem 1rem' }}>
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button className="primary" onClick={loadSection}>Повторить</button>
      </div>
    );
  }

  if (!section) return <div className="page-state">Секция не найдена</div>;

  return (
    <div className="page-container">
      <h1>{section.name}</h1>

      <div className="section-detail-layout">
        <div className="section-card">
          {section.image_url && (
            <img
              src={section.image_url}
              alt={section.image_alt || section.name}
              className="section-detail-image"
            />
          )}

          <p><strong>Категория:</strong> {section.category}</p>
          <p><strong>Описание:</strong> {section.description}</p>
          <p><strong>Расписание:</strong> {section.schedule}</p>
          <p><strong>Тренер:</strong> {section.trainer}</p>
        </div>

        <div className="section-detail-side">
          <div className="card">
            <h3>Что вы будете делать</h3>
            {section.what_you_will_do?.length ? (
              <ul className="detail-list">
                {section.what_you_will_do.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>Описание занятия скоро появится.</p>
            )}
          </div>

          <div className="card">
            <h3>Примеры упражнений</h3>
            {section.exercises?.length ? (
              <div className="exercise-list">
                {section.exercises.map((exercise) => (
                  <div key={exercise.title} className="exercise-card">
                    <strong>{exercise.title}</strong>
                    <p>{exercise.description}</p>
                    <p><span>Зачем:</span> {exercise.purpose}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Список упражнений скоро появится.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        <h2>Запись на тренировку</h2>
        <label>Выберите дату:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {enrollError && <p className="form-error">{enrollError}</p>}
        <button className="primary" onClick={handleSignUp} style={{ marginTop: '1rem' }} disabled={enrolling}>
          {enrolling ? 'Запись...' : 'Записаться'}
        </button>
      </div>
    </div>
  );
};

export default SectionDetail;
