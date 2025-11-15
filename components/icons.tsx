import React from 'react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <svg
    className={`animate-spin text-white ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"></path></svg>
);

export const MagicIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M21 12a1 1 0 0 0-1 1v6.057a2.5 2.5 0 0 1-4.501.433A2.5 2.5 0 0 1 11 18.057V12a1 1 0 0 0-2 0v6.057a2.5 2.5 0 0 1-4.5.433A2.5 2.5 0 0 1 0 18.057V13a1 1 0 0 0-2 0v5.057a4.5 4.5 0 0 0 8.001.815A4.5 4.5 0 0 0 13 22.057V13a1 1 0 0 0 1-1 .5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5 1 1 0 0 0 1 1h.5a.5.5 0 0 0 .5-.5V8.828a1 1 0 0 0-.293-.707L15.914 5.293a1 1 0 0 0-.707-.293H8.5a.5.5 0 0 1-.5-.5A.5.5 0 0 1 8.5 4h7.414a3 3 0 0 1 2.122.879l2.828 2.828A3 3 0 0 1 22 9.828V13a1 1 0 0 0-1-1zM9.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0-4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"></path></svg>
);

export const AnalyzeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6v-2h2v2zm10 8h-8v-2h8v2zm0-4h-8v-2h8v2zm0-4h-8v-2h8v2z"></path></svg>
);

export const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
    </svg>
);

export const PendingIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
    </svg>
);

export const DownloadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path></svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"></path></svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg>
);

export const SparklesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3l1.94 4.06L18 9l-4.06 1.94L12 15l-1.94-4.06L6 9l4.06-1.94zM12 21l-1.45-3.03L7.5 16l3.03-1.45L12 11.5l1.45 3.03L16.5 16l-3.03 1.45z"/>
    </svg>
);

export const GitBranchIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-5 3c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2v-2h3v2c0 1.1.9 2 2 2s2-.9 2-2v-6c0-1.1-.9-2-2-2H7v-2c0-1.1-.9-2-2-2s-2 .9-2 2v2H2c-1.1 0-2 .9-2 2s.9 2 2 2h1v3H2c-1.1 0-2 .9-2 2s.9 2 2 2h3v-2c0-1.1.9-2 2-2s2 .9 2 2v2h2c1.1 0 2-.9 2-2s-.9-2-2-2h-3V9H5zm14 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2v-6c0-1.1-.9-2-2-2z"/>
    </svg>
);

export const SaveIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"></path></svg>
);

export const CheckboxUncheckedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
    </svg>
);

export const CheckboxCheckedIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
);

export const SitemapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.4 6.22A2.4 2.4 0 0017.5 5H15V3c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2H6.5a2.5 2.5 0 00-2.37 1.63L2 14v5c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5l-2.6-7.78zM9 19H5v-2h4v2zm0-4H5v-2h4v2zm6 4h-4v-2h4v2zm0-4h-4v-2h4v2zm6 4h-4v-2h4v2zm0-4h-4v-2h4v2zM15 9H9V7h6v2z"/>
    </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>
);

export const RobotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c0-5.52-4.48-10-10-10zm-4 12H6v-2h2v2zm8 0h-2v-2h2v2zm-2-4H8V8h4v2z"/>
    </svg>
);
