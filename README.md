# Alex Rivera - Premium 3D Creative Portfolio

A sleek, commercial-grade portfolio website featuring immersive 3D animations using **Three.js** and **GSAP** (GreenSock).

## Features

- **Dynamic 3D Canvas Background**: An interactive, morphing 3D particle sphere and starfield reacting to mouse movements and scroll offsets.
- **Glassmorphic UI**: Sleek, frosted glass visual components designed with vanilla CSS3 custom variables.
- **Parallax & Camera Scroll**: Scrolling down shifts and rotates the 3D viewport, flying the user through the space particles.
- **GSAP Animations**: Seamless scroll-triggered section reveals, landing page fade-ins, and timelines.
- **3D Hover Cards**: Project and service cards tilt dynamically in response to mouse cursor movement.
- **Dual-Theme Support**: Dark mode default with light mode compatibility.
- **Modern Responsive Design**: Fluid grid scales from mobile phones up to 4K displays.
- **Fully Integrated Custom Cursor**: A custom circular outline that scales and snaps on hover elements.
- **Toast Notifications**: Built-in visual toast popup for contact form submissions.

## Getting Started

Follow these steps to run the portfolio on your local machine:

### Prerequisites

You need [Node.js](https://nodejs.org/) installed to run the local development server.

### Installation

1. Open your terminal in this directory.
2. Install the dev dependencies (Vite):
   ```bash
   npm install
   ```

### Running Locally

1. Start the Vite development server:
   ```bash
   npm run dev
   ```
2. Open the URL shown in your terminal (usually `http://localhost:5173`) in your web browser.

## Customization

- **Change Projects**: Swap images in the `assets/` directory and update the content in `index.html`.
- **Change Theme Colors**: Update CSS custom variables in the `:root` and `body.light-theme` blocks of `style.css`.
- **Change 3D Dynamics**: Adjust particle counts, speeds, or camera motion coordinates in `three-scene.js`.

---

*Created with passion. Powered by modern web technology.*
