import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Activity, 
  Plus, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  Inbox,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  MOCK_ORDERS, 
  MOCK_ACTIVITY_LOGS, 
  MOCK_DASHBOARD_STATS,
  MOCK_PRODUCTS
} from '../../services/mockApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { activeStore } = useSelector((state) => state.settings);
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Dashboard metrics updated');
    }, 600);
  };

  // Recharts color scheme variables matching HSL variables
  const CHART_COLORS = {
    primary: 'hsl(262, 83%, 58%)',
    primaryLight: 'rgba(170, 59, 255, 0.2)',
    success: '#10b981',
    warning: '#f59e0b',
    destructive: '#f43f5e',
    info: '#0ea5e9',
    muted: '#94a3b8'
  };

  const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  const stats = [
    {
      title: "Today's Gross Revenue",
      value: formatCurrency(80100.80),
      description: "+14.2% vs yesterday",
      trend: "up",
      icon: DollarSign,
      color: "text-primary bg-primary/10"
    },
    {
      title: "Total Sales Invoices",
      value: "207",
      description: "+8% vs yesterday",
      trend: "up",
      icon: ShoppingBag,
      color: "text-emerald-500 bg-emerald-500/10"
    },
    {
      title: "Low/Out of Stock Alerts",
      value: MOCK_PRODUCTS.filter(p => p.stock <= p.minStock).length.toString(),
      description: "Needs immediate restock",
      trend: "warning",
      icon: AlertTriangle,
      color: "text-amber-500 bg-amber-500/10"
    },
    {
      title: "Active Registers Status",
      value: "4 Online",
      description: `Terminal active at ${activeStore}`,
      trend: "normal",
      icon: Activity,
      color: "text-sky-500 bg-sky-500/10"
    }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's the performance breakdown for <span className="font-semibold text-primary">{activeStore}</span> today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            icon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
          >
            Refresh Feed
          </Button>
          <Button 
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/pos')}
          >
            New Checkout Ticket
          </Button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} hoverable>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                  <p className="text-xs text-muted-foreground">
                    <span className={`font-semibold ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'warning' ? 'text-amber-500' : 'text-primary'}`}>
                      {stat.description}
                    </span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Hourly Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Revenue Progression</CardTitle>
            <CardDescription>Intraday gross performance tracked at 1-hour increments.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DASHBOARD_STATS.salesTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="hour" stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} />
                <YAxis stroke={CHART_COLORS.muted} fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  labelClassName="font-semibold text-xs"
                />
                <Area type="monotone" dataKey="sales" stroke={CHART_COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" name="Sales Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Share Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Category Share</CardTitle>
            <CardDescription>Product volume distribution.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-between">
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_DASHBOARD_STATS.categoryShare}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {MOCK_DASHBOARD_STATS.categoryShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {MOCK_DASHBOARD_STATS.categoryShare.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 justify-center">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  <span className="font-medium text-muted-foreground truncate">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Bottom Table and Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Invoices Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Live POS Invoices</CardTitle>
              <CardDescription>Recently recorded checkout transactions.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" icon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/reports')}>
              View Logs
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amt</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_ORDERS.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold text-primary">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.items} items</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Completed' ? 'success' : order.status === 'Pending' ? 'warning' : 'destructive'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Real-time Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Live Activity Timeline</CardTitle>
            <CardDescription>Audit feeds of registers & admin events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_ACTIVITY_LOGS.map((log) => (
              <div key={log.id} className="flex gap-3 text-left">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <UserCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div className="w-0.5 flex-1 bg-border/60 my-1" />
                </div>
                <div className="flex-1 pb-4 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-sm truncate text-foreground">{log.user}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{log.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.action}</p>
                  <span className="inline-block mt-1 text-[9px] font-semibold bg-secondary px-1.5 py-0.25 rounded">
                    {log.module}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default Dashboard;
