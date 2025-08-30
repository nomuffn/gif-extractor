import React from "react"
import "./App.css"
import UploadComponent from "./components/UploadComponent"

function App() {
  const handleFileSelect = (file) => {
    // This function can be used to handle the selected file in the parent component if needed
    console.log("Selected file:", file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-base-content">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center py-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 gradient-text">
            GIF Extractor
          </h1>
          <p className="text-base-content/80 max-w-2xl mx-auto text-base md:text-lg">
            Upload a GIF file to extract and view individual frames with precision
          </p>
        </header>

        <main className="flex-grow flex flex-col">
          <UploadComponent onFileSelect={handleFileSelect} />

          <div className="glass-card p-4 md:p-6 mt-6 md:mt-8">
            <div className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info shrink-0 w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 mt-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div>
                <h2 className="font-bold text-base md:text-lg mb-1">How to use</h2>
                <p className="text-base-content/80 text-sm md:text-base">
                  Use the arrow keys (← →) to navigate between frames, click on any frame to view it fullscreen, or use
                  the thumbnails below to jump to a specific frame. Download individual frames with the download button.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center py-6 md:py-8 text-base-content/60 text-xs md:text-sm mt-8 md:mt-12 border-t border-surface-light/20">
          <div className="mb-2">
            <p>Built with React, Vite, Tailwind CSS, and DaisyUI</p>
          </div>
          <div className="flex items-center justify-center space-x-1 md:space-x-2">
            <span>made with 🧁</span>
            <span>by</span>
            <span className="font-semibold">muffnlabs</span>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
