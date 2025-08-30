## fully vibe coded slop

# GIF Extractor

A web application to extract and view individual frames from GIF files.

## Features

- Upload any GIF file
- Extract all frames from the GIF
- View frames in a gallery with navigation controls
- Download individual frames as PNG files
- Batch download selected frames or all frames as a ZIP file
- Select specific frames for download
- View detailed frame information (dimensions, delay, etc.)
- Keyboard navigation support (arrow keys)
- Responsive design that works on all devices

## Live Demo

Check out the live demo: [GIF Extractor](https://muffnlabs.github.io/gif-extractor/)

## Technologies Used

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [gifuct-js](https://github.com/matt-way/gifuct-js)
- [JSZip](https://stuk.github.io/jszip/)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/muffnlabs/gif-extractor.git
   ```

2. Navigate to the project directory:

   ```bash
   cd gif-extractor/gif-extractor-frontend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open the application in your browser
2. Upload a GIF file using the drag-and-drop area or file selector
3. Browse through the extracted frames using:
   - Arrow keys (left/right)
   - Navigation buttons
   - Thumbnail gallery
4. Select frames you want to download using the checkboxes
5. Download selected frames as a ZIP file, or download all frames
6. Click on any frame to view it in fullscreen
7. View detailed frame information by clicking the "Info" button

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions.
The workflow is defined in `.github/workflows/deploy.yml`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
