import React from 'react';

interface IWarningProps {
  warningMessage: string;
}

const ErrorText: React.FC<IWarningProps> = ({ warningMessage }) => {
  return <p className={'text-xss h-4 text-yellow-600 mt-2'}>{warningMessage}</p>;
};

export default ErrorText;
