import React, { useState, useCallback, useRef, useEffect } from 'react';
import { editImageWithPrompt, analyzeImageWithSSPP } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import { ImagePart } from './types';
import { LoadingSpinner, UploadIcon, MagicIcon, AnalyzeIcon, DownloadIcon, ChevronUpIcon, ChevronDownIcon, CheckIcon, InfoIcon } from './components/icons';

const DEFAULT_IMAGE_URL = 'https://picsum.photos/seed/gemini-image-editor/1024/768';

const ssppLayers = [
  'Layer 1: Objects',
  'Layer 2: Composition',
  'Layer 3: Geometry',
  'Layer 4: Style',
  'Layer 5: Color Map',
  'Layer 6: Lighting',
  'Layer 7: Textures',
  'Layer 8: Materials',
  'Layer 9: Mood',
  'Layer 10: Summary',
];

const finalizationSteps = [
    'Sending request to Gemini...',
    'Awaiting response from the model...',
    'Parsing the result...',
];

const allAnalysisSteps = [...ssppLayers, ...finalizationSteps, 'Analysis Complete!'];

interface HistoryItem {
  imageUrl: string;
  prompt: string;
}

const App: React.FC = () => {
  const [originalImagePart, setOriginalImagePart] = useState<ImagePart | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>(DEFAULT_IMAGE_URL);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [ssppDescription, setSsppDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [analysisCompleted, setAnalysisCompleted] = useState<boolean>(false);
  const [lastGenerationPrompt, setLastGenerationPrompt] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError(null);
      setEditedImageUrl(null);
      setSsppDescription(null);
      setAnalysisCompleted(false);
      setPrompt('');
      setLastGenerationPrompt(null);
      try {
        const imagePart = await fileToGenerativePart(file);
        setOriginalImagePart(imagePart);
        setOriginalImageUrl(URL.createObjectURL(file));
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred during file processing.');
        }
      }
    }
  }, []);

  const getImagePart = useCallback(async (): Promise<ImagePart | null> => {
    if (originalImagePart) {
        return originalImagePart;
    }
    try {
        const response = await fetch(originalImageUrl);
        if (!response.ok) throw new Error('Failed to fetch default image.');
        const blob = await response.blob();
        const file = new File([blob], "default_image.jpeg", { type: blob.type });
        const imagePart = await fileToGenerativePart(file);
        setOriginalImagePart(imagePart);
        return imagePart;
    } catch (err) {
        setError("Could not load the image. Please upload your own.");
        return null;
    }
  }, [originalImagePart, originalImageUrl]);
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisCompleted(false);
    setError(null);
    setSsppDescription(null);
    setAnalysisProgress(0);

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    const imagePartToAnalyze = await getImagePart();
    if (!imagePartToAnalyze) {
      setIsAnalyzing(false);
      return;
    }

    const analysisWork = async () => {
      // Animate through SSPP layers quickly
      await new Promise<void>((resolve) => {
        analysisIntervalRef.current = window.setInterval(() => {
          setAnalysisProgress((prev) => {
            const next = prev + 1;
            if (next >= ssppLayers.length) {
              clearInterval(analysisIntervalRef.current!);
              analysisIntervalRef.current = null;
              resolve();
              return ssppLayers.length;
            }
            return next;
          });
        }, 200);
      });

      // Proceed with actual API call steps
      setAnalysisProgress(ssppLayers.length); // "Sending request..."
      const analysisPromise = analyzeImageWithSSPP(imagePartToAnalyze);
      
      setAnalysisProgress(ssppLayers.length + 1); // "Awaiting response..."
      const description = await analysisPromise;
      
      setAnalysisProgress(ssppLayers.length + 2); // "Parsing the result..."
      // Small delay to make the last step readable
      await new Promise(resolve => setTimeout(resolve, 500));

      setSsppDescription(description);
      setAnalysisCompleted(true);
      setAnalysisProgress(allAnalysisSteps.length - 1); // Mark as complete
    };

    analysisWork()
      .catch((err) => {
        if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred during analysis.');
        }
        setIsAnalyzing(false); // Stop on error
      });
  };

  useEffect(() => {
    if (analysisCompleted) {
        const timer = setTimeout(() => {
            setIsAnalyzing(false);
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [analysisCompleted]);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setError('Please enter an editing prompt.');
      return;
    }
    if (!ssppDescription || !originalImagePart) {
      setError('Please analyze the image first before generating an edit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    const combinedPrompt = `
Based on the following structured analysis of the image:
--- SSPP ANALYSIS START ---
${ssppDescription}
--- SSPP ANALYSIS END ---

Please apply this user-requested edit: "${prompt}"

Output only the edited image.
`;
    setLastGenerationPrompt(combinedPrompt);

    try {
      const newImageUrl = await editImageWithPrompt(originalImagePart, combinedPrompt);
      setEditedImageUrl(newImageUrl);
      setHistory(prevHistory => [{ imageUrl: newImageUrl, prompt }, ...prevHistory]);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred while generating the image.');
        }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveImage = useCallback((imageUrlToSave: string | null) => {
    if (imageUrlToSave) {
      const link = document.createElement('a');
      link.href = imageUrlToSave;
      const mimeType = imageUrlToSave.match(/data:([^;]+);/)?.[1] ?? 'image/png';
      const extension = mimeType.split('/')[1] ?? 'png';
      link.download = `edited-image-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  const ImagePanel: React.FC<{ title: string; imageUrl: string | null; isLoading?: boolean; fullPrompt?: string | null }> = ({ title, imageUrl, isLoading, fullPrompt }) => {
    const [isPromptVisible, setIsPromptVisible] = useState(false);
    return (
      <div className="bg-gray-800 rounded-lg p-4 flex flex-col w-full aspect-[4/3]">
        <div className="w-full flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-400">{title}</h2>
          {title === 'Edited' && imageUrl && !isLoading && (
            <button
              onClick={() => handleSaveImage(imageUrl)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Save edited image"
            >
              <DownloadIcon className="w-5 h-5" />
              Save Image
            </button>
          )}
        </div>
        <div className="relative w-full flex-1 flex items-center justify-center bg-gray-900/50 rounded-md overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
                    <LoadingSpinner />
                </div>
            )}
            {imageUrl ? (
                <img src={imageUrl} alt={title} className="object-contain max-w-full max-h-full" />
            ) : (
                <div className="text-gray-500 text-center p-4">{title === 'Edited' ? 'Your edited image will appear here' : 'Upload an image to begin'}</div>
            )}
        </div>
        {title === 'Edited' && fullPrompt && !isLoading && (
            <div className="mt-2 pt-2 border-t border-gray-700/50 flex-shrink-0">
                <button onClick={() => setIsPromptVisible(!isPromptVisible)} className="w-full flex justify-between items-center text-sm text-gray-400 hover:text-white transition-colors" aria-expanded={isPromptVisible}>
                    <span className="flex items-center gap-2 font-semibold">
                        <InfoIcon className="w-5 h-5" />
                        Full Prompt Used
                    </span>
                    {isPromptVisible ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
                {isPromptVisible && (
                    <textarea
                        readOnly
                        value={fullPrompt}
                        className="w-full h-24 mt-2 bg-gray-900 text-gray-300 font-mono text-xs p-2 rounded-md resize-y border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        aria-label="Full prompt used for generation"
                    />
                )}
            </div>
        )}
      </div>
    )
  };

  const AnalysisProgressIndicator = () => {
    const progressPercentage = Math.min(((analysisProgress + 1) / allAnalysisSteps.length) * 100, 100);
    const currentStepText = allAnalysisSteps[analysisProgress] || 'Initializing...';
    
    return (
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-lg transition-all duration-300">
        <h2 className="text-lg font-semibold text-gray-300 mb-4 text-center">
            {analysisCompleted ? 'Complete!' : 'Analyzing Image...'}
        </h2>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
                className={`h-2.5 rounded-full transition-all duration-200 ${analysisCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPercentage}%` }}
            ></div>
        </div>
        <p className={`text-center text-sm min-h-[20px] font-medium ${analysisCompleted ? 'text-green-400' : 'text-indigo-300'}`}>
            {currentStepText}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 md:p-8 pb-40">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
            Gemini Image Editor
          </h1>
          <p className="text-gray-400 mt-2">A multi-stage image analysis and generation app powered by SSPP and Gemini.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImagePanel title="Original" imageUrl={originalImageUrl} />
          <ImagePanel title="Edited" imageUrl={editedImageUrl} isLoading={isLoading} fullPrompt={lastGenerationPrompt} />
        </main>
        
        <section className="my-8 max-w-4xl mx-auto w-full px-4 flex flex-col items-center">
          {ssppDescription && !isAnalyzing ? (
            <div className="text-center">
                <p className="text-lg text-green-400 font-semibold flex items-center justify-center gap-2 mb-4">
                    <CheckIcon className="w-6 h-6" />
                    Analysis Complete
                </p>
                <button 
                    onClick={() => setIsAnalysisModalOpen(true)}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    View SSPP Analysis
                </button>
            </div>
          ) : isAnalyzing ? (
            <AnalysisProgressIndicator />
          ) : (
            <button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <AnalyzeIcon className="w-5 h-5"/>
              Analyze Image
            </button>
          )}
        </section>

        {history.length > 0 && (
          <section className="mt-8 max-w-6xl mx-auto w-full">
            <div className="bg-gray-800/50 rounded-lg">
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="w-full flex justify-between items-center p-4 font-semibold text-lg text-gray-300 hover:bg-gray-700/50 rounded-t-lg transition-colors"
                aria-expanded={isHistoryOpen}
              >
                <span>History ({history.length} {history.length === 1 ? 'item' : 'items'})</span>
                {isHistoryOpen ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
              </button>
              {isHistoryOpen && (
                <div className="p-4 border-t border-gray-700 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {history.map((item, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-2 flex flex-col gap-2 group relative shadow-lg overflow-hidden">
                      <div className="aspect-square w-full bg-gray-900/50 rounded-md flex items-center justify-center overflow-hidden">
                         <img src={item.imageUrl} alt={`History item ${index + 1}`} className="object-contain max-w-full max-h-full" />
                      </div>
                      <p className="text-xs text-gray-400 truncate px-1" title={item.prompt}>{item.prompt}</p>
                      <button
                        onClick={() => handleSaveImage(item.imageUrl)}
                        className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        aria-label="Save this version"
                      >
                        <DownloadIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsAnalysisModalOpen(false)}>
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-gray-200">SSPP Analysis Result</h2>
                    <button onClick={() => setIsAnalysisModalOpen(false)} className="text-gray-400 hover:text-white text-3xl font-light" aria-label="Close modal">&times;</button>
                </div>
                <div className="overflow-y-auto">
                    <textarea
                        readOnly
                        value={ssppDescription || 'No analysis available.'}
                        className="w-full h-96 bg-gray-900 text-gray-300 font-mono text-xs p-3 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="SSPP Analysis Result"
                    />
                </div>
            </div>
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 w-11/12 md:max-w-2xl bg-red-800/90 text-white p-4 rounded-lg shadow-lg z-20 text-center">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="absolute top-1 right-2 text-xl font-bold" aria-label="Close error message">&times;</button>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 p-4 z-10">
        <form onSubmit={handleGenerate} className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <UploadIcon className="w-5 h-5" />
            Upload Image
          </button>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={ssppDescription ? 'e.g., "Add a retro filter"' : 'Analyze image to enable editing'}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-800/50 disabled:cursor-not-allowed"
            disabled={isLoading || isAnalyzing || !ssppDescription}
            aria-label="Image editing prompt"
          />
          <button
            type="submit"
            disabled={isLoading || isAnalyzing || !ssppDescription || !prompt.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <MagicIcon className="w-5 h-5"/>
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default App;