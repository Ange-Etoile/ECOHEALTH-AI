import axios from 'axios';

const api = axios.create({
  baseURL: 'https://angeetoile-ecohealth.hf.space', 
});

export const getDashboardData = async (filters: any) => {
  const response = await api.get('/api/kpi', { params: filters });
  return response.data;
};

export const getFilterOptions = async () => {
  const response = await api.get('/api/filters');
  return response.data;
};