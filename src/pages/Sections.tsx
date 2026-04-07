// sportcenter-wireframes/src/pages/Sections.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Section } from '../types';
import { API_BASE_URL, getAuthHeaders } from '../api/config';

type SortKey = 'name' | 'trainer' | 'schedule';
type SortOrder = 'asc' | 'desc';

const Sections: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    if (user && !user.profile) {
      navigate('/profile/edit');
    }
  }, [user, navigate]);

  const loadSections = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/sections`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Ошибка загрузки секций');
      }

      const data = await response.json();
      setSections(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить секции');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const userLevel = user?.profile?.level;

  const levelFilteredSections = useMemo(() => {
    if (!userLevel) return sections;
    return sections.filter((section) => !section.level || section.level === userLevel);
  }, [sections, userLevel]);

  const categories = useMemo(() => {
    const cats = levelFilteredSections.map((section) => section.category);
    return Array.from(new Set(cats));
  }, [levelFilteredSections]);

  const filteredSections = useMemo(() => {
    if (!selectedCategory) return [];
    return levelFilteredSections.filter((section) => section.category === selectedCategory);
  }, [levelFilteredSections, selectedCategory]);

  const sortedSections = useMemo(() => {
    const sorted = [...filteredSections].sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
      }

      return 0;
    });

    return sorted;
  }, [filteredSections, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    const nextOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortOrder(nextOrder);
  };

  if (loading) {
    return <div className="page-state">Загрузка секций...</div>;
  }

  if (error) {
    return (
      <div className="page-state card" style={{ maxWidth: 560, margin: '2rem 1rem' }}>
        <h2>Не удалось загрузить секции</h2>
        <p>{error}</p>
        <button className="primary" onClick={loadSections}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Выберите категорию</h1>

      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-filter ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {!selectedCategory && (
        <div className="card" style={{ maxWidth: 720 }}>
          <p>
            Выберите категорию, чтобы увидеть доступные секции, фотографии, описание занятий и примеры упражнений.
          </p>
        </div>
      )}

      {selectedCategory && (
        <>
          <div className="section-toolbar">
            <h2>Секции: {selectedCategory}</h2>
            <button onClick={() => setSelectedCategory('')} style={{ background: 'transparent' }}>
              ✕ Сбросить
            </button>
          </div>

          <div className="sort-toolbar">
            <span>Сортировать по:</span>
            <button className="sort-button" onClick={() => handleSort('name')}>
              Названию {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button className="sort-button" onClick={() => handleSort('trainer')}>
              Тренеру {sortKey === 'trainer' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button className="sort-button" onClick={() => handleSort('schedule')}>
              Расписанию {sortKey === 'schedule' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          {sortedSections.length > 0 ? (
            <div className="sections-grid">
              {sortedSections.map((section) => (
                <div key={section.id} className="section-card section-card--rich">
                  {section.image_url && (
                    <img
                      src={section.image_url}
                      alt={section.image_alt || section.name}
                      className="section-card-image"
                    />
                  )}

                  <div className="category-badge">{section.category}</div>
                  <h3>{section.name}</h3>
                  <p className="description">{section.description}</p>
                  <p><strong>Расписание:</strong> {section.schedule}</p>
                  <p><strong>Тренер:</strong> {section.trainer}</p>

                  {section.what_you_will_do?.length ? (
                    <div className="section-preview-block">
                      <strong>Что будет на тренировке:</strong>
                      <ul>
                        {section.what_you_will_do.slice(0, 2).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {section.exercises?.length ? (
                    <div className="section-preview-block">
                      <strong>Примеры упражнений:</strong>
                      <ul>
                        {section.exercises.slice(0, 2).map((exercise) => (
                          <li key={exercise.title}>{exercise.title}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <Link to={`/section/${section.id}`} className="details-link">Подробнее →</Link>
                </div>
              ))}
            </div>
          ) : (
            <p>В этой категории пока нет секций.</p>
          )}
        </>
      )}
    </div>
  );
};

export default Sections;
