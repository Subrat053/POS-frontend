import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  Clock, 
  Plus, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Building2
} from 'lucide-react';
import { addEmployee, deleteEmployee, logAttendance } from '../../app/slices/hrExpenseSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export function HrAttendance() {
  const dispatch = useDispatch();
  
  const { employees, attendanceLogs } = useSelector((state) => state.hrExpense);

  // States
  const [activeTab, setTab] = useState('employees'); // 'employees' | 'attendance'
  const [createOpen, setCreateOpen] = useState(false);

  // Clock widget states
  const [clockEmp, setClockEmp] = useState(employees[0]?.id || '');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Cashier');
  const [location, setLocation] = useState('Chicago HQ');

  const roles = ['Super Admin', 'Store Manager', 'Cashier', 'Inventory Manager'];
  const locations = ['Chicago HQ', 'New York Outlet', 'San Francisco Branch'];

  const handleRegisterEmployee = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Employee name and email required');
      return;
    }

    dispatch(addEmployee({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      location
    }));

    toast.success('Employee registered in system roster');
    setCreateOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleDelete = (id) => {
    if (confirm('Remove employee from payroll directory? Logs will remain preserved.')) {
      dispatch(deleteEmployee(id));
      toast.success('Employee record deleted');
    }
  };

  const handleClockToggle = (empId, currentStatus) => {
    const nextEvent = currentStatus === 'Clock In' ? 'Clock Out' : 'Clock In';
    
    dispatch(logAttendance({
      employeeId: empId,
      event: nextEvent
    }));

    toast.success(`Employee clocked: ${nextEvent}`);
  };

  const selectedClockEmp = employees.find(e => e.id === clockEmp);

  return (
    <div className="space-y-6 text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">HR & Attendance Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employee rosters and active cashier work shifts.</p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Add Employee
        </Button>
      </div>

      {/* Roster Summaries & Shift Clock Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clock In / Out Simulator panel */}
        <Card className="lg:col-span-1 border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Shift Register Clock</span>
            </CardTitle>
            <CardDescription>Check in/out store staff registers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Select Employee</label>
              <select
                value={clockEmp}
                onChange={(e) => setClockEmp(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>

            {selectedClockEmp && (
              <div className="border border-border p-4 rounded-xl bg-secondary/20 space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-foreground">{selectedClockEmp.name}</span>
                  <Badge variant={selectedClockEmp.status === 'Clock In' ? 'success' : 'secondary'}>
                    {selectedClockEmp.status}
                  </Badge>
                </div>
                
                <Button
                  onClick={() => handleClockToggle(selectedClockEmp.id, selectedClockEmp.status)}
                  className="w-full justify-center h-10"
                  variant={selectedClockEmp.status === 'Clock In' ? 'outline' : 'primary'}
                  icon={selectedClockEmp.status === 'Clock In' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                >
                  {selectedClockEmp.status === 'Clock In' ? 'Clock Out of Shift' : 'Clock In to Shift'}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Dynamic Shift summaries widgets */}
        <Card className="lg:col-span-2 border border-border flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Staff Shift Summary</CardTitle>
            <CardDescription>Shift metrics and roster status breakdown.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 items-center flex-1">
            <div className="space-y-1 text-center border-r border-border">
              <p className="text-xs text-muted-foreground font-semibold">Total Staff</p>
              <h3 className="text-3xl font-black text-foreground">{employees.length}</h3>
            </div>
            <div className="space-y-1 text-center border-r border-border">
              <p className="text-xs text-muted-foreground font-semibold">Shift Active</p>
              <h3 className="text-3xl font-black text-emerald-500">
                {employees.filter(e => e.status === 'Clock In').length}
              </h3>
            </div>
            <div className="space-y-1 text-center">
              <p className="text-xs text-muted-foreground font-semibold">Off Shift</p>
              <h3 className="text-3xl font-black text-muted-foreground">
                {employees.filter(e => e.status !== 'Clock In').length}
              </h3>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border pb-1">
        <button
          onClick={() => setTab('employees')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'employees' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Staff Directory
        </button>
        <button
          onClick={() => setTab('attendance')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'attendance' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Attendance shift Logs
        </button>
      </div>

      {/* HR VIEW MANAGER */}
      {activeTab === 'employees' && (
        <Card className="border border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Role Title</TableHead>
                  <TableHead>Email Contact</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Shift Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-bold text-foreground">{emp.name}</TableCell>
                    <TableCell>{emp.role}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.phone || 'N/A'}</TableCell>
                    <TableCell>{emp.location}</TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'Clock In' ? 'success' : 'secondary'}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                        title="Remove Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'attendance' && (
        <Card className="border border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Shift event</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-bold text-primary">{log.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{log.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant={log.event === 'Clock In' ? 'success' : 'secondary'}>
                        {log.event}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(log.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 1. ADD EMPLOYEE MODAL */}
      <Dialog
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Register Employee Shift Account"
        size="md"
      >
        <form onSubmit={handleRegisterEmployee} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Full Employee Name"
            placeholder="e.g. Martha Wayne"
            required
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            label="Corporate Email Address"
            placeholder="martha@enterprise.com"
            required
          />
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            label="Telephone Contact"
            placeholder="+1 312-555-0155"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Role Clearance</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-sm font-medium text-foreground/80">Store Location Assignment</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Register Employee
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

export default HrAttendance;
