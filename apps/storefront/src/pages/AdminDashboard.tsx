// ================================
// apps/storefront/src/pages/AdminDashboard.tsx
// Admin Dashboard - PART 5 COMPLETE
// ================================

import { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface BusinessMetrics {
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface PerformanceMetrics {
  requestsTotal: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  sseConnections: number;
  failedRequests: number;
}

interface AssistantStats {
  totalQueries: number;
  intents: Record<string, number>;
  functionCalls: Record<string, number>;
  avgResponseMsByIntent: Record<string, number>;
  uptime: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

export default function AdminDashboard() {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [assistantStats, setAssistantStats] = useState<AssistantStats | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected'>('disconnected');

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      // Business metrics
      const businessRes = await fetch(`${API_URL}/api/dashboard/business-metrics`);
      const businessData = await businessRes.json();
      setBusinessMetrics(businessData);

      // Performance metrics
      const perfRes = await fetch(`${API_URL}/api/dashboard/performance`);
      const perfData = await perfRes.json();
      setPerformance(perfData);

      // Assistant stats
      const assistantRes = await fetch(`${API_URL}/api/dashboard/assistant-stats`);
      const assistantData = await assistantRes.json();
      setAssistantStats(assistantData);

      // Orders by status
      const ordersStatusRes = await fetch(`${API_URL}/api/analytics/orders-by-status`);
      const ordersStatusData = await ordersStatusRes.json();
      setOrdersByStatus(ordersStatusData);

      // Revenue chart data (last 30 days)
      function formatDate(date: Date) {
  return date.toISOString().slice(0, 10); // ✅ guarantees YYYY-MM-DD
}

const today = new Date();
const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

const from = formatDate(thirtyDaysAgo);
const to = formatDate(today);

const revenueRes = await fetch(`${API_URL}/api/analytics/daily-revenue?from=${from}&to=${to}`);

      const revenueChartData = await revenueRes.json();
      setRevenueData(revenueChartData);

      // Check DB status
      const healthRes = await fetch(`${API_URL}/health`);
      const healthData = await healthRes.json();
      setDbStatus(healthData.ok ? 'connected' : 'disconnected');

      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Last updated: {lastUpdate.toLocaleTimeString()} 
          <button 
            onClick={fetchDashboardData}
            className="ml-4 text-blue-600 hover:text-blue-800"
          >
            🔄 Refresh
          </button>
        </p>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">System Health</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Database</p>
            <p className={`text-lg font-bold ${dbStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              {dbStatus === 'connected' ? '✓ Connected' : '✗ Disconnected'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">API Status</p>
            <p className="text-lg font-bold text-green-600">✓ Online</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">SSE Connections</p>
            <p className="text-lg font-bold text-blue-600">{performance?.sseConnections || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Assistant Uptime</p>
            <p className="text-lg font-bold text-blue-600">
              {assistantStats ? Math.floor(assistantStats.uptime / 60) : 0}m
            </p>
          </div>
        </div>
      </div>

      {/* Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">
            ${businessMetrics?.revenue.toFixed(2) || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">
            {businessMetrics?.orders || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${businessMetrics?.avgOrderValue.toFixed(2) || 0}
          </p>
        </div>
      </div>

      {/* Charts Row 1: Revenue & Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue Trend (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus as any}

                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {ordersByStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-blue-600">{performance?.requestsTotal || 0}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Avg Latency</p>
            <p className="text-2xl font-bold text-green-600">{performance?.avgLatencyMs || 0}ms</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">P95 Latency</p>
            <p className="text-2xl font-bold text-yellow-600">{performance?.p95LatencyMs || 0}ms</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Failed Requests</p>
            <p className="text-2xl font-bold text-red-600">{performance?.failedRequests || 0}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-green-600">
              {performance?.requestsTotal 
                ? ((1 - (performance.failedRequests / performance.requestsTotal)) * 100).toFixed(1)
                : 100}%
            </p>
          </div>
        </div>
      </div>

      {/* Assistant Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Intent Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Assistant: Intent Distribution ({assistantStats?.totalQueries || 0} queries)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(assistantStats?.intents || {}).map(([intent, count]) => ({ intent, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="intent" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Function Calls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assistant: Function Calls</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(assistantStats?.functionCalls || {}).map(([func, count]) => ({ func, count }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="func" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Response Times by Intent */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Assistant: Avg Response Time by Intent</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(assistantStats?.avgResponseMsByIntent || {}).map(([intent, ms]) => (
            <div key={intent} className="text-center p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600 truncate">{intent}</p>
              <p className="text-2xl font-bold text-blue-600">{ms}ms</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}