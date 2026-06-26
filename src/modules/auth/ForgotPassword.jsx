import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-sm mx-auto space-y-6 text-center">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Link Dispatched</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If an account exists, reset instructions have been sent to your registered address.
          </p>
        </div>
        <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline font-semibold mt-4">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 text-left">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your registered email address to receive password reset links.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="name@enterprise.com"
          error={errors.email?.message}
          icon={<Mail className="h-4.5 w-4.5" />}
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Send Instructions
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
