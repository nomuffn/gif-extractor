import React, { useState } from "react"
import "./App.css"
import UploadComponent from "./components/UploadComponent"

function App() {
  const [cupcakes, setCupcakes] = useState([])

  const handleFileSelect = (file) => {
    // This function can be used to handle the selected file in the parent component if needed
    console.log("Selected file:", file)
  }

  const handleMouseEnter = () => {
    // Create multiple cupcakes with random directions
    const newCupcakes = []
    for (let i = 0; i < 25; i++) {
      newCupcakes.push({
        id: Date.now() + i,
        tx: (Math.random() - 0.5) * 100 * (0.2 * i), // Random horizontal movement (-50px to 50px)
        ty: -(Math.random() * 100 + 50 * (0.2 * i)), // Random upward movement (50px to 150px)
        r: (Math.random() - 0.5) * 360 * (0.2 * i), // Random rotation (-180deg to 180deg)
        color: ["pink-400", "pink-300", "purple-400", "purple-300", "blue-400"][Math.floor(Math.random() * 5)]
      })
    }
    setCupcakes(newCupcakes)

    // Remove cupcakes after animation completes
    setTimeout(() => {
      setCupcakes([])
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-base-content">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center py-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 gradient-text">GIF Extractor</h1>
          <p className="text-base-content/80 max-w-2xl mx-auto text-base md:text-lg">
            Extract and view individual frames from GIF files
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
                  Upload a GIF file or fetch one from a URL, then use the arrow keys (← →) to navigate between frames,
                  click on any frame to view it fullscreen, or use the thumbnails below to jump to a specific frame.
                  Download individual frames with the download button.
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
            <div className="relative inline-block">
              <a
                href="https://muffnlabs.de"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base-content hover:text-primary transition-all duration-300 transform hover:scale-105 z-10 relative"
                onMouseEnter={handleMouseEnter}
              >
                muffnlabs
              </a>
              {/* Cupcakes that fly away on hover - pointer-events none so they don't block the link */}
              {cupcakes.map((cupcake) => (
                <span
                  key={cupcake.id}
                  className={`absolute text-${cupcake.color} cupcake-animation text-lg`}
                  style={{
                    "--tx": `${cupcake.tx}px`,
                    "--ty": `${cupcake.ty}px`,
                    "--r": `${cupcake.r}deg`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none"
                  }}
                >
                  🧁
                </span>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center">
            <a
              href="https://github.com/nomuffn/gif-extractor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-base-content/60 hover:text-base-content transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="mr-1"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
