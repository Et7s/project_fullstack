/// sportcenter-wireframes/src/api/config.ts
export const API_BASE_URL = 'http://localhost:8000';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};