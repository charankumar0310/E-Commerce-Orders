import React from 'react';
import { type Order } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Props {
  orders: Order[];
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const BOTTLENECK_COLORS = ['#10b981', '#ef4444']; // Green for normal, Red for delayed

const InsightsTab: React.FC<Props> = ({ orders }) => {
  // 1. Orders by Status
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.current_status] = (acc[order.current_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  // 2. Volume by Product
  const productCounts = orders.reduce((acc, order) => {
    acc[order.product_name] = (acc[order.product_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const productData = Object.keys(productCounts).map(key => ({
    name: key.length > 12 ? key.substring(0, 12) + '...' : key,
    count: productCounts[key]
  }));

  // 3. Bottleneck Ratio
  const delayedCount = orders.filter(o => o.bottleneck_flag).length;
  const onTimeCount = orders.length - delayedCount;
  const bottleneckData = [
    { name: 'On Track', value: onTimeCount },
    { name: 'Delayed', value: delayedCount }
  ];

  // 4. Revenue by Status
  const revenueByStatus = orders.reduce((acc, order) => {
    acc[order.current_status] = (acc[order.current_status] || 0) + order.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.keys(revenueByStatus).map(key => ({
    name: key,
    revenue: Math.round(revenueByStatus[key])
  }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', paddingRight: '8px' }}>
      <h3 style={{ margin: 0 }}>Logistics & Fulfillment Insights</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '300px 300px', gap: '24px' }}>
        
        {/* Graph 1 */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ textAlign: 'center', marginBottom: 0 }}>Orders by Status</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 2 */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ textAlign: 'center', marginBottom: 0 }}>Bottleneck Ratio</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={bottleneckData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
              >
                {bottleneckData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BOTTLENECK_COLORS[index % BOTTLENECK_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 3 */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ textAlign: 'center', marginBottom: 0 }}>Volume by Product</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Graph 4 */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ textAlign: 'center', marginBottom: 0 }}>Total Revenue by Status ($)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default InsightsTab;
