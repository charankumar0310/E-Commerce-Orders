import React, { useState } from 'react';
import { type Order } from '../../services/api';
import { Package, Truck, Box, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  orders: Order[];
}

const STATES = ["PENDING", "PACKED", "SHIPPED", "IN_TRANSIT", "DELIVERED"];

const TableTab: React.FC<Props> = ({ orders }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showBottlenecksOnly, setShowBottlenecksOnly] = useState<boolean>(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Apply Filters
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'ALL' && order.current_status !== filterStatus) return false;
    if (showBottlenecksOnly && !order.bottleneck_flag) return false;
    return true;
  });

  const getStatusBadge = (status: string, isBottleneck: boolean) => {
    if (isBottleneck) return <span className="badge bottleneck">DELAYED</span>;
    if (status === 'DELIVERED') return <span className="badge completed">COMPLETED</span>;
    return <span className="badge active">{status}</span>;
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

  const getNodeClass = (status: string, currentStatus: string, isBottleneck: boolean) => {
    const statusIdx = STATES.indexOf(status);
    const currentIdx = STATES.indexOf(currentStatus);
    if (status === currentStatus) return isBottleneck ? 'timeline-node bottleneck' : 'timeline-node active';
    if (statusIdx < currentIdx) return 'timeline-node completed';
    return 'timeline-node';
  };

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
      
      {/* Table Side */}
      <div className="glass-panel" style={{ flex: 2, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Active Network Consignments</h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={showBottlenecksOnly}
                onChange={(e) => setShowBottlenecksOnly(e.target.checked)}
                style={{ marginRight: '6px' }}
              />
              Bottlenecks Only
            </label>
            
            <select 
              className="custom-select" 
              style={{ width: '150px', padding: '6px 12px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Stages</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrderId(order.id)}
                    style={{ cursor: 'pointer', background: selectedOrderId === order.id ? '#f1f5f9' : '' }}
                  >
                    <td style={{ fontWeight: 600 }}>{order.amazon_tracking_id}</td>
                    <td>{order.product_name}</td>
                    <td>{order.customer_name}</td>
                    <td>${order.amount.toFixed(2)}</td>
                    <td>{getStatusBadge(order.current_status, order.bottleneck_flag)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                    No orders match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dive Panel Side */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {selectedOrder ? (
          <>
            <h3>Deep Dive: {selectedOrder.amazon_tracking_id}</h3>
            <p className="subtitle">{selectedOrder.product_name} to {selectedOrder.customer_name}</p>
            
            <div className="timeline" style={{ flex: 1 }}>
              {STATES.map((state) => {
                const isActive = selectedOrder.current_status === state;
                const isBottleneck = isActive && selectedOrder.bottleneck_flag;
                const logForState = selectedOrder.logs.find(l => l.milestone_status.startsWith(state));
                
                return (
                  <div key={state} className="timeline-item">
                    <div className={getNodeClass(state, selectedOrder.current_status, selectedOrder.bottleneck_flag)}></div>
                    <div className="timeline-content">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isBottleneck ? 'var(--status-bottleneck)' : 'inherit' }}>
                        {getIcon(state)} {state}
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
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Box size={48} style={{ opacity: 0.3, marginBottom: '16px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />
            <p>Select a consignment from the table to view its detailed lifecycle.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TableTab;
