import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchOrders, type Order } from '../services/api';
import InsightsTab from './Tabs/InsightsTab';
import TableTab from './Tabs/TableTab';
import { LayoutDashboard, Table, LogOut, PackageSearch, BellRing } from 'lucide-react';

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'insights' | 'tables'>('insights');
  const navigate = useNavigate();

  const loadOrders = async (isInitialLoad = false) => {
    try {
      const data = await fetchOrders();
      
      const sortedData = [...data].sort((a, b) => {
        const aLog = a.logs[a.logs.length - 1];
        const bLog = b.logs[b.logs.length - 1];
        if (!aLog && !bLog) return 0;
        if (!aLog) return 1;
        if (!bLog) return -1;
        return new Date(bLog.timestamp).getTime() - new Date(aLog.timestamp).getTime();
      });

      setOrders(sortedData);
      
      if (!isInitialLoad && sortedData.length > 0) {
        const latestOrder = sortedData[0];
        toast(`⚡ ${latestOrder.amazon_tracking_id} is now ${latestOrder.current_status}`, {
          icon: '📦',
          style: {
            borderRadius: '10px',
            background: '#1e293b',
            color: '#fff',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        });
      }

    } catch (error) {
      console.error("Failed to load orders", error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/login');
      return;
    }

    loadOrders(true);

    const ws = new WebSocket('ws://localhost:8000/ws/logistics');
    
    ws.onmessage = (event) => {
      if (event.data === 'UPDATE_AVAILABLE') {
        loadOrders(false);
      }
    };

    return () => {
      ws.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ 
        width: '280px', 
        backgroundColor: '#ffffff', 
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxShadow: '4px 0 10px rgba(0,0,0,0.02)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px', padding: '0 12px' }}>
          <div style={{ background: 'var(--accent-color)', color: 'white', padding: '8px', borderRadius: '8px' }}>
            <PackageSearch size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Logistics Portal</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>E-Commerce Operations</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            className={`nav-btn ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <LayoutDashboard size={20} />
            Analytics Overview
          </button>
          
          <button 
            className={`nav-btn ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            <Table size={20} />
            Consignment Tracking
          </button>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
          <button 
            className="nav-btn logout-btn"
            onClick={() => { localStorage.removeItem('isAuthenticated'); navigate('/login'); }}
          >
            <LogOut size={20} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ 
          backgroundColor: '#ffffff', 
          borderBottom: '1px solid #e2e8f0',
          padding: '20px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>
              {activeTab === 'insights' ? 'Command Center' : 'Network Visibility'}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
              Real-time monitoring of automated fulfillment nodes
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', background: '#eff6ff', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
              <BellRing size={16} /> Live Sync Active
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#64748b' }}>
              AD
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {activeTab === 'insights' ? <InsightsTab orders={orders} /> : <TableTab orders={orders} />}
        </div>
        
      </main>

    </div>
  );
};

export default Dashboard;
