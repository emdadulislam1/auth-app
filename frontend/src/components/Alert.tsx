import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

const Alert = ({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) => {
  const color = type === 'success' ? 'green' : 'red';
  const Icon = type === 'success' ? CheckCircleIcon : ExclamationCircleIcon;
  return (
    <div className={`flex items-center gap-2 rounded-md border border-${color}-200 bg-${color}-50 px-4 py-2 mt-4 text-${color}-700 text-sm`}>
      <Icon className={`h-5 w-5 text-${color}-400`} />
      <span>{children}</span>
    </div>
  );
};

export default Alert; 