// =============================================
// HOOKS
// =============================================
import { useState } from 'react';

export const useFormValidation = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const setError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    handleInputChange,
    setError,
    clearErrors,
    resetForm,
    setFormData
  };
};

export const useSocketData = () => {
  const [socketData, setSocketData] = useState({
    currentTime: '',
    indicators: [false, false, false, false, false],
    doorStatus: 'Unknown'
  });

  useEffect(() => {
    const mockInterval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      setSocketData(prev => ({
        ...prev,
        currentTime: timeString,
        indicators: [
          Math.random() > 0.5,
          Math.random() > 0.5,
          Math.random() > 0.5,
          Math.random() > 0.5,
          Math.random() > 0.5
        ],
        doorStatus: Math.random() > 0.5 ? 'Open' : 'Closed'
      }));
    }, 2000);
    
    return () => clearInterval(mockInterval);
  }, []);

  return socketData;
};
