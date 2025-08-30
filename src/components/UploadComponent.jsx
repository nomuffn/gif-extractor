import React, { useState } from 'react';
import FrameExtractor from './FrameExtractor';

const UploadComponent = ({ onFileSelect }) => {
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/gif') {
      setFileName(file.name);
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setFileName('');
      setSelectedFile(null);
      onFileSelect(null);
      alert('Please select a GIF file.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'image/gif') {
      setFileName(file.name);
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      setFileName('');
      setSelectedFile(null);
      onFileSelect(null);
      alert('Please drop a GIF file.');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!selectedFile ? (
        <div 
          className="flex flex-col items-center justify-center p-8 md:p-12 glass-card hover:border-primary/30 transition-all cursor-pointer group"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div className="bg-primary/10 p-4 md:p-5 rounded-full mb-5 md:mb-6 group-hover:bg-primary/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Upload a GIF File</h2>
          <p className="text-base-content/70 mb-2 text-center text-sm md:text-base">Drag & drop your GIF here</p>
          <p className="text-base-content/50 mb-5 md:mb-6 text-center text-sm">or</p>
          <div className="px-5 py-2.5 md:px-6 md:py-3 glass-button text-white rounded-lg cursor-pointer font-medium flex items-center focusable text-sm md:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Select GIF File
          </div>
          <p className="text-base-content/50 text-xs md:text-sm mt-4">Supports GIF files only</p>
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
            <h2 className="text-xl md:text-2xl font-bold">Uploaded GIF</h2>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileName('');
                onFileSelect(null);
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
              alt="Uploaded GIF" 
              className="max-h-60 md:max-h-80 object-contain"
            />
          </div>
          <div className="mt-3 md:mt-4 text-center">
            <p className="text-base-content/80 text-sm md:text-base">File: <span className="font-medium text-base-content break-all">{fileName}</span></p>
          </div>
        </div>
      )}
      {selectedFile && <FrameExtractor gifFile={selectedFile} />}
    </div>
  );
};

export default UploadComponent;