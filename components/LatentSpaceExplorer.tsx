import React from 'react';
import { LatentSpaceIdea } from '../types';
import { LoadingSpinner, MagicIcon } from './icons';

interface LatentSpaceExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: LatentSpaceIdea[];
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

export const LatentSpaceExplorer: React.FC<LatentSpaceExplorerProps> = ({
  isOpen,
  onClose,
  ideas,
  onGenerate,
  isGenerating,
}) => {
  if (!isOpen) return null;

  const handleGenerateClick = (prompt: string) => {
    if (!isGenerating) {
      onGenerate(prompt);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]"
      style={{ animationFillMode: 'forwards' }}
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
            Creative Ideas
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl font-light"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <p className="text-gray-400 mb-6 flex-shrink-0">
          Gemini found these creative ideas hidden in your image. Click generate to bring one to life!
        </p>
        <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 -mr-2 pr-2">
          {ideas.map((idea, index) => (
            <div
              key={index}
              className="bg-gray-900/50 p-4 rounded-lg flex flex-col justify-between gap-4 border border-gray-700/50 hover:border-indigo-500/80 transition-all duration-200 hover:scale-[1.02] transform"
            >
              <div>
                <p className="text-gray-300 italic mb-3 text-sm">
                  &ldquo;{idea.description}&rdquo;
                </p>
                <p className="text-xs font-mono text-indigo-300 bg-gray-800/70 p-2 rounded-md">
                  {idea.suggestedPrompt}
                </p>
              </div>
              <button
                onClick={() => handleGenerateClick(idea.suggestedPrompt)}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {isGenerating ? <LoadingSpinner className="w-5 h-5" /> : <MagicIcon className="w-5 h-5" />}
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          ))}
           {ideas.length === 0 && (
             <div className="md:col-span-2 lg:col-span-3 text-center text-gray-500 py-8">
                <p>No specific ideas found this time. Try another image!</p>
             </div>
           )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
