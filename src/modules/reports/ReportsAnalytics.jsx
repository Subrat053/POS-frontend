import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Layers, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export function ReportsAnalytics() {
  const { products } = useSelector((state) => state.products);
  const { expenses } = useSelector((state) => state.hrExpense);
  const { activeStore } = useSelector((state) => state.settings);

  // Tabs: 'analytics' | 'reports'
  const [activeTab, setTab] = useState('analytics');

  // Report filters
  const [reportType, setReportType] = useState('Sales'); // 'Sales' | 'Inventory' | 'Expenses'
  const [timeRange, setTimeRange] = useState('7days'); // 'today' | '7days' | 'month'

  const handleExportCSV = () => {
    toast.success(`Exporting ${reportType} Report as CSV file...`);
  };

  const handleExportPDF = () => {
    toast.success(`Generating PDF print layout of ${reportType} Report...`);
    window.print();
  };

  // MOCK CALCULATIONS FOR ANALYTICS
  const monthlyData = [
    { name: 'Jan', revenue: 45000, cost: 31000, expenses: 8000 },
    { name: 'Feb', revenue: 52000, cost: 35000, expenses: 8500 },
    { name: 'Mar', revenue: 49000, cost: 33000, expenses: 8200 },
    { name: 'Apr', revenue: 63000, cost: 42000, expenses: 9500 },
    { name: 'May', revenue: 58000, cost: 39000, expenses: 9000 },
    { name: 'Jun', revenue: 74000, cost: 49000, expenses: 10500 }
  ];

  const storePerformance = [
    { name: 'Chicago HQ', sales: 124500 },
    { name: 'New York Outlet', sales: 85200 },
    { name: 'San Francisco Branch', sales: 48900 }
  ];

  // Inventory valuation calculations
  const inventoryValuation = products.map(p => ({
    name: p.name,
    sku: p.sku,
    stock: p.stock,
    value: p.stock * p.price,
    cost: p.stock * p.cost
  }));
  const totalInvValue = inventoryValuation.reduce((acc, i) => acc + i.value, 0);
  const totalInvCost = inventoryValuation.reduce((acc, i) => acc + i.cost, 0);

  return (
    <div className="space-y-6 text-left no-print">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">BI Analytics & Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">Review financial performance, margins, and download audit sheets.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            Deep Analytics
          </button>
          <button
            onClick={() => setTab('reports')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
          >
            Business Reports
          </button>
        </div>
      </div>

      {/* VIEW PANEL ROUTER */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Revenue vs Cost vs Expenses area comparison chart */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Progression (H1 2026)</CardTitle>
              <CardDescription>Comparison of Gross Revenue, Acquisition Cost, and Operating Expenditures.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '10px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(262, 83%, 58%)" fill="hsl(262, 83%, 58%)" fillOpacity={0.1} name="Gross Revenue" />
                  <Area type="monotone" dataKey="cost" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Inventory COGS" />
                  <Area type="monotone" dataKey="expenses" stackId="3" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} name="Operating Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Store Sales Performance bar chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Revenue by Location</CardTitle>
                <CardDescription>Gross invoice returns comparison between store warehouses.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storePerformance} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="sales" fill="hsl(262, 83%, 58%)" radius={[0, 4, 4, 0]} barSize={14} name="Total Sales ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profit Margins breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Profit Margins</CardTitle>
                <CardDescription>Gross profit yield calculated per product unit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {products.map(p => {
                  const grossProfit = p.price - p.cost;
                  const marginPct = (grossProfit / p.price) * 100;
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm py-0.5 border-b border-border/40 pb-2">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-bold text-foreground truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Cost: {formatCurrency(p.cost)} • Sell: {formatCurrency(p.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                          <span>+{marginPct.toFixed(1)}%</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Yield: {formatCurrency(grossProfit)}/u</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

          </div>

        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          
          {/* Report Setup Header Options */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Report Category</span>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Sales">Sales Invoice Report</option>
                  <option value="Inventory">Warehouse Valuation</option>
                  <option value="Expenses">Expenses Audit Log</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 text-left">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Time Range</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="today">Today (24 Hours)</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="month">Current Month</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<FileSpreadsheet className="h-4 w-4" />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button
                size="sm"
                icon={<FileText className="h-4 w-4" />}
                onClick={handleExportPDF}
              >
                Print PDF
              </Button>
            </div>
          </div>

          {/* DYNAMIC REPORT LAYOUT VIEWER */}
          {reportType === 'Sales' && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Sales Invoices Audit Sheet</CardTitle>
                <CardDescription>Consolidated listing of client checkouts and payment methods.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border border-border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Gross Total</TableHead>
                        <TableHead>Tax Rate</TableHead>
                        <TableHead>Final Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-bold text-primary">INV-39420</TableCell>
                        <TableCell>Bruce Wayne</TableCell>
                        <TableCell>Card</TableCell>
                        <TableCell>$3,600.00</TableCell>
                        <TableCell>8.25%</TableCell>
                        <TableCell className="font-bold">$3,897.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-primary">INV-39421</TableCell>
                        <TableCell>John Doe</TableCell>
                        <TableCell>Cash</TableCell>
                        <TableCell>$91.45</TableCell>
                        <TableCell>8.25%</TableCell>
                        <TableCell className="font-bold">$99.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-bold text-primary">INV-39422</TableCell>
                        <TableCell>Sarah Connor</TableCell>
                        <TableCell>Mobile Pay</TableCell>
                        <TableCell>$1,015.00</TableCell>
                        <TableCell>8.25%</TableCell>
                        <TableCell className="font-bold">$1,099.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === 'Inventory' && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Warehouse Catalog Valuation Sheet</CardTitle>
                <CardDescription>Valuations of current assets based on acquisition costs and retail price limits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-secondary/20 p-4 border border-border rounded-xl">
                  <div>
                    <p className="text-muted-foreground uppercase font-bold text-[9px] mb-0.5">Asset Cost Valuation</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(totalInvCost)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground uppercase font-bold text-[9px] mb-0.5">Retail Selling Valuation</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(totalInvValue)}</p>
                  </div>
                </div>

                <div className="overflow-hidden border border-border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Retail Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryValuation.map((i, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-bold text-foreground">{i.name}</TableCell>
                          <TableCell className="font-mono text-xs">{i.sku}</TableCell>
                          <TableCell>{i.stock} units</TableCell>
                          <TableCell>{formatCurrency(i.cost)}</TableCell>
                          <TableCell className="font-semibold text-primary">{formatCurrency(i.value)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === 'Expenses' && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Expenses Audit Ledger</CardTitle>
                <CardDescription>Operating expenditures compiled and grouped by store location.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border border-border rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Expense ID</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date filed</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-bold text-primary">{e.id}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{e.category}</Badge>
                          </TableCell>
                          <TableCell>{e.warehouse}</TableCell>
                          <TableCell>{e.date}</TableCell>
                          <TableCell className="font-medium">{e.description}</TableCell>
                          <TableCell className="font-bold text-rose-500">{formatCurrency(e.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}

    </div>
  );
}

export default ReportsAnalytics;
