# Precision Polygon Annotation UI

A professional-grade interactive polygon annotation tool built with React, TypeScript, and SVG. Designed for high-precision labeling and a premium user experience.

## ✨ Key Features

- **Interactive Polygon Drawing**: Click anywhere to place vertices.
- **Auto-Closing Snap**: Hover and click the first vertex to close the polygon (snapping distance included).
- **Draggable Vertices**: Real-time adjustment of existing annotations.
- **Multi-Polygon Support**: Annotate multiple objects in a single image.
- **Undo/Redo System**: Full history tracking (up to 50 states).
- **History Log**: Visual panel showing all annotations with their vertex counts.
- **Live Export Preview**: Real-time JSON schema update panel.
- **Keyboard Shortcuts**:
  - `Ctrl + Z`: Undo
  - `Ctrl + Y` / `Ctrl + Shift + Z`: Redo
  - `Esc`: Cancel current drawing
- **Premium UI**: Glassmorphism aesthetic, Lucide icons, and responsive SVG overlay.

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🎨 Architectural Choice: SVG vs. Canvas

I chose **SVG** (Scalable Vector Graphics) for the annotation overlay instead of Canvas for the following reasons:

1.  **Event Handling**: SVG elements are part of the DOM, allowing for direct event listeners on specific vertices and polygons. This makes implementing features like "dragging a specific vertex" or "hovering to close" much simpler and more performant than manual hit-detection in Canvas.
2.  **Scalability**: Being vector-based, the annotations remain perfectly sharp at any zoom level, which is critical for precision labeling.
3.  **Declarative UI**: React's declarative nature maps perfectly to SVG's structure, resulting in cleaner, more maintainable code compared to the imperative nature of the Canvas API.

## 🤖 AI Usage Statement

This project was developed with the assistance of **Antigravity AI (Google Deepmind Assistant)**.
AI was used for:
- Scaffolding the initial project structure.
- Brainstorming advanced features (Draggable vertices, Snapping logic).
- Generating high-quality placeholder assets (Baseball sample image).
- Assisting with complex SVG math (Centering controls, Euclidean distance for snapping).
- Refining the premium CSS "Glass" styles.
- Professional documentation drafting.

## 🚀 Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Build for Production**:
    ```bash
    npm run build
    ```

## 📄 JSON Export Schema

```json
{
  "image": "baseball.png",
  "timestamp": "2026-03-26T...",
  "polygons": [
    {
      "id": "uuid-string",
      "points": [
        { "x": 100, "y": 200 },
        { "x": 150, "y": 250 },
        { "x": 100, "y": 300 }
      ],
      "isClosed": true
    }
  ]
}
```

---
**Author**: Akshay Pranjape
*Assignment submission for Frontend Developer Role*
