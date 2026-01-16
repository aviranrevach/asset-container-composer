/**
 * Asset Container Composer - Main Application
 */
(function() {
  'use strict';

  // Initialize components
  const layerManager = new LayerManager();
  const previewContainer = document.getElementById('previewContainer');
  const previewBackground = document.getElementById('previewBackground');
  const previewLayers = document.getElementById('previewLayers');
  const cardPreview = document.getElementById('cardPreview');
  const previewRenderer = new PreviewRenderer(previewContainer, previewBackground, previewLayers, cardPreview);

  // DOM Elements
  const elements = {
    // Container width controls
    containerWidth: document.getElementById('containerWidth'),
    containerHeight: document.getElementById('containerHeight'),
    
    // Layer panel
    layersList: document.getElementById('layersList'),
    addLayerBtn: document.getElementById('addLayerBtn'),
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    dropZoneButtons: document.querySelectorAll('.drop-zone-btn'),
    dropZoneStatus: document.getElementById('dropZoneStatus'),
    
    // Properties panel
    propertiesContent: document.getElementById('propertiesContent'),
    emptyState: document.getElementById('emptyState'),
    bgProperties: document.getElementById('bgProperties'),
    layerProperties: document.getElementById('layerProperties'),
    
    // Background controls
    bgColorGroup: document.getElementById('bgColorGroup'),
    bgGradientGroup: document.getElementById('bgGradientGroup'),
    bgImageGroup: document.getElementById('bgImageGroup'),
    bgColor: document.getElementById('bgColor'),
    bgColorHex: document.getElementById('bgColorHex'),
    bgGradientStart: document.getElementById('bgGradientStart'),
    bgGradientEnd: document.getElementById('bgGradientEnd'),
    bgGradientDirection: document.getElementById('bgGradientDirection'),
    bgImageUpload: document.getElementById('bgImageUpload'),
    bgImageInput: document.getElementById('bgImageInput'),
    bgSizingRow: document.getElementById('bgSizingRow'),
    
    // Layer controls
    layerName: document.getElementById('layerName'),
    layerImagePreview: document.getElementById('layerImagePreview'),
    replaceImageBtn: document.getElementById('replaceImageBtn'),
    replaceImageInput: document.getElementById('replaceImageInput'),
    xAlign: document.getElementById('xAlign'),
    xPosition: document.getElementById('xPosition'),
    yAlign: document.getElementById('yAlign'),
    yPosition: document.getElementById('yPosition'),
    autoWidth: document.getElementById('autoWidth'),
    autoHeight: document.getElementById('autoHeight'),
    positionGridButtons: document.querySelectorAll('.position-grid-btn'),
    centerLayerBtn: document.getElementById('centerLayerBtn'),
    layerWidth: document.getElementById('layerWidth'),
    layerHeight: document.getElementById('layerHeight'),
    layerScale: document.getElementById('layerScale'),
    scalePreset: document.getElementById('scalePreset'),
    scaleTarget: document.getElementById('scaleTarget'),
    resetScaleBtn: document.getElementById('resetScaleBtn'),
    retinaScale: document.getElementById('retinaScale'),
    aspectRatioLocked: document.getElementById('aspectRatioLocked'),
    zIndex: document.getElementById('zIndex'),
    animSpeed: document.getElementById('animSpeed'),
    deleteLayerBtn: document.getElementById('deleteLayerBtn'),
    
    // Header buttons
    clearAll: document.getElementById('clearAll'),
    moreMenuBtn: document.getElementById('moreMenuBtn'),
    moreMenu: document.getElementById('moreMenu'),
    
    // Resize handles
    resizeLeft: document.querySelector('.resize-left'),
    resizeRight: document.querySelector('.resize-right'),
    resizeTop: document.querySelector('.resize-top'),
    resizeBottom: document.querySelector('.resize-bottom'),
    cardPreviewWrapper: document.querySelector('.card-preview-wrapper'),
    previewLayers: document.getElementById('previewLayers'),
    
    // Main view tabs (Preview / Export)
    mainViewTabs: document.querySelectorAll('.main-view-tab'),
    previewView: document.getElementById('previewView'),
    previewGalleryView: document.getElementById('previewGalleryView'),
    previewGalleryGrid: document.getElementById('previewGalleryGrid'),
    previewBgColor: document.getElementById('previewBgColor'),
    previewMaxWidth: document.getElementById('previewMaxWidth'),
    previewBentoToggle: document.getElementById('previewBentoToggle'),
    editorControls: document.getElementById('editorControls'),
    previewControls: document.getElementById('previewControls'),
    exportView: document.getElementById('exportView'),
    
    // Export format tabs (JSON / HTML)
    exportFormatTabs: document.querySelectorAll('.export-format-tab'),
    jsonPane: document.getElementById('jsonPane'),
    htmlPane: document.getElementById('htmlPane'),
    jsonOutput: document.getElementById('jsonOutput'),
    htmlOutput: document.getElementById('htmlOutput'),
    copyBtns: document.querySelectorAll('.copy-btn'),
    partialFullToggle: document.getElementById('partialFullToggle')
  };

  const animSpeedOptions = [
    { value: 3, label: '03 Top', detail: '15px' },
    { value: 2, label: '02 Mid', detail: '10px' },
    { value: 1, label: '01 Bottom', detail: '5px' },
    { value: 0, label: '00 Background', detail: '0px' }
  ];

  const testLayerSets = {
    '01': [
      'composer/test-layers/Patch 01.svg',
      'composer/test-layers/Patch 02.svg'
    ],
    '02': [
      'composer/test-layers/Copilot 01.svg',
      'composer/test-layers/copilot 02.svg',
      'composer/test-layers/copilot 03.svg'
    ],
    '03': [
      'composer/test-layers/Automation01.svg'
    ],
    '04': [
      'composer/test-layers/Reports 01.svg'
    ],
    '05': [
      'composer/test-layers/Rmm 01.svg'
    ],
    '06': [
      'composer/test-layers/Tickets 01.svg'
    ],
    '07': []
  };

  const cardSizeCache = { width: 768, height: 480 };
  if (elements.dropZoneStatus) {
    elements.dropZoneStatus.dataset.baseText = elements.dropZoneStatus.textContent;
  }

  /**
   * Initialize the application
   */
  function init() {
    // Subscribe to state changes
    layerManager.subscribe(handleStateChange);
    
    // Set up event listeners
    setupContainerWidthControls();
    setupLayerPanelEvents();
    setupPropertiesEvents();
    setupMainViewTabs();
    setupExportPanel();
    setupResizeHandles();
    setupDragAndDrop();
    setupLayerDragPosition();
    setupPartialFullToggle();
    setupScrubInputs();
    setupPreviewGalleryControls();
    
    // Initial render
    previewRenderer.render(layerManager.getState());
    updateExportOutput(); // Initial export output
  }

  /**
   * Handle state changes from LayerManager
   */
  function handleStateChange(eventType, state) {
    previewRenderer.render(state);
    updateCardSizeCache();
    renderLayersList(state);
    updatePropertiesPanel(state);
    updateExportOutput();
    if (elements.previewGalleryView?.classList.contains('active')) {
      renderPreviewGallery();
    }
  }

  function updateCardSizeCache() {
    if (!cardPreview) return;
    const rect = cardPreview.getBoundingClientRect();
    if (rect.width > 0) {
      cardSizeCache.width = Math.round(rect.width);
    }
    if (rect.height > 0) {
      cardSizeCache.height = Math.round(rect.height);
    }
  }

  /**
   * Set up container width controls
   */
  function setupContainerWidthControls() {
    const updateWidth = (value) => {
      const width = Math.max(300, Math.min(1200, parseInt(value) || 768));
      elements.containerWidth.value = width;
      layerManager.setContainerWidth(width);
      updateCardSizeCache();
    };

    const updateHeight = (value) => {
      const height = Math.max(300, Math.min(1200, parseInt(value) || 480));
      if (cardPreview) {
        cardPreview.style.height = `${height}px`;
      }
      if (elements.containerHeight) {
        elements.containerHeight.value = height;
      }
      updateCardSizeCache();
    };

    elements.containerWidth.addEventListener('input', (e) => {
      updateWidth(e.target.value);
    });

    elements.containerWidth.addEventListener('change', (e) => {
      updateWidth(e.target.value);
    });

    if (elements.containerHeight) {
      elements.containerHeight.addEventListener('input', (e) => {
        updateHeight(e.target.value);
      });
      elements.containerHeight.addEventListener('change', (e) => {
        updateHeight(e.target.value);
      });
    }
  }

  /**
   * Set up layer panel events
   */
  function setupLayerPanelEvents() {
    // Add layer button
    elements.addLayerBtn.addEventListener('click', () => {
      elements.fileInput.click();
    });

    // File input
    elements.fileInput.addEventListener('change', (e) => {
      handleFiles(e.target.files);
      e.target.value = '';
    });

    // Drop zone click
    elements.dropZone.addEventListener('click', () => {
      elements.fileInput.click();
    });

    // Quick test layer buttons
    if (elements.dropZoneButtons && elements.dropZoneButtons.length) {
      elements.dropZoneButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const setId = button.dataset.testSet;
          loadTestLayerSet(setId);
        });
      });
    }

    // Background layer selection
    document.querySelector('.layer-background').addEventListener('click', () => {
      layerManager.selectLayer('background');
    });
    
    // Clear all
    elements.clearAll.addEventListener('click', () => {
      if (confirm('Clear all layers and reset background?')) {
        layerManager.clearAll();
        previewRenderer.clear();
      }
      if (elements.moreMenu) {
        elements.moreMenu.hidden = true;
      }
    });

    if (elements.moreMenuBtn && elements.moreMenu) {
      elements.moreMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        elements.moreMenu.hidden = !elements.moreMenu.hidden;
      });

      document.addEventListener('click', (e) => {
        if (!elements.moreMenu.contains(e.target) && !elements.moreMenuBtn.contains(e.target)) {
          elements.moreMenu.hidden = true;
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          elements.moreMenu.hidden = true;
        }
      });
    }
  }

  /**
   * Set up drag and drop for files
   */
  function setupDragAndDrop() {
    const dropZone = elements.dropZone;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('dragover');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      handleFiles(e.dataTransfer.files);
    });
  }

  function setupPartialFullToggle() {
    if (!elements.partialFullToggle || !cardPreview) return;
    const headerSection = cardPreview.querySelector('.card-header-section');

    const updateHeaderOffset = () => {
      if (!headerSection) return;
      const headerHeight = headerSection.getBoundingClientRect().height;
      cardPreview.style.setProperty('--header-offset', `${headerHeight}px`);
    };

    elements.partialFullToggle.addEventListener('change', (e) => {
      const isFull = e.target.checked;
      cardPreview.classList.toggle('full-bleed', isFull);
      if (isFull) {
        updateHeaderOffset();
      } else {
        cardPreview.style.removeProperty('--header-offset');
      }
    });

    const headerInputs = cardPreview.querySelectorAll('#cardCategory, #cardTitle');
    headerInputs.forEach(input => {
      input.addEventListener('input', () => {
        if (cardPreview.classList.contains('full-bleed')) {
          updateHeaderOffset();
        }
      });
    });

    window.addEventListener('resize', () => {
      if (cardPreview.classList.contains('full-bleed')) {
        updateHeaderOffset();
      }
    });
  }

  function setupScrubInputs() {
    let scrubState = null;

    const getStep = (input) => {
      const step = parseFloat(input.step);
      return Number.isFinite(step) && step > 0 ? step : 1;
    };

    const getPrecision = (step) => {
      const parts = String(step).split('.');
      return parts[1] ? parts[1].length : 0;
    };

    const clamp = (value, min, max) => {
      if (Number.isFinite(min)) value = Math.max(min, value);
      if (Number.isFinite(max)) value = Math.min(max, value);
      return value;
    };

    const startScrub = (e, target) => {
      if (e.button !== 0) return;
      const targetId = target.dataset.target;
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input || input.disabled || input.type !== 'number') return;

      const startValue = parseFloat(input.value);
      const step = getStep(input);

      scrubState = {
        input,
        startX: e.clientX,
        startValue: Number.isFinite(startValue) ? startValue : 0,
        step,
        precision: getPrecision(step),
        min: parseFloat(input.min),
        max: parseFloat(input.max)
      };

      document.body.classList.add('scrubbing');
      if (target.dataset.axis === 'y') {
        document.body.classList.add('scrub-y');
      }
      e.preventDefault();
    };

    const handleMove = (e) => {
      if (!scrubState) return;
      const dx = e.clientX - scrubState.startX;
      const multiplier = e.shiftKey ? 0.1 : 1;
      let nextValue = scrubState.startValue + dx * scrubState.step * multiplier;
      nextValue = clamp(nextValue, scrubState.min, scrubState.max);
      nextValue = Number(nextValue.toFixed(scrubState.precision));

      scrubState.input.value = nextValue;
      scrubState.input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const handleUp = () => {
      if (!scrubState) return;
      scrubState.input.dispatchEvent(new Event('change', { bubbles: true }));
      document.body.classList.remove('scrubbing');
      document.body.classList.remove('scrub-y');
      scrubState = null;
    };

    document.addEventListener('mousedown', (e) => {
      const target = e.target.closest('.scrub-handle, .scrub-label');
      if (!target) return;
      startScrub(e, target);
    });

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }

  function setupPreviewGalleryControls() {
    if (!elements.previewGalleryView || !elements.previewBgColor) return;
    const applyBg = (value) => {
      elements.previewGalleryView.style.setProperty('--preview-bg', value);
    };
    applyBg(elements.previewBgColor.value);
    elements.previewBgColor.addEventListener('input', (e) => {
      applyBg(e.target.value);
    });
    if (elements.previewMaxWidth) {
      const applyMaxWidth = (value) => {
        const width = Math.max(600, Math.min(2400, parseInt(value) || 1280));
        elements.previewMaxWidth.value = width;
        elements.previewGalleryGrid.style.maxWidth = `${width}px`;
        elements.previewGalleryGrid.style.width = '100%';
      };
      applyMaxWidth(elements.previewMaxWidth.value);
      elements.previewMaxWidth.addEventListener('input', (e) => {
        applyMaxWidth(e.target.value);
      });
      elements.previewMaxWidth.addEventListener('change', (e) => {
        applyMaxWidth(e.target.value);
      });
    }
    if (elements.previewBentoToggle) {
      elements.previewBentoToggle.addEventListener('change', (e) => {
        elements.previewGalleryGrid.classList.toggle('regular', !e.target.checked);
        elements.previewGalleryGrid.classList.toggle('bento', e.target.checked);
      });
      elements.previewGalleryGrid.classList.toggle('bento', elements.previewBentoToggle.checked);
    }
  }

  function renderPreviewGallery() {
    if (!elements.previewGalleryGrid || !cardPreview) return;
    elements.previewGalleryGrid.innerHTML = '';

    const baseWidth = cardSizeCache.width;
    const baseHeight = cardSizeCache.height;

    const rows = ['r1', 'r2', 'r3'];
    rows.forEach(rowClass => {
      const row = document.createElement('div');
      row.className = `bento-row ${rowClass}`;

      for (let i = 0; i < 2; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'preview-card';
        wrapper.style.width = `${baseWidth}px`;
        wrapper.style.height = `${baseHeight}px`;

        const clone = cardPreview.cloneNode(true);
        clone.removeAttribute('id');
        clone.style.width = `${baseWidth}px`;
        clone.style.height = `${baseHeight}px`;

        clone.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
        clone.querySelectorAll('input, textarea, button').forEach(node => {
          node.setAttribute('disabled', 'true');
        });

        wrapper.appendChild(clone);
        row.appendChild(wrapper);
      }

      elements.previewGalleryGrid.appendChild(row);
    });
  }

  function setupLayerDragPosition() {
    let dragState = null;

    elements.previewLayers.addEventListener('mousedown', (e) => {
      const layerEl = e.target.closest('.preview-layer');
      if (!layerEl) return;

      const layerId = layerEl.dataset.layerId;
      const layer = layerManager.getState().layers.find(l => l.id === layerId);
      if (!layer) return;

      layerManager.selectLayer(layerId);

      dragState = {
        layerId,
        startX: e.clientX,
        startY: e.clientY,
        startXPos: layer.xPosition,
        startYPos: layer.yPosition,
        xAlign: layer.xAlign,
        yAlign: layer.yAlign
      };

      layerEl.classList.add('dragging');
      document.body.classList.add('is-dragging-layer');
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragState) return;

      let dx = e.clientX - dragState.startX;
      let dy = e.clientY - dragState.startY;

      if (e.shiftKey) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          dy = 0;
        } else {
          dx = 0;
        }
      }

      const updates = {};

      if (dragState.xAlign === 'left' || dragState.xAlign === 'center') {
        updates.xPosition = Math.round(dragState.startXPos + dx);
      } else if (dragState.xAlign === 'right') {
        updates.xPosition = Math.round(dragState.startXPos - dx);
      }

      if (dragState.yAlign === 'top' || dragState.yAlign === 'center') {
        updates.yPosition = Math.round(dragState.startYPos + dy);
      } else if (dragState.yAlign === 'bottom') {
        updates.yPosition = Math.round(dragState.startYPos - dy);
      }

      if (Object.keys(updates).length) {
        layerManager.updateLayer(dragState.layerId, updates);
      }
    });

    window.addEventListener('mouseup', () => {
      if (!dragState) return;
      const layerEl = elements.previewLayers.querySelector(
        `.preview-layer[data-layer-id="${dragState.layerId}"]`
      );
      if (layerEl) {
        layerEl.classList.remove('dragging');
      }
      document.body.classList.remove('is-dragging-layer');
      dragState = null;
    });
  }

  /**
   * Handle file uploads
   */
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          layerManager.addLayer({
            src: e.target.result,
            filename: file.name,
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function resolveTestAssetUrl(path) {
    if (window.chrome && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(path);
    }
    return new URL(path, window.location.href).toString();
  }

  async function loadTestLayerSet(setId) {
    const assets = testLayerSets[setId] || [];
    if (!assets.length) {
      console.warn(`No test assets configured for set ${setId}.`);
      if (elements.dropZoneStatus) {
        const baseText = elements.dropZoneStatus.dataset.baseText || 'Demo files';
        elements.dropZoneStatus.textContent = `${baseText} · Set ${setId} is empty`;
      }
      return;
    }

    try {
      if (elements.dropZoneStatus) {
        const baseText = elements.dropZoneStatus.dataset.baseText || 'Demo files';
        elements.dropZoneStatus.textContent = `${baseText} · Loading set ${setId}...`;
      }
      const files = await Promise.all(
        assets.map(async (path) => {
          const url = resolveTestAssetUrl(path);
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status}`);
          }
          const blob = await response.blob();
          const name = path.split('/').pop();
          return new File([blob], name, { type: blob.type || 'image/svg+xml' });
        })
      );
      handleFiles(files);
      if (elements.dropZoneStatus) {
        const baseText = elements.dropZoneStatus.dataset.baseText || 'Demo files';
        elements.dropZoneStatus.textContent = `${baseText} · Loaded ${files.length} layers (set ${setId})`;
      }
    } catch (error) {
      console.error('Failed to load test layer set:', error);
      if (elements.dropZoneStatus) {
        const baseText = elements.dropZoneStatus.dataset.baseText || 'Demo files';
        elements.dropZoneStatus.textContent = `${baseText} · Failed to load set ${setId}`;
      }
    }
  }

  /**
   * Render the layers list
   */
  function renderLayersList(state) {
    const container = elements.layersList;
    const bgEl = document.querySelector('.layer-background');

    container.innerHTML = '';

    // Render layers in reverse order (top layer first in list)
    const reversedLayers = [...state.layers].reverse();

    reversedLayers.forEach((layer) => {
      const el = createLayerListItem(layer, state.selectedLayerId);
      container.appendChild(el);
    });

    if (bgEl) {
      container.appendChild(bgEl);
      bgEl.classList.toggle('selected', state.selectedLayerId === 'background');
    }
  }

  /**
   * Create a layer list item element
   */
  function createLayerListItem(layer, selectedLayerId) {
    const el = document.createElement('div');
    el.className = `layer-item${layer.id === selectedLayerId ? ' selected' : ''}`;
    el.dataset.layerId = layer.id;

    // Format size display
    const sizeDisplay = layer.width && layer.height 
      ? `${layer.width}×${layer.height}` 
      : layer.width 
        ? `${layer.width}×auto` 
        : layer.height 
          ? `auto×${layer.height}` 
          : `${layer.originalWidth}×${layer.originalHeight}`;
    
    // Format alignment display
    const xAlignShort = { left: 'L', right: 'R', 'left+right': 'L+R', center: 'C', scale: 'S' };
    const yAlignShort = { top: 'T', bottom: 'B', 'top+bottom': 'T+B', center: 'C', scale: 'S' };
    const alignDisplay = `${xAlignShort[layer.xAlign] || 'C'}/${yAlignShort[layer.yAlign] || 'C'}`;
    
    // Format position display
    const posDisplay = (layer.xPosition !== 0 || layer.yPosition !== 0) 
      ? `${layer.xPosition},${layer.yPosition}` 
      : '0,0';

    el.innerHTML = `
      <div class="layer-order-group">
        <div class="layer-drag-handle">
          <svg width="16" height="28" viewBox="0 0 20 56" fill="currentColor">
            <circle cx="4" cy="6" r="1.8"/><circle cx="16" cy="6" r="1.8"/>
            <circle cx="4" cy="22" r="1.8"/><circle cx="16" cy="22" r="1.8"/>
            <circle cx="4" cy="38" r="1.8"/><circle cx="16" cy="38" r="1.8"/>
            <circle cx="4" cy="54" r="1.8"/><circle cx="16" cy="54" r="1.8"/>
          </svg>
        </div>
        <span class="layer-order-badge" title="Layer order">${String(layer.zIndex).padStart(2, '0')}</span>
      </div>
      <div class="layer-thumbnail">
        <img src="${layer.src}" alt="${layer.filename}">
      </div>
      <div class="layer-info">
        <span class="layer-name">${layer.filename}</span>
        <div class="layer-details">
          <span class="layer-detail" title="Alignment (X/Y)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 3H3v18h18V3zM12 3v18M3 12h18"/>
            </svg>
            ${alignDisplay}
          </span>
          <span class="layer-detail" title="Position (X,Y)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            </svg>
            ${posDisplay}
          </span>
          <span class="layer-detail" title="Size">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            ${sizeDisplay}
          </span>
        </div>
      </div>
      <button class="layer-visibility${!layer.visible ? ' hidden' : ''}" title="Toggle visibility">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${layer.visible 
            ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
            : '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
          }
        </svg>
      </button>
    `;

    // Layer selection
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.layer-visibility') && !e.target.closest('.layer-drag-handle')) {
        layerManager.selectLayer(layer.id);
      }
    });

    // Visibility toggle
    el.querySelector('.layer-visibility').addEventListener('click', (e) => {
      e.stopPropagation();
      layerManager.toggleLayerVisibility(layer.id);
    });

    // Drag and drop reordering
    setupLayerDragReorder(el);

    return el;
  }

  /**
   * Set up drag reordering for layers
   */
  function setupLayerDragReorder(el) {
    const handle = el.querySelector('.layer-drag-handle');

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      el.classList.add('dragging');
      
      const startY = e.clientY;
      const getDraggableItems = () =>
        Array.from(elements.layersList.children).filter(
          (child) => !child.classList.contains('layer-background')
        );
      const startIndex = getDraggableItems().indexOf(el);
      
      function onMouseMove(e) {
        const deltaY = e.clientY - startY;
        el.style.transform = `translateY(${deltaY}px)`;
        
        // Calculate new position
        const siblings = getDraggableItems().filter((c) => c !== el);
        const elRect = el.getBoundingClientRect();
        const elCenter = elRect.top + elRect.height / 2;
        
        siblings.forEach((sibling, i) => {
          const sibRect = sibling.getBoundingClientRect();
          const sibCenter = sibRect.top + sibRect.height / 2;
          
          if (elCenter < sibCenter && i < startIndex) {
            sibling.style.transform = 'translateY(50px)';
          } else if (elCenter > sibCenter && i >= startIndex) {
            sibling.style.transform = 'translateY(-50px)';
          } else {
            sibling.style.transform = '';
          }
        });
      }
      
      function onMouseUp(e) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        el.classList.remove('dragging');
        el.style.transform = '';
        
        Array.from(elements.layersList.children).forEach((c) => {
          c.style.transform = '';
        });
        
        // Calculate final position
        const children = getDraggableItems();
        const elRect = el.getBoundingClientRect();
        const elCenter = elRect.top + elRect.height / 2;
        
        let newIndex = startIndex;
        children.forEach((child, i) => {
          if (child === el) return;
          const rect = child.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          if (elCenter < center && i < newIndex) {
            newIndex = i;
          } else if (elCenter > center && i > newIndex) {
            newIndex = i;
          }
        });
        
        if (newIndex !== startIndex) {
          // Convert visual index to data index (reversed)
          const layers = layerManager.getState().layers;
          const fromDataIndex = layers.length - 1 - startIndex;
          const toDataIndex = layers.length - 1 - newIndex;
          layerManager.reorderLayers(fromDataIndex, toDataIndex);
        }
      }
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  /**
   * Update the properties panel based on selection
   */
  function updatePropertiesPanel(state) {
    const selectedLayer = layerManager.getSelectedLayer();

    if (!selectedLayer) {
      elements.emptyState.style.display = 'flex';
      elements.bgProperties.style.display = 'none';
      elements.layerProperties.style.display = 'none';
      return;
    }

    elements.emptyState.style.display = 'none';

    if (selectedLayer.id === 'background') {
      elements.bgProperties.style.display = 'block';
      elements.layerProperties.style.display = 'none';
      updateBackgroundProperties(state.background);
    } else {
      elements.bgProperties.style.display = 'none';
      elements.layerProperties.style.display = 'block';
      updateLayerProperties(selectedLayer);
    }
  }

  function setAnimSpeedButton(value) {
    if (!elements.animSpeed) return;
    const fallback = animSpeedOptions.find((opt) => opt.value === 2);
    const option = animSpeedOptions.find((opt) => opt.value === value) || fallback;
    const buttons = elements.animSpeed.querySelectorAll('[data-anim-speed]');

    elements.animSpeed.dataset.value = String(option.value);
    buttons.forEach((button) => {
      const btnValue = parseInt(button.dataset.animSpeed, 10);
      button.classList.toggle('is-active', btnValue === option.value);
    });
  }

  /**
   * Update background properties panel
   */
  function updateBackgroundProperties(bg) {
    // Update type buttons
    document.querySelectorAll('[data-bg-type]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.bgType === bg.type);
    });

    // Show/hide relevant groups
    elements.bgColorGroup.style.display = bg.type === 'color' ? 'block' : 'none';
    elements.bgGradientGroup.style.display = bg.type === 'gradient' ? 'block' : 'none';
    elements.bgImageGroup.style.display = (bg.type === 'image' || bg.type === 'tile') ? 'block' : 'none';

    // Update values
    elements.bgColor.value = bg.color;
    elements.bgColorHex.value = bg.color;
    elements.bgGradientStart.value = bg.gradientStart;
    elements.bgGradientEnd.value = bg.gradientEnd;
    elements.bgGradientDirection.value = bg.gradientDirection;

    // Update image preview
    if (bg.imageSrc) {
      elements.bgImageUpload.innerHTML = `<img src="${bg.imageSrc}" alt="Background">`;
      elements.bgImageUpload.classList.add('has-image');
      elements.bgSizingRow.style.display = 'block';
    } else {
      elements.bgImageUpload.innerHTML = '<span>Click to upload background</span>';
      elements.bgImageUpload.classList.remove('has-image');
      elements.bgSizingRow.style.display = 'none';
    }

    // Update sizing buttons
    document.querySelectorAll('[data-sizing]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sizing === bg.sizing);
    });
  }

  /**
   * Update layer properties panel
   */
  function updateLayerProperties(layer) {
    elements.layerName.textContent = layer.filename;
    
    // Image preview
    elements.layerImagePreview.innerHTML = `<img src="${layer.src}" alt="${layer.filename}">`;
    
    // Position and alignment
    elements.xAlign.value = layer.xAlign;
    elements.xPosition.value = layer.xPosition;
    elements.yAlign.value = layer.yAlign;
    elements.yPosition.value = layer.yPosition;
    updatePositionGrid(layer);
    
    // Dimensions
    elements.layerWidth.value = layer.width || '';
    elements.layerHeight.value = layer.height || '';
    elements.autoWidth.checked = layer.width === null;
    elements.autoHeight.checked = layer.height === null;
    elements.layerWidth.disabled = elements.autoWidth.checked;
    elements.layerHeight.disabled = elements.autoHeight.checked;
    if (elements.retinaScale) {
      elements.retinaScale.checked = !!layer.retina;
    }
    const scaleValue = layer.scale || 1;
    elements.layerScale.value = scaleValue;
    elements.scaleTarget.value = layer.scaleTarget || 'both';
    elements.scalePreset.value = (scaleValue === 0.5 || scaleValue === 1 || scaleValue === 2 || scaleValue === 3)
      ? String(scaleValue)
      : 'custom';
    elements.layerScale.disabled = elements.scalePreset.value !== 'custom';
    elements.aspectRatioLocked.checked = layer.aspectRatioLocked;
    
    // Z-index
    elements.zIndex.value = layer.zIndex;

    // Animation speed
    setAnimSpeedButton(layer.animSpeed ?? 2);
  }

  function updatePositionGrid(layer) {
    elements.positionGridButtons.forEach(btn => {
      const xAlign = btn.dataset.x;
      const yAlign = btn.dataset.y;
      const isXMatch = layer.xAlign === xAlign;
      const isYMatch = layer.yAlign === yAlign;
      btn.classList.toggle('active', isXMatch && isYMatch);
    });
  }

  function applyScaleToLayer(scale) {
    const layer = layerManager.getSelectedLayer();
    if (!layer || layer.id === 'background') return;

    const target = elements.scaleTarget.value || 'both';
    const updates = {
      scale,
      scaleTarget: target
    };

    const scaledWidth = layer.originalWidth ? Math.round(layer.originalWidth * scale) : null;
    const scaledHeight = layer.originalHeight ? Math.round(layer.originalHeight * scale) : null;

    if (target === 'both') {
      updates.width = scaledWidth;
      updates.height = scaledHeight;
    } else if (target === 'width') {
      updates.width = scaledWidth;
      updates.height = layer.height === undefined ? null : layer.height;
    } else if (target === 'height') {
      updates.height = scaledHeight;
      updates.width = layer.width === undefined ? null : layer.width;
    }

    layerManager.updateLayer(layer.id, updates);
  }

  /**
   * Set up properties panel events
   */
  function setupPropertiesEvents() {
    // Background type buttons
    document.querySelectorAll('[data-bg-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        layerManager.updateBackground({ type: btn.dataset.bgType });
      });
    });

    // Background color
    elements.bgColor.addEventListener('input', (e) => {
      elements.bgColorHex.value = e.target.value;
      layerManager.updateBackground({ color: e.target.value });
    });

    elements.bgColorHex.addEventListener('change', (e) => {
      const color = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        elements.bgColor.value = color;
        layerManager.updateBackground({ color });
      }
    });

    // Background gradient
    elements.bgGradientStart.addEventListener('input', (e) => {
      layerManager.updateBackground({ gradientStart: e.target.value });
    });

    elements.bgGradientEnd.addEventListener('input', (e) => {
      layerManager.updateBackground({ gradientEnd: e.target.value });
    });

    elements.bgGradientDirection.addEventListener('change', (e) => {
      layerManager.updateBackground({ gradientDirection: e.target.value });
    });

    // Background image upload
    elements.bgImageUpload.addEventListener('click', () => {
      elements.bgImageInput.click();
    });

    elements.bgImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          layerManager.updateBackground({
            imageSrc: e.target.result,
            imageFilename: file.name
          });
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    });

    // Background sizing
    document.querySelectorAll('[data-sizing]').forEach(btn => {
      btn.addEventListener('click', () => {
        layerManager.updateBackground({ sizing: btn.dataset.sizing });
      });
    });

    // Position grid (sets both axes)
    elements.positionGridButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const layerId = layerManager.selectedLayerId;
        if (layerId && layerId !== 'background') {
          layerManager.updateLayer(layerId, {
            xAlign: btn.dataset.x,
            yAlign: btn.dataset.y
          });
        }
      });
    });

    if (elements.centerLayerBtn) {
      elements.centerLayerBtn.addEventListener('click', () => {
        const layerId = layerManager.selectedLayerId;
        if (layerId && layerId !== 'background') {
          layerManager.updateLayer(layerId, {
            xAlign: 'center',
            yAlign: 'center',
            xPosition: 0,
            yPosition: 0
          });
        }
      });
    }

    // Layer alignment
    elements.xAlign.addEventListener('change', (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background') {
        layerManager.updateLayer(layerId, { xAlign: e.target.value });
      }
    });

    elements.yAlign.addEventListener('change', (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background') {
        layerManager.updateLayer(layerId, { yAlign: e.target.value });
      }
    });

    // Layer position
    const handleXPosition = (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background') {
        layerManager.updateLayer(layerId, { xPosition: parseInt(e.target.value) || 0 });
      }
    };
    elements.xPosition.addEventListener('input', handleXPosition);
    elements.xPosition.addEventListener('change', handleXPosition);

    const handleYPosition = (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background') {
        layerManager.updateLayer(layerId, { yPosition: parseInt(e.target.value) || 0 });
      }
    };
    elements.yPosition.addEventListener('input', handleYPosition);
    elements.yPosition.addEventListener('change', handleYPosition);

    // Layer dimensions
    elements.autoWidth.addEventListener('change', (e) => {
      const layer = layerManager.getSelectedLayer();
      if (!layer || layer.id === 'background') return;
      const isAuto = e.target.checked;
      elements.layerWidth.disabled = isAuto;
      const widthValue = isAuto ? null : (layer.width || layer.originalWidth || null);
      layerManager.updateLayer(layer.id, { width: widthValue });
    });

    elements.autoHeight.addEventListener('change', (e) => {
      const layer = layerManager.getSelectedLayer();
      if (!layer || layer.id === 'background') return;
      const isAuto = e.target.checked;
      elements.layerHeight.disabled = isAuto;
      const heightValue = isAuto ? null : (layer.height || layer.originalHeight || null);
      layerManager.updateLayer(layer.id, { height: heightValue });
    });

    const handleLayerWidth = (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background' && !elements.autoWidth.checked) {
        const value = parseInt(e.target.value) || null;
        layerManager.updateLayer(layerId, { width: value });
      }
    };
    elements.layerWidth.addEventListener('input', handleLayerWidth);
    elements.layerWidth.addEventListener('change', handleLayerWidth);

    const handleLayerHeight = (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background' && !elements.autoHeight.checked) {
        const value = parseInt(e.target.value) || null;
        layerManager.updateLayer(layerId, { height: value });
      }
    };
    elements.layerHeight.addEventListener('input', handleLayerHeight);
    elements.layerHeight.addEventListener('change', handleLayerHeight);

    elements.scalePreset.addEventListener('change', (e) => {
      const value = e.target.value;
      elements.layerScale.disabled = value !== 'custom';
      if (value !== 'custom') {
        elements.layerScale.value = value;
        applyScaleToLayer(parseFloat(value));
      }
    });

    const handleLayerScale = (e) => {
      const scale = parseFloat(e.target.value);
      if (!Number.isFinite(scale) || scale <= 0) return;
      elements.scalePreset.value = 'custom';
      elements.layerScale.disabled = false;
      applyScaleToLayer(scale);
    };
    elements.layerScale.addEventListener('input', handleLayerScale);
    elements.layerScale.addEventListener('change', handleLayerScale);

    elements.scaleTarget.addEventListener('change', () => {
      const scale = parseFloat(elements.layerScale.value) || 1;
      applyScaleToLayer(scale);
    });

    if (elements.retinaScale) {
      elements.retinaScale.addEventListener('change', (e) => {
        const layer = layerManager.getSelectedLayer();
        if (!layer || layer.id === 'background') return;
        layerManager.updateLayer(layer.id, { retina: e.target.checked });
      });
    }

    elements.resetScaleBtn.addEventListener('click', () => {
      elements.scalePreset.value = '1';
      elements.layerScale.value = '1';
      elements.layerScale.disabled = true;
      applyScaleToLayer(1);
    });

    elements.aspectRatioLocked.addEventListener('change', (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background') {
        layerManager.updateLayer(layerId, { aspectRatioLocked: e.target.checked });
      }
    });

    // Z-index
    elements.zIndex.addEventListener('change', (e) => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background') {
        layerManager.updateLayer(layerId, { zIndex: parseInt(e.target.value) });
      }
    });

    // Animation speed
    if (elements.animSpeed) {
      elements.animSpeed.addEventListener('click', (e) => {
        const button = e.target.closest('[data-anim-speed]');
        if (!button) return;

        const layerId = layerManager.selectedLayerId;
        if (!layerId || layerId === 'background') return;

        const nextValue = parseInt(button.dataset.animSpeed, 10);
        setAnimSpeedButton(nextValue);
        layerManager.updateLayer(layerId, { animSpeed: nextValue });
      });
    }

    // Replace image
    elements.replaceImageBtn.addEventListener('click', () => {
      elements.replaceImageInput.click();
    });

    elements.replaceImageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      const layerId = layerManager.selectedLayerId;
      
      if (file && layerId && layerId !== 'background') {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            layerManager.replaceLayerImage(layerId, {
              src: ev.target.result,
              filename: file.name,
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    });

    // Delete layer
    elements.deleteLayerBtn.addEventListener('click', () => {
      const layerId = layerManager.selectedLayerId;
      if (layerId && layerId !== 'background') {
        layerManager.removeLayer(layerId);
      }
    });
  }

  /**
   * Set up export events
   */
  /**
   * Set up resize handles for container width
   */
  function setupResizeHandles() {
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let activeSide = null;
    let activeAxis = null;

    const handleMouseDown = (e, axis, side) => {
      isResizing = true;
      activeAxis = axis;
      activeSide = side;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = layerManager.getState().containerWidth;
      startHeight = cardPreview.getBoundingClientRect().height;
      e.currentTarget.classList.add('dragging');
      document.body.style.cursor = axis === 'x' ? 'ew-resize' : 'ns-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    };

    const handleMouseMove = (e) => {
      if (!isResizing) return;

      if (activeAxis === 'x') {
        const diff = e.clientX - startX;
        let newWidth;

        // Left handle: dragging left increases width, dragging right decreases
        // Right handle: opposite
        if (activeSide === 'left') {
          newWidth = startWidth - diff * 2; // *2 because we expand both sides from center
        } else {
          newWidth = startWidth + diff * 2;
        }

        // Clamp to min/max
        newWidth = Math.max(300, Math.min(1200, newWidth));

        // Update UI and state
        elements.containerWidth.value = newWidth;
        layerManager.setContainerWidth(newWidth);
        updateCardSizeCache();
      } else {
        const diff = e.clientY - startY;
        let newHeight;

        if (activeSide === 'top') {
          newHeight = startHeight - diff * 2;
        } else {
          newHeight = startHeight + diff * 2;
        }

        newHeight = Math.max(300, Math.min(1200, newHeight));
        cardPreview.style.height = `${newHeight}px`;
        if (elements.containerHeight) {
          elements.containerHeight.value = Math.round(newHeight);
        }
        updateCardSizeCache();
      }
    };

    const handleMouseUp = () => {
      if (!isResizing) return;
      isResizing = false;
      document.querySelectorAll('.resize-handle').forEach(h => h.classList.remove('dragging'));
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    // Add event listeners
    if (elements.resizeLeft) {
      elements.resizeLeft.addEventListener('mousedown', (e) => handleMouseDown(e, 'x', 'left'));
    }
    if (elements.resizeRight) {
      elements.resizeRight.addEventListener('mousedown', (e) => handleMouseDown(e, 'x', 'right'));
    }
    if (elements.resizeTop) {
      elements.resizeTop.addEventListener('mousedown', (e) => handleMouseDown(e, 'y', 'top'));
    }
    if (elements.resizeBottom) {
      elements.resizeBottom.addEventListener('mousedown', (e) => handleMouseDown(e, 'y', 'bottom'));
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * Set up main view tabs (Preview / Export)
   */
  function setupMainViewTabs() {
    elements.mainViewTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.mainViewTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const viewName = tab.dataset.view;
        
        // Hide all views
        document.querySelectorAll('.main-view').forEach(view => view.classList.remove('active'));
        
        // Show selected view
        if (viewName === 'preview') {
          elements.previewView.classList.add('active');
          if (elements.parallaxLegend) {
            elements.parallaxLegend.style.display = 'flex';
          }
          if (elements.editorControls) elements.editorControls.classList.remove('is-hidden');
          if (elements.previewControls) elements.previewControls.classList.add('is-hidden');
          document.body.classList.remove('is-preview-mode');
        } else if (viewName === 'preview-gallery') {
          elements.previewGalleryView.classList.add('active');
          if (elements.parallaxLegend) {
            elements.parallaxLegend.style.display = 'none';
          }
          if (elements.editorControls) elements.editorControls.classList.add('is-hidden');
          if (elements.previewControls) elements.previewControls.classList.remove('is-hidden');
          document.body.classList.add('is-preview-mode');
          renderPreviewGallery();
        } else if (viewName === 'export') {
          elements.exportView.classList.add('active');
          if (elements.parallaxLegend) {
            elements.parallaxLegend.style.display = 'none';
          }
          if (elements.editorControls) elements.editorControls.classList.remove('is-hidden');
          if (elements.previewControls) elements.previewControls.classList.add('is-hidden');
          document.body.classList.remove('is-preview-mode');
          updateExportOutput(); // Refresh export when switching to it
        }
      });
    });
  }

  /**
   * Set up export format tabs (JSON / HTML) and copy buttons
   */
  function setupExportPanel() {
    // Format tab switching
    elements.exportFormatTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        elements.exportFormatTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.export-pane').forEach(pane => pane.classList.remove('active'));
        document.getElementById(tabName + 'Pane').classList.add('active');
      });
    });

    // Copy buttons
    elements.copyBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          const success = await Exporter.copyToClipboard(targetEl.textContent);
          showCopyFeedback(btn, success);
        }
      });
    });
  }

  /**
   * Update export output whenever state changes
   */
  function updateExportOutput() {
    const state = layerManager.getState();
    if (elements.jsonOutput) {
      elements.jsonOutput.textContent = Exporter.generateJSON(state);
    }
    if (elements.htmlOutput) {
      elements.htmlOutput.textContent = Exporter.generateHTML(state);
    }
  }

  /**
   * Show copy feedback on button
   */
  function showCopyFeedback(button, success) {
    const originalHTML = button.innerHTML;
    button.classList.add(success ? 'copied' : 'failed');
    button.innerHTML = success 
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!'
      : 'Failed';
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('copied', 'failed');
    }, 2000);
  }

  // Start the application
  init();
})();
