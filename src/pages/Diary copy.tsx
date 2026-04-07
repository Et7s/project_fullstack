import React, { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { API_BASE_URL, getAuthHeaders } from '../api/config';

const Diary: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEntry, setNewEntry] = useState<Partial<DiaryEntry>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/diary`, {
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Ошибка загрузки дневника');
        const data = await res.json();
        setEntries(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newEntry.date || !newEntry.duration) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/diary`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          date: newEntry.date,
          duration: newEntry.duration,
          intensity: newEntry.intensity || 'medium',
          notes: newEntry.notes || '',
          feeling: newEntry.feeling || 5,
        }),
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      const savedEntry = await res.json();
      setEntries([savedEntry, ...entries]);
      setNewEntry({});
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Загрузка дневника...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h1>Дневник тренировок</h1>
      
      <div className="card" style={{ marginBottom: '2rem', maxWidth: '700px', marginLeft: '600px', paddingLeft: '1rem'}}>
        <h3>Добавить запись</h3>
        <div>
          <label>Дата: </label>
          <input type="date" value={newEntry.date || ''} onChange={e => setNewEntry({...newEntry, date: e.target.value})} />
        </div>
        <div>
          <label>Длительность (мин): </label>
          <input type="number" value={newEntry.duration || ''} onChange={e => setNewEntry({...newEntry, duration: +e.target.value})} />
        </div>
        <div>
          <label>Интенсивность: </label>
          <select value={newEntry.intensity || 'medium'} onChange={e => setNewEntry({...newEntry, intensity: e.target.value as any})}>
            <option value="low">Низкая</option>
            <option value="medium">Средняя</option>
            <option value="high">Высокая</option>
          </select>
        </div>
        <div>
          <label>Заметки: </label>
          <textarea value={newEntry.notes || ''} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} />
        </div>
        <div>
          <label>Самочувствие (1-10): </label>
          <input type="number" min="1" max="10" value={newEntry.feeling || 5} onChange={e => setNewEntry({...newEntry, feeling: +e.target.value})} />
        </div>
        <button 
          style={{marginTop: '15px'}} 
          className="primary"
          onClick={handleAdd}
          disabled={saving}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>

      <div style={{paddingLeft: '1rem'}}>
        <h3>История</h3>
      </div>
      {entries.map(entry => (
        <div key={entry.id} className="diary-entry"> 
          <strong>{entry.date}</strong> – {entry.duration} мин, интенсивность: {entry.intensity}, самочувствие: {entry.feeling}/10
          {entry.notes && <p><em>{entry.notes}</em></p>}
        </div>
      ))}
    </div>
  );
};

export default Diary;