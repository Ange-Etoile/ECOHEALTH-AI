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
export const getTrendsData = async (filters: any) => {
  const response = await api.get('/api/analysis/trends', { params: filters });
  return response.data;
};
export const getMapData = (filters:any) => api.get('/api/map', { params: filters }).then(r => r.data);
export const getAnalysisData = async (filters: any) => {
  const response = await api.get('/api/analysis/correlations', { params: filters });
  return response.data;
};
export const getSunshineData = async (filters:any) => {
  const response = await api.get('/api/analysis/sunshine', { params: { year: filters.year } });
  return response.data;
};