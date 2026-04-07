import axios from 'axios';

const api = axios.create({
  baseURL: 'https://angeetoile-ecohealth.hf.space', 
});

export const getDashboardData = async (filters: any) => {
  const response = await api.get('/api/dashboard-stats', { params: filters });
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
export const getFuturePredictions = async () => {
  const response = await api.get('/api/predict/future-7days');
  return response.data;
};
export const getComparativeData = async (variable: string, year: number) => {
  const response = await api.get('/api/analysis/comparative', { 
    params: { variable, year } 
  });
  return response.data;
};
export const sendChatMessage = async (message: string) => {
  const response = await api.post('/api/chat', { message });
  return response.data;
};
export const getCyclesAnalysis = async (filters: any) => {
  const response = await api.get('/api/analysis/cycles', { params: filters });
  return response.data;
};
export const getMLPerformance = async () => {
  const response = await api.get('/api/ml-performance');
  return response.data;
};
export const getGeneralPredictions = async () => {
  const response = await api.get('/api/predict/general-2026');
  return response.data;
};
