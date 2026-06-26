import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Lock, 
  Activity, 
  Users, 
  Check,
  ShieldAlert,
  Search
} from 'lucide-react';
import { addUser, deleteUser, updateRolePermissions } from '../../app/slices/authSlice';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Dialog from '../../components/ui/Dialog';
import Badge from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { MOCK_ACTIVITY_LOGS } from '../../services/mockApi';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export function AccessGovernance() {
  const dispatch = useDispatch();
  const { availableUsers, rolesPermissions, user } = useSelector((state) => state.auth);

  // Tabs: 'users' | 'permissions' | 'logs'
  const [activeTab, setTab] = useState('users');

  // Modals
  const [userOpen, setUserOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Cashier');

  // Search logs
  const [logSearch, setLogSearch] = useState('');

  const roles = ['Super Admin', 'Store Manager', 'Cashier', 'Inventory Manager'];
  const modules = ['dashboard', 'pos', 'products', 'inventory', 'purchases', 'expenses', 'hr', 'access', 'reports', 'settings'];

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('Name and Email are required');
      return;
    }

    dispatch(addUser({
      name: name.trim(),
      email: email.trim(),
      role
    }));

    toast.success(`User account "${name}" created!`);
    setUserOpen(false);
    setName('');
    setEmail('');
    setRole('Cashier');
  };

  const handleDeleteUser = (id) => {
    if (id === user.id) {
      toast.error('Cannot delete currently logged in account');
      return;
    }
    if (confirm('Delete this user workspace login account?')) {
      dispatch(deleteUser(id));
      toast.success('User account removed');
    }
  };

  const handlePermissionToggle = (roleName, moduleName, allowed) => {
    // Avoid self-locking
    if (roleName === 'Super Admin' && moduleName === 'access' && !allowed) {
      toast.error('Cannot restrict administrative access modules for Super Admin');
      return;
    }

    dispatch(updateRolePermissions({
      role: roleName,
      module: moduleName,
      allowed
    }));

    toast.success(`Updated permission: ${roleName} - ${moduleName} -> ${allowed ? 'Allowed' : 'Restricted'}`);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground m-0">Access Governance & Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure staff authorization matrix policies and review system audit logs.</p>
        </div>
        {activeTab === 'users' && (
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setUserOpen(true)}
          >
            Create User Account
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border pb-1">
        <button
          onClick={() => setTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          User Accounts Directory
        </button>
        <button
          onClick={() => setTab('permissions')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'permissions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Role Permissions Matrix
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`pb-3 text-sm font-bold border-b-2 px-1 transition-all cursor-pointer ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Security Audit Feed
        </button>
      </div>

      {/* PANELS */}
      {activeTab === 'users' && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Workspace user list</span>
            </CardTitle>
            <CardDescription>Roster of accounts cleared to log into POS terminals.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Profile</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Security Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-8 w-8 rounded-full border border-border object-cover"
                        />
                        <span className="font-bold text-foreground">{u.name}</span>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="primary">{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          disabled={u.id === user.id}
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer disabled:opacity-40"
                          title="Revoke Access"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'permissions' && (
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span>Role Permissions Policy Matrix</span>
            </CardTitle>
            <CardDescription>Grant or restrict feature access levels by role in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-border rounded-xl bg-card">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Role / Clearance</TableHead>
                    {modules.map(mod => (
                      <TableHead key={mod} className="text-center text-[10px] uppercase font-bold tracking-wider capitalize">
                        {mod === 'pos' ? 'POS Terminal' : mod}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map(roleName => (
                    <TableRow key={roleName}>
                      <TableCell className="font-bold text-foreground">{roleName}</TableCell>
                      {modules.map(modName => {
                        const isChecked = rolesPermissions[roleName]?.[modName] || false;
                        return (
                          <TableCell key={modName} className="text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handlePermissionToggle(roleName, modName, e.target.checked)}
                              className="rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4"
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4 max-w-md">
            <Input
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="Search audit actions, users, modules..."
              icon={<Search className="h-4.5 w-4.5" />}
              className="h-9"
            />
          </div>

          <Card className="border border-border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit Log ID</TableHead>
                    <TableHead>Roster User</TableHead>
                    <TableHead>Action details</TableHead>
                    <TableHead>Module Type</TableHead>
                    <TableHead>Time logged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ACTIVITY_LOGS
                    .filter(log => log.user.toLowerCase().includes(logSearch.toLowerCase()) || log.action.toLowerCase().includes(logSearch.toLowerCase()) || log.module.toLowerCase().includes(logSearch.toLowerCase()))
                    .map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-bold text-primary">{log.id}</TableCell>
                        <TableCell className="font-semibold">{log.user}</TableCell>
                        <TableCell className="font-medium text-foreground">{log.action}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{log.module}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{log.time}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 1. REGISTER USER ACCOUNT DIALOG MODAL */}
      <Dialog
        isOpen={userOpen}
        onClose={() => setUserOpen(false)}
        title="Create Store Login Account"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            label="Staff Full Name"
            placeholder="e.g. John Grayson"
            required
          />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            label="Corporate Email Login"
            placeholder="grayson@enterprise.com"
            required
          />
          
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-medium text-foreground/80">Security Role Assignment</label>
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

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUserOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Register Login Account
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}

export default AccessGovernance;
