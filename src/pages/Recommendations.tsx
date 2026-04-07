// sportcenter-wireframes/src/pages/Recommendations.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, getAuthHeaders } from '../api/config';
import { Recommendation } from '../types';

const recommendationTypeLabel: Record<Recommendation['type'], string> = {
  rest: 'Снизить нагрузку',
  increase: 'Можно прибавить',
  maintain: 'Поддерживать текущий режим',
};

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/recommendations`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Ошибка загрузки рекомендаций');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить рекомендации');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  if (loading) return <div className="page-state">Загрузка рекомендаций...</div>;

  if (error) {
    return (
      <div className="page-state card" style={{ maxWidth: 560, margin: '2rem 1rem' }}>
        <h2>Не удалось получить рекомендации</h2>
        <p>{error}</p>
        <button className="primary" onClick={loadRecommendations}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-toolbar">
        <h1>Рекомендации</h1>
        <button className="primary" onClick={loadRecommendations}>Обновить</button>
      </div>

      {recommendations.length === 0 ? (
        <div className="recommendation-card">
          <p>Пока нет рекомендаций. Заполните дневник тренировок и подробно опишите последнюю тренировку.</p>
        </div>
      ) : (
        recommendations.map((recommendation) => (
          <div key={recommendation.id} className="recommendation-card recommendation-card--rich">
            <div className="recommendation-header">
              <strong>{recommendation.date}</strong>
              <span className={`recommendation-type recommendation-type--${recommendation.type}`}>
                {recommendationTypeLabel[recommendation.type]}
              </span>
            </div>

            {recommendation.title && <h2 className="recommendation-title">{recommendation.title}</h2>}
            {recommendation.summary ? (
              <p className="recommendation-summary">{recommendation.summary}</p>
            ) : (
              <p className="recommendation-summary">{recommendation.text}</p>
            )}

            <div className="recommendation-content-grid">
              {recommendation.basis && recommendation.basis.length > 0 && (
                <div className="recommendation-section-block">
                  <h3>Основано на</h3>
                  <ul className="recommendation-list">
                    {recommendation.basis.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {recommendation.actions && recommendation.actions.length > 0 && (
                <div className="recommendation-section-block">
                  <h3>Что делать</h3>
                  <ul className="recommendation-list">
                    {recommendation.actions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {recommendation.warning && (
              <div className="recommendation-warning">
                <strong>Важно:</strong> {recommendation.warning}
              </div>
            )}
          </div>
        ))
      )}

      <p style={{ color: 'var(--text-secondary)', marginTop: '2rem' }}>
        Рекомендация строится на вашем профиле и последней записи в дневнике. Чем точнее вы описываете тренировку и самочувствие, тем полезнее будет результат.
      </p>
    </div>
  );
};

export default Recommendations;
