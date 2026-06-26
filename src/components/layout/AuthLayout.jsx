import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex bg-background text-foreground bg-grid relative overflow-hidden transition-colors duration-200">
      
      {/* Theme Toggle in Auth Screen */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border bg-card/65 backdrop-blur-md text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full grid lg:grid-cols-2 gap-8 items-center bg-card/40 backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl max-w-5xl">
          
          {/* Left Panel: Auth Form Page */}
          <div className="flex flex-col justify-center px-4 py-8 sm:px-6">
            <Outlet />
          </div>

          {/* Right Panel: Marketing / Showcase */}
          <div className="hidden lg:flex flex-col justify-between h-full bg-primary/10 border border-primary/20 rounded-xl p-8 relative overflow-hidden text-left min-h-[500px]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl -z-10" />

            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-black text-lg">P</span>
                </div>
                <span className="font-extrabold text-lg tracking-tight">POS<span className="text-primary">Enterprise</span></span>
              </div>
              <h2 className="text-3xl font-black leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/95 to-primary">
                The Operating System for Modern Commerce.
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                Manage checkout, warehouses, invoices, employees, and procurements from a unified, enterprise-grade cloud workspace.
              </p>
            </div>

            {/* Mock Dashboard Stat Card Widget */}
            <div className="mt-6 border border-border/80 bg-card rounded-xl p-5 shadow-lg relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Gross Sales (Today)</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">$124,590.80</p>
                </div>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">+18.2%</span>
              </div>
              <div className="mt-4 h-16 w-full flex items-end gap-1">
                {[45, 60, 50, 75, 60, 90, 85, 110, 95, 120].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="flex-1 bg-gradient-to-t from-primary/30 to-primary rounded-sm transition-all duration-300"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mt-8">
              <span>© 2026 POS Enterprise Inc.</span>
              <span>All rights reserved.</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
