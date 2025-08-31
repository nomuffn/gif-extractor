import React, { useState, useEffect, useRef } from 'react';
import FrameExtractor from './FrameExtractor';

const UploadComponent = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [gifUrl, setGifUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const dropZoneRef = useRef(null);

  useEffect(() => {
    const handlePaste = async (event) => {
      // Check if the focused element is not an input or textarea to avoid interfering with form inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob && blob.type === 'image/gif') {
            const file = new File([blob], 'pasted-gif.gif', { type: 'image/gif' });
            setFileName('pasted-gif.gif');
            setSelectedFile(file);
            onFileSelect(file);
            setShowUrlInput(false);
            return;
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [onFileSelect]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/gif') {
      setFileName(file.name);
      setSelectedFile(file);
      onFileSelect(file);
      setError('');
      setShowUrlInput(false);
    } else {
      setFileName('');
      setSelectedFile(null);
      onFileSelect(null);
      setError('Please select a valid GIF file.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'image/gif') {
      setFileName(file.name);
      setSelectedFile(file);
      onFileSelect(file);
      setError('');
      setShowUrlInput(false);
    } else {
      setFileName('');
      setSelectedFile(null);
      onFileSelect(null);
      setError('Please drop a valid GIF file.');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUrlChange = (e) => {
    setGifUrl(e.target.value);
    setError('');
  };

  const fetchGifFromUrl = async () => {
    if (!gifUrl) {
      setError('Please enter a valid GIF URL.');
      return;
    }

    setIsFetching(true);
    setError('');

    try {
      // Validate URL format
      new URL(gifUrl);
      
      // Use a CORS proxy to fetch the GIF
      // Note: This is a public proxy service. For production, you should use your own proxy or a paid service
      const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(gifUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(proxyUrl, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch GIF: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('image/gif')) {
        throw new Error('The URL does not point to a valid GIF file.');
      }

      const blob = await response.blob();
      const file = new File([blob], 'fetched-gif.gif', { type: 'image/gif' });
      
      setFileName('fetched-gif.gif');
      setSelectedFile(file);
      onFileSelect(file);
      setShowUrlInput(false);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. The server might be slow or blocking the request.');
      } else {
        setError(err.message || 'Failed to fetch GIF from URL. Some websites block direct fetching.');
        console.error('Error fetching GIF:', err);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchGifFromUrl();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!selectedFile ? (
        <div 
          ref={dropZoneRef}
          className="flex flex-col items-center justify-center p-8 md:p-12 glass-card hover:border-primary/30 transition-all group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="bg-primary/10 p-4 md:p-5 rounded-full mb-5 md:mb-6 group-hover:bg-primary/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Upload a GIF File</h2>
          <p className="text-base-content/70 mb-2 text-center text-sm md:text-base">Drag & drop your GIF here</p>
          <p className="text-base-content/50 mb-1 text-center text-xs md:text-sm">or</p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              onClick={() => document.getElementById('fileInput').click()}
              className="flex-1 px-5 py-2.5 md:px-6 md:py-3 glass-button text-white rounded-lg cursor-pointer font-medium flex items-center justify-center focusable text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Select File
            </button>
            
            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex-1 px-5 py-2.5 md:px-6 md:py-3 glass-button-secondary text-base-content rounded-lg cursor-pointer font-medium flex items-center justify-center focusable text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              From URL
            </button>
          </div>
          <p className="text-base-content/50 text-xs md:text-sm mt-4">Supports GIF files only • Paste with Ctrl+V</p>
          
          {showUrlInput && (
            <div className="glass-card mt-6 p-4 w-full max-w-md">
              <div className="flex flex-col gap-3">
                <input
                  type="url"
                  value={gifUrl}
                  onChange={handleUrlChange}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com/animation.gif"
                  className="input input-bordered w-full"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUrlInput(false)}
                    className="flex-1 btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={fetchGifFromUrl}
                    disabled={isFetching}
                    className={`flex-1 btn btn-primary btn-sm ${isFetching ? 'loading' : ''}`}
                  >
                    {isFetching ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
              </div>
              {error && (
                <div className="alert alert-error mt-3 py-2 px-3 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              <div className="mt-3 text-xs text-base-content/70">
                <p>Note: We use a CORS proxy to fetch GIFs from external websites. If you encounter issues, try downloading the GIF and uploading it directly.</p>
              </div>
            </div>
          )}
          
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".gif"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="glass-card p-4 md:p-6">
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold">GIF Source</h2>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileName('');
                onFileSelect(null);
                setGifUrl('');
                setError('');
                setShowUrlInput(false);
              }}
              className="flex items-center px-3 py-1.5 md:px-4 md:py-2 glass-button-secondary text-base-content rounded-lg focusable text-sm md:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden xs:inline">Change</span>
              <span className="xs:hidden">X</span>
            </button>
          </div>
          <div className="glass-light rounded-xl overflow-hidden flex justify-center p-3 md:p-4">
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="GIF Source" 
              className="max-h-60 md:max-h-80 object-contain"
            />
          </div>
          <div className="mt-3 md:mt-4 text-center">
            <p className="text-base-content/80 text-sm md:text-base">Source: <span className="font-medium text-base-content break-all">{fileName}</span></p>
          </div>
        </div>
      )}
      {selectedFile && <FrameExtractor gifFile={selectedFile} />}
    </div>
  );
};

export default UploadComponent;