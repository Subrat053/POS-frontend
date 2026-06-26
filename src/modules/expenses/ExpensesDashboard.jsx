import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  TrendingUp, 
  Filter, 
  Search 
} from 'lucide-react';
import { addExpense, deleteExpense } from '../../app/slices/hrExpenseSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatCurrency, formatDate } from '../../lib/utils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export function ExpensesDashboard() {
  const dispatch = useDispatch();
  const { expenses } = useSelector((state) => state.hrExpense);
  const { activeStore } = useSelector((state) => state.settings);

  // States
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState('Utilities');
  const [amount, setAmount] = useState('');
  const [warehouse, setWarehouse] = useState('Chicago HQ');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const expenseCategories = ['Rent', 'Utilities', 'Salaries', 'Marketing', 'Inventory', 'Others'];
  const warehouses = ['Chicago HQ', 'New York Outlet', 'San Francisco Branch'];

  const handleRecordExpense = (e) => {
    e.preventDefault();
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      toast.error('Expense amount must be greater than 0');
      return;
    }
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    dispatch(addExpense({
      category,
      amount: amtNum,
      warehouse,
      date,
      description: description.trim()
    }));

    toast.success('Expense recorded successfully');
    setCreateOpen(false);
    setAmount('');
    setDescription('');
  };

  const handleDelete = (id) => {
    if (confirm('Delete this expense log? This action is permanent.')) {
      dispatch(deleteExpense(id));
      toast.success('Expense log removed');
    }
  };

  // Filter
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === '' || e.category === catFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpenseVal = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Prepare chart data: sum by category
  const chartData = expenseCategories.map(cat => {
    const value = filteredExpenses
      .filter(e => e.category === cat)
      .reduce((acc, e) => acc + e.amount, 0);
    return { name: cat, amount: value };
  }).filter(item => item.amount > 0);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Store Expenditures</h1>
          <p className="text-muted-foreground text-sm mt-1">Track store leases, payroll, utility costs, and advertising budgets.</p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Record Expense
        </Button>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Total Expense Card */}
        <Card className="lg:col-span-1 flex flex-col justify-center">
          <CardContent className="p-6 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Cumulative Expenses (Period)</p>
            <h2 className="text-4xl font-black text-rose-500 m-0">{formatCurrency(totalExpenseVal)}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Reflects all filtered operating logs at <span className="font-semibold">{activeStore}</span>.
            </p>
          </CardContent>
        </Card>

        {/* Expenses Category breakdown chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="py-4">
            <CardTitle className="text-md font-bold">Category Distribution ($)</CardTitle>
          </CardHeader>
          <CardContent className="h-28 pb-4">
            {chartData.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No expenditures to chart.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Bar dataKey="amount" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Search & Filter Options */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            icon={<Search className="h-4.5 w-4.5" />}
            className="h-9"
          />
          <div className="flex items-center">
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Categories</option>
              {expenseCategories.map(cat => (
                <option key={cat} value={cat}>{cat} expenses</option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-bold">
          {filteredExpenses.length} Records found
        </div>
      </div>

      {/* Expense listing Table */}
      <Card className="border border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date Filed</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Expense Amt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No operating expenditures logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-bold text-primary">{e.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.category}</Badge>
                    </TableCell>
                    <TableCell>{e.warehouse}</TableCell>
                    <TableCell className="text-muted-foreground">{e.date}</TableCell>
                    <TableCell className="font-medium text-foreground">{e.description}</TableCell>
                    <TableCell className="font-bold text-rose-500">{formatCurrency(e.amount)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        title="Delete Log"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 1. RECORD EXPENSE MODAL */}
      <Dialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Record Operating Expenditure"
        size="md"
      >
        <form onSubmit={handleRecordExpense} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {expenseCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Store Location</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              label="Expense Amount ($)"
              placeholder="e.g. 150.00"
              required
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              label="Transaction Date"
              required
            />
          </div>

          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            label="Log Description / Remarks"
            placeholder="e.g. Electric bill Chicago Outlet"
            required
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              File Expenditure
            </Button>
          </div>

        </form>
      </Dialog>

    </div>
  );
}

export default ExpensesDashboard;
