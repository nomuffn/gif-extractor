import { Dialog, Transition } from "@headlessui/react"
import { saveAs } from "file-saver"
import { decompressFrames, parseGIF } from "gifuct-js"
import JSZip from "jszip"
import React, { Fragment, useEffect, useState } from "react"

const FrameExtractor = ({ gifFile }) => {
  const [frames, setFrames] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fullscreenFrame, setFullscreenFrame] = useState(null)
  const [selectedFrames, setSelectedFrames] = useState(new Set())
  const [showFrameInfo, setShowFrameInfo] = useState(false)
  const [frameInfo, setFrameInfo] = useState(null)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1)
        }
      } else if (event.key === "ArrowRight") {
        if (currentSlide < frames.length - 1) {
          setCurrentSlide(currentSlide + 1)
        }
      } else if (event.key === "Escape" && fullscreenFrame) {
        setFullscreenFrame(null)
      } else if (event.key === "i" || event.key === "I") {
        // Show frame info when 'i' is pressed
        if (frames[currentSlide]) {
          setFrameInfo(frames[currentSlide])
          setShowFrameInfo(true)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentSlide, frames.length, fullscreenFrame])

  const extractFrames = async () => {
    if (!gifFile) return

    const arrayBuffer = await gifFile.arrayBuffer()
    const gif = parseGIF(arrayBuffer)
    const frames = decompressFrames(gif, true)

    const extractedFrames = frames.map((frame, index) => {
      // Create a canvas to render the frame
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      canvas.width = frame.dims.width
      canvas.height = frame.dims.height

      // Draw the patch
      const imageData = ctx.createImageData(frame.dims.width, frame.dims.height)
      imageData.data.set(frame.patch)
      ctx.putImageData(imageData, 0, 0)

      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve({
            index,
            blob: URL.createObjectURL(blob),
            delayMs: frame.delay,
            dimensions: {
              width: frame.dims.width,
              height: frame.dims.height
            },
            size: blob?.size || 0
          })
        }, "image/png")
      })
    })

    Promise.all(extractedFrames).then((extractedFrames) => {
      setFrames(extractedFrames)
    })
  }

  useEffect(() => {
    extractFrames()
  }, [gifFile])

  const downloadFrame = (frame) => {
    const link = document.createElement("a")
    link.href = frame.blob
    link.download = `frame-${frame.index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadSelectedFrames = async () => {
    if (selectedFrames.size === 0) return

    const zip = new JSZip()
    const folder = zip.folder("gif-frames")

    // Get selected frames data
    const selectedFramesData = frames.filter((frame) => selectedFrames.has(frame.index))

    // Add frames to zip
    selectedFramesData.forEach((frame) => {
      const blobPromise = fetch(frame.blob).then((r) => r.blob())
      folder.file(`frame-${frame.index}.png`, blobPromise)
    })

    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "gif-frames.zip")
  }

  const downloadAllFrames = async () => {
    const zip = new JSZip()
    const folder = zip.folder("gif-frames")

    // Add all frames to zip
    frames.forEach((frame) => {
      const blobPromise = fetch(frame.blob).then((r) => r.blob())
      folder.file(`frame-${frame.index}.png`, blobPromise)
    })

    // Generate and download zip
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "gif-frames.zip")
  }

  const toggleFrameSelection = (index) => {
    const newSelected = new Set(selectedFrames)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedFrames(newSelected)
  }

  const selectAllFrames = () => {
    const allFrameIndices = frames.map((frame) => frame.index)
    setSelectedFrames(new Set(allFrameIndices))
  }

  const clearSelection = () => {
    setSelectedFrames(new Set())
  }

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const goToNextSlide = () => {
    if (currentSlide < frames.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const showCurrentFrameInfo = () => {
    if (frames[currentSlide]) {
      setFrameInfo(frames[currentSlide])
      setShowFrameInfo(true)
    }
  }

  if (frames.length === 0) {
    return (
      <div className="flex justify-center items-center h-48 md:h-64 glass-card mt-6 md:mt-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-primary mb-3 md:mb-4"></div>
          <p className="text-base-content/80 text-sm md:text-base">Extracting frames from your GIF...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 md:mt-8 glass-card p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-base-content">Frame Gallery</h2>

      {/* Frame selection controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6 glass-light rounded-lg p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <button
            onClick={selectAllFrames}
            className="px-2.5 py-1 md:px-3 md:py-1 glass-button text-white rounded hover:bg-primary-focus text-xs md:text-sm"
          >
            Select All
          </button>
          <button
            onClick={clearSelection}
            className="px-2.5 py-1 md:px-3 md:py-1 glass-button-secondary text-base-content rounded hover:bg-surface-light text-xs md:text-sm"
          >
            Clear
          </button>
          <span className="text-base-content/80 text-xs md:text-sm">
            {selectedFrames.size} of {frames.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-2">
          <button
            onClick={downloadSelectedFrames}
            disabled={selectedFrames.size === 0}
            className={`px-3 py-1.5 md:px-4 md:py-2 rounded flex items-center space-x-1 md:space-x-2 text-xs md:text-sm ${
              selectedFrames.size > 0
                ? "glass-button text-white"
                : "glass-button-secondary text-base-content/50 cursor-not-allowed"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Selected</span>
          </button>
          <button
            onClick={downloadAllFrames}
            className="px-3 py-1.5 md:px-4 md:py-2 glass-button text-white rounded flex items-center space-x-1 md:space-x-2 text-xs md:text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 md:h-5 md:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>All</span>
          </button>
        </div>
      </div>

      {/* Main frame display */}
      <div className="mb-6 md:mb-8 relative">
        <div className="glass-light rounded-xl overflow-hidden shadow-lg mb-3 md:mb-4 w-full flex justify-center items-center p-2 md:p-4">
          <img
            src={frames[currentSlide]?.blob}
            alt={`Frame ${currentSlide}`}
            className="max-h-[50vh] md:max-h-[70vh] object-contain cursor-pointer rounded-lg"
            onClick={() => setFullscreenFrame(frames[currentSlide])}
          />
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className={`absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full glass-light text-base-content hover:bg-opacity-100 transition-all ${
            currentSlide === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-6 md:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNextSlide}
          disabled={currentSlide === frames.length - 1}
          className={`absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-2 md:p-3 rounded-full glass-light text-base-content hover:bg-opacity-100 transition-all ${
            currentSlide === frames.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-6 md:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Frame info and controls */}
        <div className="flex flex-wrap justify-between items-center gap-3 mt-3 md:mt-4">
          <div className="flex flex-wrap gap-3 md:gap-4">
            <p className="text-base-content/80 font-medium text-sm md:text-base">
              Frame {currentSlide + 1} of {frames.length}
            </p>
            <p className="text-base-content/80 text-sm md:text-base">
              Delay: <span className="font-medium">{frames[currentSlide]?.delayMs}ms</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            <button
              onClick={showCurrentFrameInfo}
              className="flex items-center space-x-1 px-2.5 py-1.5 md:px-3 md:py-2 glass-button-secondary text-base-content rounded-lg text-xs md:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden xs:inline">Info</span>
            </button>
            <button
              onClick={() => toggleFrameSelection(currentSlide)}
              className={`flex items-center space-x-1 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg transition-colors text-xs md:text-sm ${
                selectedFrames.has(currentSlide)
                  ? "glass-button text-white"
                  : "glass-button-secondary text-base-content"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden xs:inline">Select</span>
            </button>
            <button
              onClick={() => downloadFrame(frames[currentSlide])}
              className="flex items-center space-x-1 md:space-x-2 px-3 py-1.5 md:px-4 md:py-2 glass-button text-white rounded-lg text-xs md:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-5 md:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span className="hidden xs:inline">Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-6 md:mt-8">
        <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-base-content">All Frames</h3>
        <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-3 md:pb-4 scrollbar-thin scrollbar-thumb-surface-light scrollbar-track-surface rounded-lg">
          {frames.map((frame, index) => (
            <div
              key={frame.index}
              className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 relative ${
                currentSlide === index
                  ? "border-primary shadow-lg bg-surface-light/50"
                  : "border-surface-light hover:border-primary/50"
              } ${selectedFrames.has(index) ? "ring-2 ring-secondary ring-offset-2 ring-offset-surface" : ""}`}
              onClick={() => setCurrentSlide(index)}
            >
              <div
                className="absolute top-0.5 right-0.5 md:top-1 md:right-1 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFrameSelection(index)
                }}
              >
                <div
                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center ${
                    selectedFrames.has(index) ? "bg-secondary text-white" : "glass-light text-base-content"
                  }`}
                >
                  {selectedFrames.has(index) && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2.5 w-2.5 md:h-3 md:w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <img src={frame.blob} alt={`Frame ${frame.index}`} className="w-16 h-16 md:w-24 md:h-24 object-cover" />
              <div className="glass-light p-1 md:p-2">
                <p className="text-xs text-base-content/80 text-center">#{index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Frame Info Modal */}
      <Transition appear show={showFrameInfo} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowFrameInfo(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-70" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 md:p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xs md:max-w-md transform overflow-hidden rounded-2xl glass-card p-4 md:p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <Dialog.Title as="h3" className="text-lg md:text-xl font-medium leading-6 text-base-content">
                      Frame Information
                    </Dialog.Title>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md glass-button-secondary px-2.5 py-1.5 md:px-4 md:py-2 text-sm font-medium text-base-content hover:bg-surface-light/80 focus:outline-none"
                      onClick={() => setShowFrameInfo(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 md:h-5 md:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {frameInfo && (
                    <div className="mt-2 space-y-2 md:space-y-3">
                      <div className="flex items-center justify-center glass-light rounded-lg p-2 md:p-4">
                        <img
                          src={frameInfo.blob}
                          alt={`Frame ${frameInfo.index}`}
                          className="max-h-32 md:max-h-40 object-contain"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="glass-light p-2 md:p-3 rounded-lg">
                          <p className="text-xs text-base-content/60">Frame #</p>
                          <p className="font-medium text-sm md:text-base">{frameInfo.index + 1}</p>
                        </div>
                        <div className="glass-light p-2 md:p-3 rounded-lg">
                          <p className="text-xs text-base-content/60">Delay</p>
                          <p className="font-medium text-sm md:text-base">{frameInfo.delayMs}ms</p>
                        </div>
                        <div className="glass-light p-2 md:p-3 rounded-lg">
                          <p className="text-xs text-base-content/60">Width</p>
                          <p className="font-medium text-sm md:text-base">{frameInfo.dimensions.width}px</p>
                        </div>
                        <div className="glass-light p-2 md:p-3 rounded-lg">
                          <p className="text-xs text-base-content/60">Height</p>
                          <p className="font-medium text-sm md:text-base">{frameInfo.dimensions.height}px</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 md:mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md glass-button px-3 py-2 md:px-4 md:py-2 text-sm font-medium text-white hover:bg-primary-focus focus:outline-none w-full"
                      onClick={() => setShowFrameInfo(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Fullscreen modal */}
      <Transition appear show={!!fullscreenFrame} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setFullscreenFrame(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-90" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-2 md:p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md md:max-w-6xl transform overflow-hidden rounded-2xl glass-card p-4 md:p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-3 md:mb-4">
                    <Dialog.Title as="h3" className="text-lg md:text-xl font-medium leading-6 text-base-content">
                      Frame #{fullscreenFrame ? fullscreenFrame.index + 1 : ""}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md glass-button-secondary px-2.5 py-1.5 md:px-4 md:py-2 text-sm font-medium text-base-content hover:bg-surface-light/80 focus:outline-none"
                      onClick={() => setFullscreenFrame(null)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 md:h-5 md:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2 flex justify-center">
                    {fullscreenFrame && (
                      <img
                        src={fullscreenFrame.blob}
                        alt={`Frame ${fullscreenFrame.index}`}
                        className="max-h-[60vh] md:max-h-[80vh] object-contain rounded-lg"
                      />
                    )}
                  </div>
                  <div className="mt-3 md:mt-4 flex flex-wrap justify-between items-center gap-3">
                    <p className="text-sm text-base-content/80">
                      Delay: <span className="font-medium">{fullscreenFrame?.delayMs}ms</span>
                    </p>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md glass-button px-3 py-2 md:px-4 md:py-2 text-sm font-medium text-white hover:bg-primary-focus focus:outline-none"
                      onClick={() => fullscreenFrame && downloadFrame(fullscreenFrame)}
                    >
                      Download Frame
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default FrameExtractor
