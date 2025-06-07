const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  icon: Icon,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition duration-200 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white',
    success: 'bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white',
    danger: 'bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white',
    purple: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-6 py-4 text-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
      {Icon && !loading && <Icon size={16} className="mr-2" />}
      {children}
    </button>
  );
};

export default Button;