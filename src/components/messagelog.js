import { formatTimestamp, validateEmail, formatDate, validateTimeFormat  } from '../utils/utilityfunctions';

const MessageLog = ({ messages, loading, hasMore, onScroll }) => (
  <div 
    className="border border-gray-300 rounded-lg p-4 h-64 overflow-y-auto bg-gray-50"
    onScroll={onScroll}
  >
    {loading && (
      <div className="text-center text-gray-500 py-2">
        <LoadingSpinner size="sm" text="Loading messages..." />
      </div>
    )}
    
    {messages.length === 0 && !loading ? (
      <div className="text-center text-gray-500 py-8">
        No messages available
      </div>
    ) : (
      <div className="space-y-2">
        {messages.map((msg, index) => (
          <div key={msg._id || index} className="text-sm">
            <span className="text-gray-500 font-mono text-xs">
              [{formatTimestamp(msg.timestamp)}]
            </span>
            <span className="ml-2 text-gray-800">
              {msg.message}
            </span>
          </div>
        ))}
      </div>
    )}
    
    {!hasMore && messages.length > 0 && (
      <div className="text-center text-gray-400 text-xs py-2 border-t mt-2">
        End of messages
      </div>
    )}
  </div>
);
