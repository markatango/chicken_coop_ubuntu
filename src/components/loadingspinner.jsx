const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="text-center">
      <div className={`inline-block animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-2`}></div>
      <div className="text-gray-600">{text}</div>
    </div>
  );
};



export default LoadingSpinner;