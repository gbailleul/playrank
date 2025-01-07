import type { DashboardResponse } from '../types/index';
import client from './client';

export const dashboardService = {
  getDashboard: (page: number = 1) => {
    return client.get<DashboardResponse>(`/dashboard?page=${page}`);
  }
}; 