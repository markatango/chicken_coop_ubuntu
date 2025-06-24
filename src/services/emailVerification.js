// EmailVerificationComponents.jsx
import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import emailVerificationService from './emailVerificationService.js';

// Email Verification Banner Component
export const EmailVerificationBanner = ({ user, onVerificationComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    checkVerificationStatus();
  }, [user]);

  const checkVerificationStatus = async () => {
    try {
      if (!user) return;
      
      const status = await emailVerificationService.checkVerificationStatus();
      setVerificationStatus(status);
      setIsVisible(!status.isVerified);
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      await emailVerificationService.sendVerificationEmail({
        continueUrl: `${window.location.origin}/verify-email`
      });
      
      setMessage('Verification email sent! Please check your inbox.');
      
      // Update status
      await checkVerificationStatus();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !user) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-3" />
          <div>
            <p className="text-sm text-yellow-700">
              <strong>Email verification required:</strong> Please verify your email address to access all features.
            </p>
            {message && (
              <p className="text-xs text-yellow-600 mt-1">{message}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSendVerification}
            disabled={loading || !verificationStatus?.canResendVerification}
            className={`px-3 py-1 text-xs font-medium rounded ${
              loading || !verificationStatus?.canResendVerification
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-400 text-yellow-800 hover:bg-yellow-500'
            }`}
          >
            {loading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Send Verification'
            )}
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-yellow-700 hover:text-yellow-800 text-sm"
          >
            ×
          </button>
        </div>
      </div>
      
      {verificationStatus && !verificationStatus.canResendVerification && (
        <div className="mt-2 text-xs text-yellow-600">
          <Clock className="h-3 w-3 inline mr-1" />
          Please wait {Math.ceil(verificationStatus.timeUntilNextSend / 1000)} seconds before requesting another email.
        </div>
      )}
    </div>
  );
};

