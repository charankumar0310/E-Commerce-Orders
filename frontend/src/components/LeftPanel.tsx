import React from 'react';
import { type Order, simulateStep } from '../services/api';
import { Package, Truck, Box, CheckCircle, AlertTriangle } from 'lucide-react';

interface LeftPanelProps {
  orders: Order[];
  activeOrderId: number | null;
  setActiveOrderId: (id: number) => void;
  onOrderUpdate: () => void;
}

const STATES = ["PENDING", "PACKED", "SHIPPED", "IN_TRANSIT", "DELIVERED"];

const LeftPanel: React.FC<LeftPanelProps> = ({ orders, activeOrderId, setActiveOrderId, onOrderUpdate }) => {
  const activeOrder = orders.find(o => o.id === activeOrderId);

  const handleAdvance = async () => {
    if (activeOrderId) {
      await simulateStep(activeOrderId);
      onOrderUpdate();
    }
  };

  const getNodeClass = (status: string, currentStatus: string, isBottleneck: boolean) => {
    const statusIdx = STATES.indexOf(status);
    const currentIdx = STATES.indexOf(currentStatus);

    if (status === currentStatus) {
      return isBottleneck ? 'timeline-node bottleneck' : 'timeline-node active';
    }
    if (statusIdx < currentIdx) {
      return 'timeline-node completed';
    }
    return 'timeline-node';
  };

  const getIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Box size={16} />;
      case 'PACKED': return <Package size={16} />;
      case 'SHIPPED': return <Truck size={16} />;
      case 'IN_TRANSIT': return <Truck size={16} />;
      case 'DELIVERED': return <CheckCircle size={16} />;
      default: return <Box size={16} />;
    }
  };

  return (
    <div className="glass-panel left-panel">
      <div>
        <h2>Amazon Logistics Tracker</h2>
        <p className="subtitle">Select an active consignment to monitor its lifecycle.</p>
        
        <select 
          className="custom-select" 
          value={activeOrderId || ''} 
          onChange={(e) => setActiveOrderId(Number(e.target.value))}
        >
          <option value="" disabled>Select Shipment...</option>
          {orders.map(order => (
            <option key={order.id} value={order.id}>
              {order.amazon_tracking_id} - {order.product_name}
            </option>
          ))}
        </select>
      </div>

      {activeOrder && (
        <div style={{ flex: 1 }}>
          <div className="timeline">
            {STATES.map((state) => {
              const isActive = activeOrder.current_status === state;
              const isBottleneck = isActive && activeOrder.bottleneck_flag;
              const logForState = activeOrder.logs.find(l => l.milestone_status.startsWith(state));
              
              return (
                <div key={state} className="timeline-item">
                  <div className={getNodeClass(state, activeOrder.current_status, activeOrder.bottleneck_flag)}></div>
                  <div className="timeline-content">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isBottleneck ? 'var(--status-bottleneck)' : 'inherit' }}>
                      {getIcon(state)} 
                      {state}
                      {isBottleneck && <AlertTriangle size={16} />}
                    </h4>
                    {logForState ? (
                      <>
                        <p>{logForState.location_node}</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                          {new Date(logForState.timestamp).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p>Pending...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeOrder && (
        <div>
          <button 
            className={`btn ${activeOrder.bottleneck_flag ? 'btn-warning' : 'btn-primary'}`}
            onClick={handleAdvance}
            disabled={activeOrder.current_status === 'DELIVERED'}
            style={{ opacity: activeOrder.current_status === 'DELIVERED' ? 0.5 : 1 }}
          >
            <Package size={20} />
            {activeOrder.current_status === 'DELIVERED' ? 'Fulfilled' : 'Advance Fulfillment Stage'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeftPanel;
