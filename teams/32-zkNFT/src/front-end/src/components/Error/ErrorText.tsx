import React from 'react';

interface IErrorProps {
  errorMessage: string;
}

const ErrorText: React.FC<IErrorProps> = ({ errorMessage }) => {
  return <p className={'text-xss h-4 text-red-500 mt-2'}>{errorMessage}</p>;
};

export default ErrorText;
