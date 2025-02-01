'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface SubscriptionFormProps {
  className?: string;
  buttonLabel?: string;
  placeholder?: string;
  onSubscribe?: (email: string) => Promise<void>;
}

interface FormData {
  email: string;
}

export function NewsletterSubscription({
  className = '',
  buttonLabel = 'Subscribe',
  placeholder = 'Enter your email',
  onSubscribe,
}: SubscriptionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setSubscriptionStatus('idle');
    
    try {
      await onSubscribe?.(data.email);
      setSubscriptionStatus('success');
    } catch (error) {
      setSubscriptionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-md ${className}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            placeholder={placeholder}
            className={`flex-1 p-2 border rounded ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Sending...' : buttonLabel}
          </button>
        </div>
        
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
        
        {subscriptionStatus === 'success' && (
          <p className="text-green-600 text-sm">
            Thank you for subscribing! Please check your email to confirm.
          </p>
        )}
        
        {subscriptionStatus === 'error' && (
          <p className="text-red-500 text-sm">
            Subscription failed. Please try again later.
          </p>
        )}
      </form>
    </div>
  );
}