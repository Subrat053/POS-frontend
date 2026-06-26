import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/ui/Button';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground bg-grid">
      <div className="w-full max-w-md border border-border bg-card/60 backdrop-blur-md rounded-2xl p-8 text-center shadow-xl space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center animate-bounce">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">Access Restricted</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your current security clearance level does not authorize access to this specific module. Please contact your administrator.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <Button
            variant="outline"
            icon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            icon={<Home className="h-4 w-4" />}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
