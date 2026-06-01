import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface LogisticsLog {
  id: number;
  order_id: number;
  milestone_status: string;
  location_node: string;
  timestamp: string;
  process_time_seconds: number;
}

export interface Order {
  id: number;
  amazon_tracking_id: string;
  customer_name: string;
  product_name: string;
  category: string;
  amount: number;
  current_status: string;
  bottleneck_flag: boolean;
  created_at: string;
  logs: LogisticsLog[];
}

export const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get(`${API_URL}/orders`);
  return response.data;
};

export const simulateStep = async (orderId: number): Promise<Order> => {
  const response = await axios.post(`${API_URL}/orders/simulate-step?order_id=${orderId}`);
  return response.data;
};

export const optimizeRoutes = async (): Promise<{ message: string }> => {
  const response = await axios.post(`${API_URL}/admin/optimize-routes`);
  return response.data;
};
