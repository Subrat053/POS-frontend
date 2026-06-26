import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  Truck, 
  DollarSign, 
  UserCheck, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { toggleSidebar } from '../../app/slices/settingsSlice';
import { logout } from '../../app/slices/authSlice';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarCollapsed } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navGroups = [
    {
      title: 'Core',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Super Admin', 'Store Manager', 'Inventory Manager'] },
        { name: 'POS Billing', path: '/pos', icon: ShoppingBag, roles: ['Super Admin', 'Store Manager', 'Cashier'] }
      ]
    },
    {
      title: 'Catalog & Inventory',
      items: [
        { name: 'Products', path: '/products', icon: Layers, roles: ['Super Admin', 'Store Manager', 'Inventory Manager'] },
        { name: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['Super Admin', 'Store Manager', 'Inventory Manager'] }
      ]
    },
    {
      title: 'Procurement & Sales',
      items: [
        { name: 'Purchases', path: '/purchases', icon: Truck, roles: ['Super Admin', 'Store Manager', 'Inventory Manager'] },
        { name: 'Expenses', path: '/expenses', icon: DollarSign, roles: ['Super Admin', 'Store Manager'] }
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'HR / Employees', path: '/hr', icon: UserCheck, roles: ['Super Admin', 'Store Manager'] },
        { name: 'Customers', path: '/customers', icon: Users, roles: ['Super Admin', 'Store Manager', 'Cashier'] },
        { name: 'User Access', path: '/access', icon: ShieldCheck, roles: ['Super Admin'] }
      ]
    },
    {
      title: 'Reporting',
      items: [
        { name: 'Reports & Stats', path: '/reports', icon: BarChart3, roles: ['Super Admin', 'Store Manager'] }
      ]
    }
  ];

  // Filter groups and items by user role
  const filteredGroups = navGroups.map(group => {
    const items = group.items.filter(item => item.roles.includes(user?.role));
    return { ...group, items };
  }).filter(group => group.items.length > 0);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-300 z-30 select-none",
        sidebarCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-black text-lg">P</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground bg-clip-text">
              POS<span className="text-primary font-medium">Enterprise</span>
            </span>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="mx-auto h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-primary-foreground font-bold text-sm">P</span>
          </div>
        )}
        
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1 rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {filteredGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!sidebarCollapsed && (
              <h4 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            {group.items.map((item, itemIdx) => (
              <NavLink
                key={itemIdx}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Profile / Logout Section at Bottom */}
      <div className="border-t border-border p-3 space-y-3">
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-primary/20"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer",
            sidebarCollapsed ? "justify-center" : "text-left"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
