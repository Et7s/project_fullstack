// sportcenter-wireframes/src/pages/Diary.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { DiaryEntry } from '../types';
import { API_BASE_URL, getAuthHeaders } from '../api/config';
import { buildDiaryNotes, parseDiaryNotes } from '../utils/diaryNotes';

type DiaryFormState = {
  date: string;
  duration: number | '';
  intensity: 'low' | 'medium' | 'high';
  feeling: number | '';
  workoutType: string;
  comment: string;
};

const initialForm: DiaryFormState = {
  date: '',
  duration: '',
  intensity: 'medium',
  feeling: 5,
  workoutType: '',
  comment: '',
};

const Diary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [newEntry, setNewEntry] = useState<DiaryFormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/diary`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Ошибка загрузки дневника');
      }

      const data = await response.json();
      setEntries(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить дневник');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const resetForm = () => {
    setNewEntry(initialForm);
    setEditingId(null);
    setIsEditing(false);
    setFormError('');
  };

  const validateForm = () => {
    if (!newEntry.date) return 'Укажите дату тренировки.';
    if (!newEntry.duration || Number(newEntry.duration) <= 0) return 'Укажите корректную длительность.';
    if (!newEntry.feeling || Number(newEntry.feeling) < 1 || Number(newEntry.feeling) > 10) {
      return 'Самочувствие должно быть от 1 до 10.';
    }
    if (!newEntry.workoutType.trim()) return 'Укажите, какая была тренировка.';
    if (!newEntry.comment.trim()) return 'Добавьте комментарий о том, как прошла тренировка.';
    return '';
  };

  const makePayload = () => ({
    date: newEntry.date,
    duration: Number(newEntry.duration),
    intensity: newEntry.intensity,
    notes: buildDiaryNotes(newEntry.workoutType, newEntry.comment),
    feeling: Number(newEntry.feeling),
  });

  const handleAdd = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const response = await fetch(`${API_BASE_URL}/diary`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(makePayload()),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Ошибка сохранения');
      }

      const savedEntry = await response.json();
      setEntries((prev) => [savedEntry, ...prev]);
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Не удалось сохранить запись');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (entry: DiaryEntry) => {
    const parsedNotes = parseDiaryNotes(entry.notes);
    setEditingId(entry.id);
    setIsEditing(true);
    setFormError('');
    setNewEntry({
      date: entry.date,
      duration: entry.duration,
      intensity: entry.intensity,
      workoutType: parsedNotes.workoutType,
      comment: parsedNotes.comment,
      feeling: entry.feeling,
    });
  };

  const handleUpdate = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!editingId) return;

    setSaving(true);
    setFormError('');

    try {
      const response = await fetch(`${API_BASE_URL}/diary/${editingId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(makePayload()),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Ошибка обновления');
      }

      const updatedEntry = await response.json();
      setEntries((prev) => prev.map((entry) => (entry.id === editingId ? updatedEntry : entry)));
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Не удалось обновить запись');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить запись?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/diary/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || 'Ошибка удаления');
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err: any) {
      alert(err.message || 'Не удалось удалить запись');
    }
  };

  if (loading) return <div className="page-state">Загрузка дневника...</div>;

  if (error) {
    return (
      <div className="page-state card" style={{ maxWidth: 560, margin: '2rem 1rem' }}>
        <h2>Не удалось загрузить дневник</h2>
        <p>{error}</p>
        <button className="primary" onClick={loadEntries}>Повторить</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Дневник тренировок</h1>

      <div className="card diary-form-card">
        <h3>{isEditing ? 'Редактировать запись' : 'Добавить запись'}</h3>

        <div className="diary-form-grid">
          <div>
            <label>Дата</label>
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
            />
          </div>

          <div>
            <label>Длительность (мин)</label>
            <input
              type="number"
              value={newEntry.duration}
              onChange={(e) => setNewEntry({ ...newEntry, duration: e.target.value ? Number(e.target.value) : '' })}
            />
          </div>

          <div>
            <label>Интенсивность</label>
            <select
              value={newEntry.intensity}
              onChange={(e) => setNewEntry({ ...newEntry, intensity: e.target.value as DiaryFormState['intensity'] })}
            >
              <option value="low">Низкая</option>
              <option value="medium">Средняя</option>
              <option value="high">Высокая</option>
            </select>
          </div>

          <div>
            <label>Самочувствие (1–10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={newEntry.feeling}
              onChange={(e) => setNewEntry({ ...newEntry, feeling: e.target.value ? Number(e.target.value) : '' })}
            />
          </div>
        </div>

        <div>
          <label>Какая была тренировка</label>
          <input
            type="text"
            value={newEntry.workoutType}
            onChange={(e) => setNewEntry({ ...newEntry, workoutType: e.target.value })}
            placeholder="Например: футбол, йога, силовая"
          />
        </div>

        <div>
          <label>Комментарий</label>
          <textarea
            rows={5}
            value={newEntry.comment}
            onChange={(e) => setNewEntry({ ...newEntry, comment: e.target.value })}
            placeholder="Опишите, как прошла тренировка, что далось легко, что болит, есть ли усталость и что хотелось бы изменить."
          />
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button onClick={isEditing ? handleUpdate : handleAdd} className="primary" disabled={saving}>
            {saving ? 'Сохранение...' : isEditing ? 'Обновить' : 'Сохранить'}
          </button>
          {isEditing && (
            <button onClick={resetForm} style={{ background: 'transparent' }}>
              Отмена
            </button>
          )}
        </div>
      </div>

      <h3>История</h3>
      {entries.length === 0 && <p>Пока нет записей. Добавьте первую тренировку.</p>}

      <div className="diary-list">
        {entries.map((entry) => {
          const parsedNotes = parseDiaryNotes(entry.notes);
          return (
            <div key={entry.id} className="diary-entry">
              <strong>{entry.date}</strong> — {entry.duration} мин, интенсивность: {entry.intensity}, самочувствие: {entry.feeling}/10
              {parsedNotes.workoutType && (
                <p><strong>Тренировка:</strong> {parsedNotes.workoutType}</p>
              )}
              {parsedNotes.comment && (
                <p>
                  <em>{parsedNotes.comment}</em>
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => startEdit(entry)}>Редактировать</button>
                <button onClick={() => handleDelete(entry.id)}>Удалить</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Diary;
