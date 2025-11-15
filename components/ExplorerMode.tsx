import React, { useState } from 'react';
import { ExplorerNode, LatentSpaceIdea } from '../types';
import { LoadingSpinner, MagicIcon, SparklesIcon, SaveIcon, CheckboxUncheckedIcon, CheckboxCheckedIcon, SitemapIcon, RefreshIcon, RobotIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { ExplorerTreeView } from './ExplorerTreeView';

// Add declaration for JSZip from CDN
declare const JSZip: any;

interface ExplorerModeProps {
  nodes: Record<string, ExplorerNode>;
  currentNodeId: string | null;
  onNavigate: (nodeId: string) => void;
  onExplore: (nodeId: string, numIdeas: number) => void;
  onGenerate: (parentId: string, idea: LatentSpaceIdea, ideaIndex: number) => void;
  onAutoExplore: (startNodeId: string, depth: number, numIdeas: number, updateStatus: (status: string) => void) => Promise<void>;
  onExit: () => void;
  error: string | null;
  clearError: () => void;
}

const NodeDisplay: React.FC<{
  node: ExplorerNode;
  title: string;
  onClick?: () => void;
  isParent?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}> = ({ node, title, onClick, isParent = false, isSelected, onSelect }) => (
  <div className={`flex flex-col gap-2 items-center ${isParent ? 'w-24 md:w-32' : 'w-32 md:w-40'}`}>
      <div className="flex items-center justify-between w-full px-1">
          <h3 className="text-sm font-semibold text-gray-400">{title}</h3>
          {onSelect && (
          <button onClick={onSelect} className="text-white p-1" aria-label={isSelected ? 'Deselect for saving' : 'Select for saving'}>
              {isSelected ? <CheckboxCheckedIcon className="w-5 h-5 text-indigo-400" /> : <CheckboxUncheckedIcon className="w-5 h-5 text-gray-500" />}
          </button>
          )}
      </div>
    <div
      className={`relative bg-gray-800 rounded-lg p-2 aspect-square w-full shadow-lg ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all' : ''} ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
      onClick={onClick}
    >
      <img src={node.imageUrl} alt={title} className="object-contain w-full h-full rounded-md" />
      {onClick && (
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
            <span className="text-white font-bold">{isParent ? 'Go Back' : 'View'}</span>
         </div>
      )}
    </div>
  </div>
);


export const ExplorerMode: React.FC<ExplorerModeProps> = ({
  nodes,
  currentNodeId,
  onNavigate,
  onExplore,
  onGenerate,
  onAutoExplore,
  onExit,
  error,
  clearError
}) => {
  const [selectedIdeas, setSelectedIdeas] = useState<Set<number>>(new Set());
  const [selectedNodesForSave, setSelectedNodesForSave] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isTreeViewOpen, setIsTreeViewOpen] = useState(false);
  
  // Advanced mode state
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [numIdeas, setNumIdeas] = useState(5);
  const [autoExploreDepth, setAutoExploreDepth] = useState(2);
  const [isAutoExploring, setIsAutoExploring] = useState(false);
  const [autoExploreStatus, setAutoExploreStatus] = useState('');

  if (!currentNodeId || !nodes[currentNodeId]) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <p className="text-gray-400">Loading Explorer...</p>
        <button onClick={onExit} className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg">Exit</button>
      </div>
    );
  }

  const currentNode = nodes[currentNodeId];
  const parentNode = currentNode.parentId ? nodes[currentNode.parentId] : null;
  const childNodes = currentNode.childrenIds.map(id => nodes[id]);
  const isAnyGenerating = currentNode.generatingIdeaIndices.length > 0 || isAutoExploring;

  const handleToggleIdeaSelection = (index: number) => {
    setSelectedIdeas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleGenerateSelected = async () => {
    if (selectedIdeas.size === 0 || isAnyGenerating) return;
    const ideasToGenerate = Array.from(selectedIdeas).map(index => ({
      idea: currentNode.ideas![index],
      index: index
    }));
    setSelectedIdeas(new Set()); // Clear selection after starting
    
    await Promise.all(
      ideasToGenerate.map(({ idea, index }) => onGenerate(currentNode.id, idea, index))
    );
  };

  const handleToggleNodeSelection = (nodeId: string) => {
    setSelectedNodesForSave(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleSelectAllForSave = () => {
    const allVisibleIds = [currentNodeId, ...currentNode.childrenIds];
    if (currentNode.parentId) {
      allVisibleIds.push(currentNode.parentId);
    }
    setSelectedNodesForSave(new Set(allVisibleIds));
  };
  
  const handleDeselectAllForSave = () => {
    setSelectedNodesForSave(new Set());
  };

  const handleSave = async () => {
    if (selectedNodesForSave.size === 0 || isSaving) return;
    setIsSaving(true);
    try {
      const zip = new JSZip();
      const imagesFolder = zip.folder("images");
      const metadata = [];

      const promises = Array.from(selectedNodesForSave).map(async (nodeId) => {
        const node = nodes[nodeId];
        if (!node) return;

        const response = await fetch(node.imageUrl);
        const blob = await response.blob();
        const extension = blob.type.split('/')[1]?.split('+')[0] || 'png';
        const filename = `${node.id}.${extension}`;
        
        imagesFolder.file(filename, blob);

        metadata.push({
          id: node.id,
          parentId: node.parentId,
          prompt: node.prompt,
          saved_filename: `images/${filename}`,
        });
      });

      await Promise.all(promises);

      zip.file("metadata.json", JSON.stringify(metadata, null, 2));
      const content = await zip.generateAsync({ type: "blob" });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `gemini-explorer-session-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error("Failed to save session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigateFromTree = (nodeId: string) => {
      onNavigate(nodeId);
      setIsTreeViewOpen(false);
  };

  const handleStartAutoExplore = async () => {
    if (isAnyGenerating) return;
    setIsAutoExploring(true);
    setAutoExploreStatus('Initializing...');
    try {
      await onAutoExplore(currentNodeId, autoExploreDepth, numIdeas, setAutoExploreStatus);
      setTimeout(() => {
        setIsAutoExploring(false);
        setAutoExploreStatus('');
      }, 3000);
    } catch (err) {
      console.error("Auto-explore failed:", err);
      setAutoExploreStatus('An error occurred during exploration.');
      setTimeout(() => {
        setIsAutoExploring(false);
        setAutoExploreStatus('');
      }, 3000);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8">
      <header className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text flex items-center gap-3">
          <SparklesIcon className="w-8 h-8"/>
          Latent Space Explorer
        </h1>
        <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsTreeViewOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-sm">
                <SitemapIcon className="w-5 h-5"/>
                Map View
            </button>
            <button
            onClick={onExit}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            Exit Explorer
            </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center gap-8">
        {/* Parent Node */}
        <div className="h-40 flex items-center justify-center">
            {parentNode && (
              <NodeDisplay
                node={parentNode}
                title="Parent"
                onClick={() => onNavigate(parentNode.id)}
                isParent
                isSelected={selectedNodesForSave.has(parentNode.id)}
                onSelect={() => handleToggleNodeSelection(parentNode.id)}
              />
            )}
        </div>

        {/* Current Node */}
        <div className="w-full max-w-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between w-full px-1">
                <h3 className="text-lg font-semibold text-gray-300">Current Image</h3>
                <div className="flex items-center gap-2">
                    <button onClick={handleSelectAllForSave} className="text-xs font-semibold text-gray-400 hover:text-white">Select All Visible</button>
                    {selectedNodesForSave.size > 0 && <button onClick={handleDeselectAllForSave} className="text-xs text-gray-500 hover:text-white">Deselect All</button>}
                    <button onClick={() => handleToggleNodeSelection(currentNode.id)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white" aria-label={selectedNodesForSave.has(currentNode.id) ? 'Deselect for saving' : 'Select for saving'}>
                        {selectedNodesForSave.has(currentNode.id) ? <CheckboxCheckedIcon className="w-5 h-5 text-indigo-400" /> : <CheckboxUncheckedIcon className="w-5 h-5 text-gray-500" />}
                    </button>
                    {selectedNodesForSave.size > 0 &&
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-xs disabled:bg-green-800 disabled:cursor-not-allowed">
                        {isSaving ? <LoadingSpinner className="w-4 h-4" /> : <SaveIcon className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : `Save (${selectedNodesForSave.size})`}
                        </button>
                    }
                </div>
            </div>
            <div className={`aspect-video bg-gray-800 rounded-xl shadow-2xl p-2 transition-all ${selectedNodesForSave.has(currentNode.id) ? 'ring-2 ring-indigo-500' : ''}`}>
                <img src={currentNode.imageUrl} alt="Current selection" className="object-contain w-full h-full rounded-lg" />
            </div>
        </div>
        
        {/* Ideas / Children Section */}
        <div className="w-full max-w-6xl flex-grow flex flex-col items-center gap-4 mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            {!currentNode.ideas && childNodes.length === 0 && (
                 <button
                    onClick={() => onExplore(currentNode.id, numIdeas)}
                    disabled={isAnyGenerating}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    {currentNode.isExploring ? <LoadingSpinner className="w-5 h-5"/> : <SparklesIcon className="w-5 h-5" />}
                    {isAutoExploring ? 'Auto-Exploring...' : (currentNode.isExploring ? 'Exploring Ideas...' : 'Explore From This Image')}
                 </button>
            )}

            {currentNode.ideas && (
                <div className="w-full">
                    <div className="flex flex-col items-center mb-4 gap-4">
                        <div className="flex justify-center items-center gap-4">
                            <h2 className="text-xl font-semibold text-center text-gray-300">Creative Ideas</h2>
                             <button onClick={() => onExplore(currentNode.id, numIdeas)} disabled={isAnyGenerating} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full disabled:opacity-50" title="Refresh Ideas">
                                {currentNode.isExploring ? <LoadingSpinner className="w-5 h-5" /> : <RefreshIcon className="w-5 h-5"/>}
                             </button>
                        </div>
                        {selectedIdeas.size > 0 && (
                             <button
                                onClick={handleGenerateSelected}
                                disabled={isAnyGenerating}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                            >
                                <MagicIcon className="w-5 h-5" />
                                {isAnyGenerating ? 'Generating...' : `Generate Selected (${selectedIdeas.size})`}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentNode.ideas.map((idea, index) => {
                            const isGenerated = childNodes.some(child => child.prompt === idea.suggestedPrompt);
                            const isGeneratingThis = currentNode.generatingIdeaIndices.includes(index);
                            if (isGenerated) return null;

                            return (
                                <div key={index} className={`bg-gray-800 p-4 rounded-lg flex flex-col justify-between gap-3 border transition-colors ${selectedIdeas.has(index) ? 'border-indigo-500' : 'border-gray-700'}`}>
                                    <div className="flex justify-between items-start cursor-pointer" onClick={() => handleToggleIdeaSelection(index)}>
                                        <div className="flex-1 pr-2">
                                            <p className="text-gray-300 italic mb-2 text-sm">&ldquo;{idea.description}&rdquo;</p>
                                            <p className="text-xs font-mono text-indigo-300 bg-gray-900/70 p-2 rounded-md">{idea.suggestedPrompt}</p>
                                        </div>
                                        {selectedIdeas.has(index) 
                                            ? <CheckboxCheckedIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" /> 
                                            : <CheckboxUncheckedIcon className="w-6 h-6 text-gray-500 flex-shrink-0" />
                                        }
                                    </div>
                                    <button
                                        onClick={() => onGenerate(currentNode.id, idea, index)}
                                        disabled={isGeneratingThis || isAnyGenerating}
                                        className="self-end flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    >
                                        {isGeneratingThis ? <LoadingSpinner className="w-5 h-5" /> : <MagicIcon className="w-5 h-5" />}
                                        {isGeneratingThis ? 'Generating...' : 'Generate This'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {childNodes.length > 0 && (
                <div className="w-full border-t border-gray-700 mt-6 pt-6">
                    <h2 className="text-xl font-semibold text-center mb-4 text-gray-300">Generated Children</h2>
                     <div className="flex flex-wrap justify-center gap-4">
                        {childNodes.map(child => (
                           <NodeDisplay
                                key={child.id}
                                node={child}
                                title="Child"
                                onClick={() => onNavigate(child.id)}
                                isSelected={selectedNodesForSave.has(child.id)}
                                onSelect={() => handleToggleNodeSelection(child.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Advanced Controls */}
            <div className="w-full max-w-2xl mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                 <button onClick={() => setIsAdvanced(!isAdvanced)} className="w-full flex justify-between items-center font-semibold text-gray-300">
                    <span>Advanced Controls</span>
                    {isAdvanced ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                 </button>
                 {isAdvanced && (
                    <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <label htmlFor="numIdeas" className="text-sm font-medium text-gray-400 whitespace-nowrap">Ideas:</label>
                            <input
                                id="numIdeas"
                                type="number"
                                min="1"
                                max="10"
                                value={numIdeas}
                                onChange={e => setNumIdeas(parseInt(e.target.value, 10))}
                                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <label htmlFor="autoExploreDepth" className="text-sm font-medium text-gray-400 whitespace-nowrap">Depth:</label>
                            <input
                                id="autoExploreDepth"
                                type="number"
                                min="1"
                                max="5"
                                value={autoExploreDepth}
                                onChange={e => setAutoExploreDepth(parseInt(e.target.value, 10))}
                                className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button
                            onClick={handleStartAutoExplore}
                            disabled={isAnyGenerating}
                            className="w-full md:w-auto flex-grow flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 disabled:cursor-not-allowed rounded-lg font-semibold text-sm transition-colors"
                        >
                            {isAutoExploring ? <LoadingSpinner className="w-5 h-5"/> : <RobotIcon className="w-5 h-5"/>}
                            {isAutoExploring ? autoExploreStatus : 'Start Auto-Explore'}
                        </button>
                    </div>
                 )}
            </div>

        </div>
      </main>

      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 md:max-w-2xl bg-red-800/90 text-white p-4 rounded-lg shadow-lg z-20 text-center">
            <p>{error}</p>
            <button onClick={clearError} className="absolute top-1 right-2 text-xl font-bold" aria-label="Close error message">&times;</button>
        </div>
      )}

      {isTreeViewOpen && (
        <ExplorerTreeView
            nodes={nodes}
            currentNodeId={currentNodeId}
            onNodeSelect={handleNavigateFromTree}
            onClose={() => setIsTreeViewOpen(false)}
        />
      )}
    </div>
  );
};