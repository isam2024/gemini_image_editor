import React from 'react';
import { ExplorerNode } from '../types';

interface ExplorerTreeViewProps {
  nodes: Record<string, ExplorerNode>;
  currentNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onClose: () => void;
}

const TreeNode: React.FC<{
    nodeId: string;
    nodes: Record<string, ExplorerNode>;
    currentNodeId: string | null;
    onNodeSelect: (nodeId: string) => void;
}> = ({ nodeId, nodes, currentNodeId, onNodeSelect }) => {
    const node = nodes[nodeId];
    if (!node) return null;

    const isCurrent = nodeId === currentNodeId;

    return (
        <div className="flex flex-col items-center">
            {/* Current Node */}
            <div
                onClick={() => onNodeSelect(nodeId)}
                className={`relative w-20 h-20 md:w-24 md:h-24 p-1 bg-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:ring-purple-500 ring-2 ${isCurrent ? 'ring-indigo-400 scale-105' : 'ring-gray-600'}`}
                title={node.prompt || 'Original Image'}
            >
                <img src={node.imageUrl} alt={`Node ${node.id}`} className="w-full h-full object-contain rounded-md" />
                 {isCurrent && <div className="absolute -top-2 -right-2 w-4 h-4 bg-indigo-400 rounded-full border-2 border-gray-900"></div>}
            </div>

            {/* Children Nodes */}
            {node.childrenIds.length > 0 && (
                <>
                    {/* Connector Line to Children */}
                    <div className="w-px h-8 bg-gray-600"></div>
                    <div className="flex items-start justify-center gap-4">
                        {node.childrenIds.map(childId => (
                            <div key={childId} className="flex flex-col items-center relative">
                                {/* Horizontal Connector */}
                                <div className="absolute -top-8 h-8 w-px bg-gray-600"></div>
                                <TreeNode
                                    nodeId={childId}
                                    nodes={nodes}
                                    currentNodeId={currentNodeId}
                                    onNodeSelect={onNodeSelect}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};


export const ExplorerTreeView: React.FC<ExplorerTreeViewProps> = ({ nodes, currentNodeId, onNodeSelect, onClose }) => {
  const rootNode = Object.values(nodes).find(n => n.parentId === null);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]"
      onClick={onClose}
    >
        <div className="absolute top-4 right-4">
             <button onClick={onClose} className="text-gray-400 hover:text-white text-4xl font-light" aria-label="Close modal">&times;</button>
        </div>

      <div
        className="bg-gray-900/80 rounded-lg shadow-2xl p-6 w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text text-center mb-6">
            Exploration Map
        </h2>
        <div className="overflow-auto flex-grow p-4">
          {rootNode ? (
            <TreeNode
              nodeId={rootNode.id}
              nodes={nodes}
              currentNodeId={currentNodeId}
              onNodeSelect={onNodeSelect}
            />
          ) : (
            <p className="text-gray-500 text-center">No exploration tree available.</p>
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
