import React from 'react';
import { type Order, optimizeRoutes } from '../services/api';
import { Zap, Activity, Clock, PackageCheck } from 'lucide-react';

interface RightPanelProps {
  orders: Order[];
  onOrderUpdate: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({ orders, onOrderUpdate }) => {

  const totalDelivered = orders.filter(o => o.current_status === 'DELIVERED').length;
  const activeBottlenecks = orders.filter(o => o.bottleneck_flag).length;
  
  // Calculate average transit time based on logs (mock logic for visual)
  const avgTransitHours = (orders.reduce((acc, order) => {
    return acc + order.logs.reduce((sum, log) => sum + log.process_time_seconds, 0);
  }, 0) / 3600 / (orders.length || 1)).toFixed(1);

  const handleOptimize = async () => {
    await optimizeRoutes();
    onOrderUpdate();
  };

  const getStatusBadge = (status: string, isBottleneck: boolean) => {
    if (isBottleneck) return <span className="badge bottleneck">DELAYED</span>;
    if (status === 'DELIVERED') return <span className="badge completed">COMPLETED</span>;
    return <span className="badge active">{status}</span>;
  };

  return (
    <div className="glass-panel right-panel">
      <div>
        <h2>Operations Analytics Center</h2>
        <p className="subtitle">Real-time macro overview of network logistics and bottlenecks.</p>
      </div>

      <div className="scorecards">
        <div className="glass-panel scorecard">
          <h3><Clock size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Avg Transit Time</h3>
          <div className="value">{avgTransitHours}h</div>
        </div>
        <div className="glass-panel scorecard">
          <h3><Activity size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Active Bottlenecks</h3>
          <div className="value" style={{ color: activeBottlenecks > 0 ? 'var(--status-bottleneck)' : 'inherit' }}>
            {activeBottlenecks}
          </div>
        </div>
        <div className="glass-panel scorecard">
          <h3><PackageCheck size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }}/> Total Delivered</h3>
          <div className="value">{totalDelivered}</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: '16px' }}>Global Network Monitoring</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Product</th>
              <th>Current Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const lastLog = order.logs[order.logs.length - 1];
              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.amazon_tracking_id}</td>
                  <td>{order.product_name}</td>
                  <td>{lastLog ? lastLog.location_node : 'N/A'}</td>
                  <td>{getStatusBadge(order.current_status, order.bottleneck_flag)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <button className="btn btn-primary" onClick={handleOptimize} style={{ width: 'auto' }}>
          <Zap size={20} />
          Run Static Route Optimization Engine
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
