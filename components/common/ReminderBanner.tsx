import React from 'react';

interface ReminderBannerProps {
  message: string;
  onDismiss: () => void;
}

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);


export const ReminderBanner: React.FC<ReminderBannerProps> = ({ message, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slideInUp">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-2xl p-4 max-w-sm flex items-start space-x-4">
        <div className="flex-shrink-0">
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="flex-grow">
          <p className="font-semibold">Gentle Reminder</p>
          <p className="text-sm">{message}</p>
        </div>
        <button onClick={onDismiss} className="text-indigo-200 hover:text-white transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
