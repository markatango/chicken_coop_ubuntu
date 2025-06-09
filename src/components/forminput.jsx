const FormInput = ({ label, type = 'text', name, value, onChange, error, placeholder, icon: Icon, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        placeholder={placeholder}
        autoComplete="on"
        {...props}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default FormInput;