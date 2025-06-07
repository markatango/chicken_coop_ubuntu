const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
    {title && <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>}
    {children}
  </div>
);

export default Card;