// Email Verification Page Component
export const EmailVerificationPage = ({ user, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    // Check URL parameters for verification code
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'verifyEmail') {
      handleUrlVerification(urlParams);
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const checkVerificationStatus = async () => {
    try {
      if (!user) return;
      
      const status = await emailVerificationService.checkVerificationStatus(true);
      setVerificationStatus(status);
      
      if (status.isVerified) {
        setMessage('Your email has been verified successfully!');
        setMessageType('success');
        if (onVerificationComplete) {
          onVerificationComplete(user);
        }
      } else if (status.timeUntilNextSend > 0) {
        setCountdown(Math.ceil(status.timeUntilNextSend / 1000));
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setMessage('Error checking verification status');
      setMessageType('error');
    }
  };

  const handleUrlVerification = async (urlParams) => {
    try {
      setLoading(true);
      setMessage('Verifying your email...');
      setMessageType('info');
      
      const result = await emailVerificationService.handleVerificationFromUrl(urlParams);
      
      if (result.success) {
        setMessage('Email verified successfully! Redirecting...');
        setMessageType('success');
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = result.continueUrl || '/dashboard';
        }, 2000);
        
        if (onVerificationComplete) {
          onVerificationComplete(result.user);
        }
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
      
      // Clear URL parameters on error
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setMessage('Sending verification email...');
      setMessageType('info');
      
      const result = await emailVerificationService.sendVerificationEmail({
        continueUrl: `${window.location.origin}/verify-email`
      });
      
      setMessage(`Verification email sent to ${result.email}. Please check your inbox and spam folder.`);
      setMessageType('success');
      setCountdown(60); // 60 second cooldown
      
      // Update verification status
      await checkVerificationStatus();
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAgain = async () => {
    try {
      setLoading(true);
      await checkVerificationStatus();
      
      if (!verificationStatus?.isVerified) {
        setMessage('Email not yet verified. Please check your email and click the verification link.');
        setMessageType('info');
      }
    } catch (error) {
      setMessage('Error checking verification status');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to verify your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification link to <strong>{user.email}</strong>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {/* Status Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : messageType === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <div className="flex items-center">
                {messageType === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                {messageType === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                {messageType === 'info' && loading && <RefreshCw className="h-5 w-5 mr-2 animate-spin" />}
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          {/* Verification Status */}
          {verificationStatus?.isVerified ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Email Verified!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your email has been successfully verified. You can now access all features.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-sm text-gray-600">
                  Click the verification link in your email to activate your account. 
                  If you don't see the email, check your spam folder.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckAgain}
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'I\'ve Verified My Email'
                  )}
                </button>

                <button
                  onClick={handleSendVerification}
                  disabled={loading || countdown > 0}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Resend in {countdown}s
                    </>
                  ) : loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>

              {/* Additional Info */}
              {verificationStatus && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Verification Status
                  </h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Email: {verificationStatus.email}</p>
                    <p>Verification emails sent: {verificationStatus.verificationEmailCount}</p>
                    {verificationStatus.lastVerificationEmailSent && (
                      <p>
                        Last sent: {new Date(verificationStatus.lastVerificationEmailSent).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact support at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-500">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Email Verification Modal Component
export const EmailVerificationModal = ({ isOpen, onClose, user, onVerificationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      checkVerificationStatus();
    }
  }, [isOpen, user]);

  const checkVerificationStatus = async () => {
    try {
      const status = await emailVerificationService.checkVerificationStatus();
      setVerificationStatus(status);
      
      if (status.isVerified && onVerificationComplete) {
        onVerificationComplete(user);
        onClose();
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleSendVerification = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      await emailVerificationService.sendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
      
      await checkVerificationStatus();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-yellow-100 mb-4">
            <Mail className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            Email Verification Required
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Please verify your email address to continue using all features.
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">{message}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleSendVerification}
            disabled={loading || !verificationStatus?.canResendVerification}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Send Verification Email'
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Remind Me Later
          </button>
        </div>

        {verificationStatus && !verificationStatus.canResendVerification && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Please wait {Math.ceil(verificationStatus.timeUntilNextSend / 1000)} seconds before requesting another email.
          </div>
        )}
      </div>
    </div>
  );
};

// Email Verification Hook
export const useEmailVerification = (user) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      checkVerificationStatus();
    }
  }, [user]);

  const checkVerificationStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await emailVerificationService.checkVerificationStatus();
      setVerificationStatus(status);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await emailVerificationService.sendVerificationEmail(options);
      await checkVerificationStatus(); // Refresh status
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (actionCode) => {
    try {
      setLoading(true);
      setError(null);
      const result = await emailVerificationService.verifyEmail(actionCode);
      await checkVerificationStatus(); // Refresh status
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    verificationStatus,
    loading,
    error,
    sendVerificationEmail,
    verifyEmail,
    checkVerificationStatus,
    isVerified: verificationStatus?.isVerified || false,
    canResend: verificationStatus?.canResendVerification || false
  };
};

// Email Verification Guard Component
export const EmailVerificationGuard = ({ 
  user, 
  children, 
  fallback, 
  requireVerification = true,
  showBanner = true 
}) => {
  const { verificationStatus, isVerified } = useEmailVerification(user);

  if (!user) {
    return null;
  }

  if (requireVerification && !isVerified) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        {showBanner && (
          <EmailVerificationBanner 
            user={user} 
            onVerificationComplete={() => window.location.reload()} 
          />
        )}
        <EmailVerificationPage 
          user={user} 
          onVerificationComplete={() => window.location.reload()} 
        />
      </div>
    );
  }

  return (
    <>
      {showBanner && !isVerified && (
        <EmailVerificationBanner 
          user={user} 
          onVerificationComplete={() => window.location.reload()} 
        />
      )}
      {children}
    </>
  );
};

// Admin Email Verification Stats Component
export const EmailVerificationStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const verificationStats = await emailVerificationService.getVerificationStatistics();
      setStats(verificationStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-red-600">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          Error loading verification statistics: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Mail className="h-5 w-5 mr-2" />
        Email Verification Statistics
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats?.verifiedUsers || 0}
          </div>
          <div className="text-sm text-gray-600">Verified Users</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats?.unverifiedUsers || 0}
          </div>
          <div className="text-sm text-gray-600">Unverified Users</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats?.usersWithPendingVerification || 0}
          </div>
          <div className="text-sm text-gray-600">Pending Verification</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {stats?.averageVerificationEmails?.toFixed(1) || 0}
          </div>
          <div className="text-sm text-gray-600">Avg. Emails Sent</div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Verification Rate:</span>
          <span className="font-medium">
            {stats?.totalUsers > 0 
              ? `${((stats.verifiedUsers / stats.totalUsers) * 100).toFixed(1)}%`
              : '0%'
            }
          </span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Rate Limited Users:</span>
          <span className="font-medium">{stats?.rateLimitedUsers || 0}</span>
        </div>
      </div>
      
      <button
        onClick={loadStats}
        className="mt-4 w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh Stats
      </button>
    </div>
  );
};