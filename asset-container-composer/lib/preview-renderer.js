/**
 * Preview Renderer - Handles rendering the composition preview
 */
class PreviewRenderer {
  constructor(containerEl, backgroundEl, layersEl, cardPreviewEl = null) {
    this.containerEl = containerEl;
    this.backgroundEl = backgroundEl;
    this.layersEl = layersEl;
    this.cardPreviewEl = cardPreviewEl;
    this.layerElements = new Map();
  }

  /**
   * Update the preview with current state
   */
  render(state) {
    this.updateContainerWidth(state.containerWidth);
    this.renderBackground(state.background);
    this.renderLayers(state.layers, state.selectedLayerId);
  }

  /**
   * Update container width
   */
  updateContainerWidth(width) {
    // Apply width to card preview if available, otherwise to container
    if (this.cardPreviewEl) {
      this.cardPreviewEl.style.width = `${width}px`;
    } else {
      this.containerEl.style.width = `${width}px`;
    }
  }

  /**
   * Render background
   */
  renderBackground(bg) {
    switch (bg.type) {
      case 'color':
        this.backgroundEl.style.background = bg.color;
        break;
      case 'gradient':
        this.backgroundEl.style.background = 
          `linear-gradient(${bg.gradientDirection}, ${bg.gradientStart}, ${bg.gradientEnd})`;
        break;
      case 'image':
        if (bg.imageSrc) {
          this.backgroundEl.style.background = `url(${bg.imageSrc})`;
          this.backgroundEl.style.backgroundSize = bg.sizing === 'fill' ? 'cover' : 'contain';
          this.backgroundEl.style.backgroundPosition = 'center';
          this.backgroundEl.style.backgroundRepeat = 'no-repeat';
        }
        break;
      case 'tile':
        if (bg.imageSrc) {
          this.backgroundEl.style.background = `url(${bg.imageSrc})`;
          this.backgroundEl.style.backgroundSize = 'auto';
          this.backgroundEl.style.backgroundRepeat = 'repeat';
        }
        break;
    }
  }

  /**
   * Render all layers
   */
  renderLayers(layers, selectedLayerId) {
    // Remove layers that no longer exist
    const currentIds = new Set(layers.map(l => l.id));
    for (const [id, el] of this.layerElements) {
      if (!currentIds.has(id)) {
        el.remove();
        this.layerElements.delete(id);
      }
    }

    // Sort layers by z-index for proper stacking
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    // Update or create layer elements
    sortedLayers.forEach((layer, index) => {
      let el = this.layerElements.get(layer.id);
      
      if (!el) {
        el = this.createLayerElement(layer);
        this.layerElements.set(layer.id, el);
        this.layersEl.appendChild(el);
      }

      this.updateLayerElement(el, layer, selectedLayerId === layer.id);
    });
  }

  /**
   * Create a new layer element
   */
  createLayerElement(layer) {
    const el = document.createElement('div');
    el.className = 'preview-layer';
    el.dataset.layerId = layer.id;

    const img = document.createElement('img');
    img.src = layer.src;
    img.alt = layer.filename;
    img.draggable = false;
    el.appendChild(img);

    return el;
  }

  /**
   * Update layer element position and styling
   */
  updateLayerElement(el, layer, isSelected) {
    const img = el.querySelector('img');
    
    // Visibility
    el.style.display = layer.visible ? 'block' : 'none';
    
    // Selection state
    el.classList.toggle('selected', isSelected);
    
    // Z-index
    el.style.zIndex = layer.zIndex;

    // Animation speed indicator for preview hover
    el.dataset.animSpeed = String(layer.animSpeed ?? 2);

    // Reset image styles before applying new ones
    img.style.width = '';
    img.style.height = '';
    img.style.maxWidth = '';
    img.style.maxHeight = '';
    img.style.objectFit = '';
    img.style.marginLeft = '';
    img.style.marginRight = '';

    // Apply explicit dimensions if set
    if (layer.width) {
      img.style.width = `${layer.width}px`;
    }
    
    if (layer.height) {
      img.style.height = `${layer.height}px`;
    }

    // Positioning based on alignment
    this.applyAlignment(el, layer);

    // Retina auto sizing (only when width/height are auto)
    if (layer.retina) {
      if (!layer.width && layer.originalWidth && !img.style.width) {
        img.style.width = `${Math.round(layer.originalWidth * 0.5)}px`;
      }
      if (!layer.height && layer.originalHeight && !img.style.height) {
        img.style.height = `${Math.round(layer.originalHeight * 0.5)}px`;
      }
    }
  }

  /**
   * Apply alignment positioning to layer
   */
  applyAlignment(el, layer) {
    // Reset positioning
    el.style.left = '';
    el.style.right = '';
    el.style.top = '';
    el.style.bottom = '';
    el.style.transform = '';
    el.style.width = '';
    el.style.marginLeft = '';
    el.style.marginTop = '';

    const img = el.querySelector('img');

    // X-axis alignment
    switch (layer.xAlign) {
      case 'left':
        el.style.left = `${layer.xPosition}px`;
        break;
      case 'right':
        el.style.right = `${layer.xPosition}px`;
        break;
      case 'left+right':
        el.style.left = `${layer.xPosition}px`;
        el.style.right = `${layer.xPosition}px`;
        el.style.width = 'auto';
        img.style.width = '100%';
        break;
      case 'center':
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        if (layer.xPosition !== 0) {
          el.style.marginLeft = `${layer.xPosition}px`;
        }
        break;
      case 'scale':
        el.style.left = '10%';
        el.style.right = '10%';
        img.style.width = '80%';
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';
        break;
    }

    // Y-axis alignment
    let transformY = '';
    switch (layer.yAlign) {
      case 'top':
        el.style.top = `${layer.yPosition}px`;
        break;
      case 'bottom':
        el.style.bottom = `${layer.yPosition}px`;
        break;
      case 'top+bottom':
        el.style.top = `${layer.yPosition}px`;
        el.style.bottom = `${layer.yPosition}px`;
        img.style.height = '100%';
        img.style.objectFit = layer.aspectRatioLocked ? 'contain' : 'fill';
        break;
      case 'center':
        el.style.top = '50%';
        transformY = 'translateY(-50%)';
        if (layer.yPosition !== 0) {
          el.style.marginTop = `${layer.yPosition}px`;
        }
        break;
      case 'scale':
        el.style.top = '10%';
        el.style.bottom = '10%';
        img.style.height = '80%';
        img.style.objectFit = 'contain';
        break;
    }

    // Combine transforms
    if (layer.xAlign === 'center' && layer.yAlign === 'center') {
      el.style.transform = 'translate(-50%, -50%)';
    } else if (layer.xAlign === 'center') {
      el.style.transform = 'translateX(-50%)';
    } else if (transformY) {
      el.style.transform = transformY;
    }
  }

  /**
   * Highlight a layer briefly
   */
  highlightLayer(layerId) {
    const el = this.layerElements.get(layerId);
    if (el) {
      el.style.animation = 'none';
      el.offsetHeight; // Trigger reflow
      el.style.animation = 'pulse 0.3s ease';
    }
  }

  /**
   * Clear all layers
   */
  clear() {
    this.layersEl.innerHTML = '';
    this.layerElements.clear();
    this.backgroundEl.style.background = '#f5f5f5';
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.PreviewRenderer = PreviewRenderer;
}
