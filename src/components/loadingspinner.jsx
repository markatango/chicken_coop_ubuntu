import React from "react";
import { Loader } from "lucide-react";   {/* See medium.com note below*/}

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  // oridginal claude code:

  // return (
  //   <div className="text-center">
  //     <div className={`inline-block animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-2`}></div>
  //     <div className="text-gray-600">{text}</div>
  //   </div>
  // );

  // from https://medium.com/@szaranger/how-to-animate-a-loading-icon-using-react-and-tailwind-84a78ed72833 :

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="animate-spin w-12 h-12 text-blue-500" />
    </div>
  );
};



export default LoadingSpinner;