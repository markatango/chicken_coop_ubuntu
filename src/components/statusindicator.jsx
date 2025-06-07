const StatusIndicator = ({ active, label }) => (
  <div className="flex flex-col items-center">
    <div 
      className={`w-12 h-12 rounded-full border-4 transition-colors duration-300 ${
        active 
          ? 'bg-red-500 border-red-600 shadow-lg shadow-red-500/30' 
          : 'bg-gray-300 border-gray-400'
      }`}
    />
    <span className="text-xs text-gray-600 mt-2">{label}</span>
  </div>
);

export default StatusIndicator;