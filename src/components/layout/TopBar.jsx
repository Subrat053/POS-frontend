import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  Sun, 
  Moon, 
  Globe, 
  Building2, 
  Search, 
  User, 
  Check, 
  Settings as SettingsIcon,
  LogOut 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { changeStore, markAllNotificationsRead } from '../../app/slices/settingsSlice';
import { logout } from '../../app/slices/authSlice';
import { cn } from '../../lib/utils';

export function TopBar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  
  const { activeStore, availableStores, notifications } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);

  const [storeOpen, setStoreOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Generate dynamic breadcrumbs from pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  const getBreadcrumbTitle = (path) => {
    if (path === 'pos') return 'Sales POS Terminal';
    if (path === 'products') return 'Catalog Management';
    if (path === 'inventory') return 'Inventory Control';
    if (path === 'purchases') return 'Purchase Orders';
    if (path === 'expenses') return 'Operating Expenses';
    if (path === 'hr') return 'HR & Attendance';
    if (path === 'access') return 'Access Governance';
    if (path === 'reports') return 'Reports & Analytics';
    if (path === 'settings') return 'System Settings';
    if (path === 'profile') return 'My Profile';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 border-b border-border bg-card/75 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground select-none">
        <Link to="/dashboard" className="hover:text-foreground font-medium transition-colors">Home</Link>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = getBreadcrumbTitle(value);
          return (
            <React.Fragment key={to}>
              <span className="text-muted-foreground/40">/</span>
              {isLast ? (
                <span className="font-semibold text-foreground">{label}</span>
              ) : (
                <Link to={to} className="hover:text-foreground transition-colors">{label}</Link>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        
        {/* Store Switcher */}
        <div className="relative">
          <button
            onClick={() => { setStoreOpen(!storeOpen); setNotiOpen(false); setProfileOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-secondary transition-colors text-foreground cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-primary" />
            <span>{activeStore}</span>
          </button>
          
          {storeOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg py-1 z-50 text-left">
              <h5 className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Location</h5>
              {availableStores.map((store) => (
                <button
                  key={store}
                  onClick={() => {
                    dispatch(changeStore(store));
                    setStoreOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-secondary text-foreground cursor-pointer"
                >
                  <span>{store}</span>
                  {activeStore === store && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications Hub */}
        <div className="relative">
          <button
            onClick={() => { setNotiOpen(!notiOpen); setStoreOpen(false); setProfileOpen(false); }}
            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
            )}
          </button>

          {notiOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 text-left">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="font-semibold text-foreground text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="text-xs text-primary font-medium hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-border/60 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={cn("p-4 hover:bg-secondary/40 transition-colors", !n.read && "bg-primary/5")}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-foreground">{n.title}</span>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <button
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Language"
        >
          <Globe className="h-5 w-5" />
        </button>

        <div className="h-6 w-px bg-border" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setStoreOpen(false); setNotiOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer focus:outline-none"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-8 w-8 rounded-full object-cover border border-primary/20"
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg py-1 z-50 text-left">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {user?.role}
                </span>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Store Settings</span>
                </Link>
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    dispatch(logout());
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default TopBar;
