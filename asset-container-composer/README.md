# Asset Container Composer

A Chrome extension for visually composing image layouts within asset containers for the Atera website. This tool helps designers and developers create image compositions with precise positioning, alignment, and parallax layer configuration.

## Features

- **Multi-layer Image Composition**: Add multiple images and arrange them visually
- **Flexible Alignment Options**:
  - X-axis: Left, Right, Left+Right (stretch), Center, Scale
  - Y-axis: Top, Bottom, Top+Bottom (stretch), Center, Scale
- **Parallax Layer Groups**: Z-index grouping (0-9, 10-19, 20+) for parallax animations
- **Background Configuration**: Color, gradient, image, or tile patterns
- **Adjustable Container Width**: Preview at different widths (300px - 1200px)
- **Export Options**: JSON configuration and HTML/CSS code snippets

## Installation

### 1. Generate Icon Files

Before installing, you need to convert the SVG icons to PNG format. You can use any image editor or online converter.

The icons are located in the `icons/` folder:
- `icon-16.svg` → `icon-16.png` (16x16 pixels)
- `icon-48.svg` → `icon-48.png` (48x48 pixels)
- `icon-128.svg` → `icon-128.png` (128x128 pixels)

**Quick conversion using ImageMagick (if installed):**
```bash
cd icons
for size in 16 48 128; do
  convert icon-$size.svg icon-$size.png
done
```

**Or use an online converter like:**
- [SVG to PNG](https://svgtopng.com/)
- [CloudConvert](https://cloudconvert.com/svg-to-png)

### 2. Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `asset-container-composer` folder
5. The extension icon should appear in your toolbar

## Usage

### Opening the Composer

1. Click the extension icon in the Chrome toolbar
2. Click "Open Composer" to launch the full editor

### Adding Images

- **Drag & Drop**: Drag image files onto the drop zone
- **Click to Upload**: Click the drop zone or the + button to browse files
- Supports PNG, JPG, SVG, and other common image formats

### Configuring Layers

1. Click on a layer in the Layers panel to select it
2. Use the Properties panel to configure:
   - **X/Y Alignment**: How the image anchors to container edges
   - **X/Y Position**: Pixel offset from the anchor point
   - **Dimensions**: Custom width/height (leave empty for auto)
   - **Aspect Ratio Lock**: Maintain proportions when resizing
   - **Z-Index**: Layer stacking and parallax group assignment

### Alignment Behaviors

| Alignment | Description |
|-----------|-------------|
| Left/Top | Anchored to left/top edge with optional offset |
| Right/Bottom | Anchored to right/bottom edge with optional offset |
| Left+Right / Top+Bottom | Stretches with container (responsive) |
| Center | Centered with optional offset |
| Scale | Scales proportionally with container size |

### Parallax Groups

Z-index values are grouped for parallax animation:
- **Group 1 (0-9)**: Background elements - minimal movement
- **Group 2 (10-19)**: Mid-layer elements - medium movement
- **Group 3 (20+)**: Foreground elements - maximum movement

### Exporting

1. Click the "Export" button in the header
2. Choose export format:
   - **JSON**: Configuration object for programmatic use
   - **HTML/CSS**: Ready-to-use code snippets

## Data Model

The JSON export follows this structure:

```json
{
  "container": {
    "width": 768,
    "height": "auto"
  },
  "background": {
    "type": "color",
    "color": "#f5f5f5"
  },
  "layers": [
    {
      "id": "layer-1",
      "src": "image.png",
      "xAlign": "center",
      "xPosition": 0,
      "yAlign": "bottom",
      "yPosition": 20,
      "aspectRatioLocked": true,
      "zIndex": 10,
      "parallaxGroup": 2,
      "width": "auto",
      "height": "auto"
    }
  ]
}
```

## Development

The extension is built with vanilla JavaScript and CSS, requiring no build step.

### File Structure

```
asset-container-composer/
├── manifest.json           # Chrome extension manifest v3
├── popup/
│   ├── popup.html          # Quick access popup
│   └── popup.js
├── composer/
│   ├── index.html          # Main composer page
│   ├── styles.css          # Styling
│   └── app.js              # Main application logic
├── lib/
│   ├── layer-manager.js    # Layer CRUD operations
│   ├── preview-renderer.js # Canvas/DOM preview
│   └── exporter.js         # JSON + HTML/CSS export
└── icons/
    └── icon-*.svg/png      # Extension icons
```

## Browser Support

- Chrome 88+ (Manifest V3 requirement)
- Edge 88+ (Chromium-based)

## License

Internal tool for Atera website development.
