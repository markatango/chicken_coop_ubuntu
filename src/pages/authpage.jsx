import Button from '../components/button';
import FormInput from '../components/forminput';
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail} from 'lucide-react';
import { useFormValidation } from '../hooks/hooks';
import { validateEmail } from '../utils/utilityfunctions';
import authService from '../services/authService';

const AuthPage = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { formData, errors, handleInputChange, setError, clearErrors } = useFormValidation({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    const newErrors = {};
    
    if (isSignUp && !formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      Object.entries(newErrors).forEach(([field, message]) => {
        console.log(`validateForm error: ${ error.message}`)
        setError(field, message);
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      let result;
      if (isSignUp) {
        result = await authService.register(formData);
      } else {
        result = await authService.login(formData);
      }
      onLogin(result.user);
    } catch (error) {
      setError('submit', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Sign up to control your chicken coop' : 'Sign in to your account'}
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800 font-medium">Demo Credentials:</div>
            <div className="text-xs text-blue-600 mt-1">
              <div>Admin: admin@example.com / password</div>
              <div>User: user@example.com / password</div>
            </div>
            <div className="text-xs text-blue-500 mt-2">
              Firebase Authentication & Firestore Integration Ready
            </div>
          </div>
        </div>

        {/* Sign Up Form */}
        {isSignUp ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              error={errors.username}
              placeholder="Enter your username"
              icon={User}
            />

            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email"
              icon={Mail}
            />

            <div className="relative">
              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Enter your password"
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <FormInput
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
                icon={Lock}
              />
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email"
              icon={Mail}
            />

            <div className="relative">
              <FormInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Enter your password"
                icon={Lock}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-11 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;