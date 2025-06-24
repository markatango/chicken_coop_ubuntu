import Button from '../../components/button';
import Card from '../../components/card';
import MessageLog from '../../components/messagelog';
import StatusIndicator from '../../components/statusindicator';
import React, { useState, useEffect, useCallback } from 'react';
import { Clock, DoorOpen, DoorClosed, Shield } from 'lucide-react'; 
import { useSocketData } from '../../hooks/hooks';
import { USER_ROLES } from '../../config/userroles';
import apiService from '../../services/apiService';
import { validateTimeFormat } from '../../utils/utilityfunctions';



export const HomePage = ({ user, onLogout, onNavigateToAdmin }) => {
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [loading, setLoading] = useState({});
  const [messages, setMessages] = useState([]);
  const [messageLoading, setMessageLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [scrollPosition, setScrollPosition] = useState('bottom');

  const socketData = useSocketData();

  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setMessageLoading(true);
        const response = await apiService.getMessages();
        if (response.success) {
          setMessages(response.messages);
          setHasMoreMessages(response.hasMore);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setMessageLoading(false);
      }
    };
    
    loadInitialMessages();
  }, []);

  const handleApiCall = useCallback(async (endpoint, data = null) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      await apiService.post(endpoint, data);
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  }, []);

  const handleTimeSubmit = useCallback((endpoint, time) => {
    if (time && validateTimeFormat(time)) {
      handleApiCall(endpoint, { time });
    }
  }, [handleApiCall]);

  const handleMessageScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
    
    if (isAtTop && scrollPosition !== 'top') {
      setScrollPosition('top');
    } else if (isAtBottom && scrollPosition !== 'bottom') {
      setScrollPosition('bottom');
    } else if (!isAtTop && !isAtBottom) {
      setScrollPosition('middle');
    }
  };

  const indicatorLabels = ['Up', 'Down', 'Up cmd', 'Down cmd', 'Stop cmd'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">
              Rodighiero Chickencoop Control
            </h1>
            {user && (
              <div className="flex items-center space-x-4">
                {user.role === USER_ROLES.ADMINISTRATOR && (
                  <Button
                    variant="purple"
                    onClick={onNavigateToAdmin}
                    icon={Shield}
                  >
                    Admin Panel
                  </Button>
                )}
                <span className="text-gray-600">Welcome, {user.displayName || user.email}</span>
                <Button
                  variant="danger"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Time Display and Door Status Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Time Display with Door Status */}
          <Card title="Chicken Coop Time" className="">
            <div className="flex flex-col items-center space-y-4">
              {/* Clock Display */}
              <div className="flex items-center justify-center">
                <Clock className="text-blue-600 mr-3" size={32} />
                <div className="text-4xl font-bold text-gray-800">
                  {socketData.currentTime || '--:-- --'}
                </div>
              </div>
              
              {/* Door Status Display */}
              <div className="flex items-center justify-center">
                {socketData.doorStatus === 'Open' ? (
                  <DoorOpen className="text-green-600 mr-3" size={32} />
                ) : (
                  <DoorClosed className="text-red-600 mr-3" size={32} />
                )}
                <div className={`text-5xl font-bold ${
                  socketData.doorStatus === 'Open' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {socketData.doorStatus || 'Unknown'}
                </div>
              </div>
            </div>
          </Card>

          {/* Status Indicators */}
          <Card title="Door Status and Control Signals" className="">
            <div className="flex justify-center space-x-4">
              {socketData.indicators.map((active, index) => (
                <StatusIndicator
                  key={index}
                  active={active}
                  label={indicatorLabels[index]}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <Card title="Control Panel">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Door Controls */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">Door Controls</h3>
                {user && (
                  <div className="flex space-x-3">
                    <Button
                      variant="danger"
                      onClick={() => handleApiCall('/close')}
                      loading={loading['/close']}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      variant="success"
                      onClick={() => handleApiCall('/open')}
                      loading={loading['/open']}
                      className="flex-1"
                    >
                      Open
                    </Button>
                  </div>
                )}
                {!user && (
                  <p className="text-sm text-gray-500 italic">
                    Sign in to control door
                  </p>
                )}
              </div>
            </div>

            {/* Time Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Open Time
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  onBlur={() => handleTimeSubmit('/setopentime', openTime)}
                  disabled={!user || loading['/setopentime']}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800'
                  } ${loading['/setopentime'] ? 'opacity-50' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Close Time
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  onBlur={() => handleTimeSubmit('/setclosetime', closeTime)}
                  disabled={!user || loading['/setclosetime']}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    !user ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-800'
                  } ${loading['/setclosetime'] ? 'opacity-50' : ''}`}
                />
              </div>

              {!user && (
                <p className="text-sm text-gray-500 italic">
                  Sign in to control door timing
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Message Log */}
        <Card title="System Messages" className="mt-6">
          <MessageLog
            messages={messages}
            loading={messageLoading}
            hasMore={hasMoreMessages}
            onScroll={handleMessageScroll}
          />
          <div className="mt-2 text-xs text-gray-500 text-center">
            Scroll to top for earlier messages • Scroll to bottom for later messages
          </div>
        </Card>
      </main>
    </div>
  );
};
