/**
 * Layer Manager - Handles all layer CRUD operations and state management
 */
class LayerManager {
  constructor() {
    this.layers = [];
    this.selectedLayerId = null;
    this.background = {
      type: 'color',
      color: '#f5f5f5',
      gradientStart: '#8b5cf6',
      gradientEnd: '#d946ef',
      gradientDirection: 'to right',
      imageSrc: null,
      imageFilename: null,
      sizing: 'fill'
    };
    this.containerWidth = 768;
    this.listeners = [];
    this.layerIdCounter = 0;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all subscribers of state change
   */
  notify(eventType = 'update') {
    this.listeners.forEach(callback => callback(eventType, this.getState()));
  }

  /**
   * Get current state
   */
  getState() {
    return {
      layers: [...this.layers],
      selectedLayerId: this.selectedLayerId,
      background: { ...this.background },
      containerWidth: this.containerWidth
    };
  }

  /**
   * Set container width
   */
  setContainerWidth(width) {
    this.containerWidth = Math.max(300, Math.min(1200, width));
    this.notify('container-resize');
  }

  /**
   * Add a new image layer
   */
  addLayer(imageData) {
    const layer = {
      id: `layer-${++this.layerIdCounter}`,
      src: imageData.src,
      filename: imageData.filename,
      originalWidth: imageData.width,
      originalHeight: imageData.height,
      xAlign: 'center',
      xPosition: 0,
      yAlign: 'center',
      yPosition: 0,
      width: null, // auto
      height: null, // auto
      scale: 1,
      scaleTarget: 'both',
      retina: false,
      aspectRatioLocked: true,
      zIndex: Math.min(this.layers.length + 1, 15),
      animSpeed: 2,
      visible: true
    };

    this.layers.push(layer);
    this.selectedLayerId = layer.id;
    this.notify('layer-add');
    return layer;
  }

  /**
   * Remove a layer by ID
   */
  removeLayer(layerId) {
    const index = this.layers.findIndex(l => l.id === layerId);
    if (index === -1) return false;

    this.layers.splice(index, 1);
    
    if (this.selectedLayerId === layerId) {
      this.selectedLayerId = this.layers.length > 0 
        ? this.layers[this.layers.length - 1].id 
        : null;
    }
    
    this.notify('layer-remove');
    return true;
  }

  /**
   * Update layer properties
   */
  updateLayer(layerId, updates) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return false;

    // Handle aspect ratio locking
    if (layer.aspectRatioLocked && layer.originalWidth && layer.originalHeight) {
      const aspectRatio = layer.originalWidth / layer.originalHeight;
      
      if (updates.width !== undefined && updates.height === undefined) {
        updates.height = updates.width ? Math.round(updates.width / aspectRatio) : null;
      } else if (updates.height !== undefined && updates.width === undefined) {
        updates.width = updates.height ? Math.round(updates.height * aspectRatio) : null;
      }
    }

    Object.assign(layer, updates);
    this.notify('layer-update');
    return true;
  }

  /**
   * Select a layer
   */
  selectLayer(layerId) {
    if (layerId === 'background') {
      this.selectedLayerId = 'background';
    } else {
      const layer = this.layers.find(l => l.id === layerId);
      this.selectedLayerId = layer ? layer.id : null;
    }
    this.notify('layer-select');
  }

  /**
   * Get selected layer
   */
  getSelectedLayer() {
    if (this.selectedLayerId === 'background') {
      return { id: 'background', ...this.background };
    }
    return this.layers.find(l => l.id === this.selectedLayerId) || null;
  }

  /**
   * Reorder layers
   */
  reorderLayers(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    
    const [layer] = this.layers.splice(fromIndex, 1);
    this.layers.splice(toIndex, 0, layer);
    this.layers.forEach((item, index) => {
      item.zIndex = Math.min(index + 1, 15);
    });
    this.notify('layer-reorder');
  }

  /**
   * Toggle layer visibility
   */
  toggleLayerVisibility(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    if (layer) {
      layer.visible = !layer.visible;
      this.notify('layer-update');
    }
  }

  /**
   * Update background settings
   */
  updateBackground(updates) {
    Object.assign(this.background, updates);
    this.notify('background-update');
  }

  /**
   * Replace layer image
   */
  replaceLayerImage(layerId, imageData) {
    const layer = this.layers.find(l => l.id === layerId);
    if (!layer) return false;

    layer.src = imageData.src;
    layer.filename = imageData.filename;
    layer.originalWidth = imageData.width;
    layer.originalHeight = imageData.height;
    
    // Reset dimensions to auto
    layer.width = null;
    layer.height = null;
    
    this.notify('layer-update');
    return true;
  }


  /**
   * Clear all layers
   */
  clearAll() {
    this.layers = [];
    this.selectedLayerId = null;
    this.background = {
      type: 'color',
      color: '#f5f5f5',
      gradientStart: '#8b5cf6',
      gradientEnd: '#d946ef',
      gradientDirection: 'to right',
      imageSrc: null,
      imageFilename: null,
      sizing: 'fill'
    };
    this.notify('clear');
  }

  /**
   * Export state for JSON
   */
  exportState() {
    return {
      container: {
        width: this.containerWidth,
        height: 'auto'
      },
      background: {
        type: this.background.type,
        ...(this.background.type === 'color' && { color: this.background.color }),
        ...(this.background.type === 'gradient' && {
          gradient: `linear-gradient(${this.background.gradientDirection}, ${this.background.gradientStart}, ${this.background.gradientEnd})`
        }),
        ...((this.background.type === 'image' || this.background.type === 'tile') && {
          src: this.background.imageFilename,
          sizing: this.background.sizing
        })
      },
      layers: this.layers.map(layer => ({
        id: layer.id,
        src: layer.filename,
        xAlign: layer.xAlign,
        xPosition: layer.xPosition,
        yAlign: layer.yAlign,
        yPosition: layer.yPosition,
        aspectRatioLocked: layer.aspectRatioLocked,
        zIndex: layer.zIndex,
        animSpeed: layer.animSpeed ?? 2,
        width: layer.width || 'auto',
        height: layer.height || 'auto'
      }))
    };
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.LayerManager = LayerManager;
}
