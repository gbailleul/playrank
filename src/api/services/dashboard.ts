import client from '../client';
import type { DashboardResponse } from '../../types/index';

export const dashboardService = {
  getDashboard: (page: number = 1) => {
    return client.get<DashboardResponse>(`/dashboard?page=${page}`);
  }
}; 