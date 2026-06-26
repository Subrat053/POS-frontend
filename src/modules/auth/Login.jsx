import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { loginStart, loginSuccess, loginFailure } from '../../app/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, availableUsers } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = (data) => {
    dispatch(loginStart());
    
    // Simulate API delay
    setTimeout(() => {
      const match = availableUsers.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (match) {
        dispatch(loginSuccess(match));
        toast.success(`Welcome back, ${match.name}!`);
        
        // Cashiers get redirected directly to POS terminal
        if (match.role === 'Cashier') {
          navigate('/pos');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        dispatch(loginFailure('Invalid email or password'));
        toast.error('Invalid email or password. Try quick-login selectors!');
      }
    }, 800);
  };

  const handleQuickLogin = (user) => {
    setValue('email', user.email);
    setValue('password', 'admin123'); // dummy password matching length constraint
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground m-0">Sign In</h1>
        <p className="text-sm text-muted-foreground">
          Enter your workspace credentials to access your store terminal.
        </p>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="name@enterprise.com"
          error={errors.email?.message}
          icon={<Mail className="h-4.5 w-4.5" />}
        />

        <Input
          {...register('password')}
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          icon={<Lock className="h-4.5 w-4.5" />}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <input type="checkbox" className="rounded border-border text-primary focus:ring-primary" />
            <span>Remember device</span>
          </label>
          <a href="/reset-password" className="text-primary hover:underline font-medium">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Sign In to Terminal
        </Button>
      </form>

      {/* Quick Role-Selector Section for Demo */}
      <div className="pt-6 border-t border-border/80">
        <div className="flex items-center gap-2 mb-3 text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">Quick Login (Demo Mode)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {availableUsers.map((user) => (
            <button
              key={user.role}
              onClick={() => handleQuickLogin(user)}
              className="flex flex-col items-start p-2.5 rounded-lg border border-border bg-card/60 hover:bg-secondary transition-colors cursor-pointer text-left"
            >
              <span className="text-xs font-bold text-foreground">{user.role}</span>
              <span className="text-[10px] text-muted-foreground truncate w-full">{user.email}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;
