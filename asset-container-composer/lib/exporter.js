/**
 * Exporter - Generates JSON and HTML/CSS output
 */
class Exporter {
  /**
   * Generate JSON configuration
   */
  static generateJSON(state) {
    const config = {
      container: {
        width: state.containerWidth,
        height: 'auto'
      },
      background: this.generateBackgroundConfig(state.background),
      layers: state.layers.map(layer => ({
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

    return JSON.stringify(config, null, 2);
  }

  /**
   * Generate background configuration
   */
  static generateBackgroundConfig(bg) {
    const config = { type: bg.type };

    switch (bg.type) {
      case 'color':
        config.color = bg.color;
        break;
      case 'gradient':
        config.gradient = `linear-gradient(${bg.gradientDirection}, ${bg.gradientStart}, ${bg.gradientEnd})`;
        config.gradientStart = bg.gradientStart;
        config.gradientEnd = bg.gradientEnd;
        config.gradientDirection = bg.gradientDirection;
        break;
      case 'image':
      case 'tile':
        config.src = bg.imageFilename || '';
        config.sizing = bg.sizing;
        break;
    }

    return config;
  }

  /**
   * Generate HTML/CSS code
   */
  static generateHTML(state) {
    const bgStyles = this.generateBackgroundCSS(state.background);
    const layerHTML = state.layers
      .sort((a, b) => a.zIndex - b.zIndex)
      .map(layer => this.generateLayerHTML(layer))
      .join('\n      ');

    const layerCSS = state.layers
      .map(layer => this.generateLayerCSS(layer))
      .join('\n\n');

    return `<!-- Asset Container Component -->
<div class="asset-container" style="width: ${state.containerWidth}px;">
  <!-- Background -->
  <div class="asset-container__background"></div>
  
  <!-- Layers -->
  <div class="asset-container__layers">
    ${layerHTML || '<!-- Add your image layers here -->'}
  </div>
</div>

<style>
.asset-container {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  min-height: 400px;
}

.asset-container__background {
  position: absolute;
  inset: 0;
  z-index: 0;
  ${bgStyles}
}

.asset-container__layers {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
}

/* Layer base styles */
.asset-container__layer {
  position: absolute;
  transition: transform 0.3s ease;
}

.asset-container__layer img {
  display: block;
  max-width: 100%;
}

${layerCSS}
</style>

<!-- 
ANIMATION SPEEDS:
00 Background: no movement
01 Bottom: 5px up
02 Mid: 10px up
03 Top: 15px up

Example hover effect:
.asset-container:hover [data-anim-speed="1"] { transform: translateY(-5px); }
.asset-container:hover [data-anim-speed="2"] { transform: translateY(-10px); }
.asset-container:hover [data-anim-speed="3"] { transform: translateY(-15px); }
-->`;
  }

  /**
   * Generate background CSS
   */
  static generateBackgroundCSS(bg) {
    switch (bg.type) {
      case 'color':
        return `background: ${bg.color};`;
      case 'gradient':
        return `background: linear-gradient(${bg.gradientDirection}, ${bg.gradientStart}, ${bg.gradientEnd});`;
      case 'image':
        return `background: url('${bg.imageFilename || 'your-image.png'}');
  background-size: ${bg.sizing === 'fill' ? 'cover' : 'contain'};
  background-position: center;
  background-repeat: no-repeat;`;
      case 'tile':
        return `background: url('${bg.imageFilename || 'your-pattern.png'}');
  background-size: auto;
  background-repeat: repeat;`;
      default:
        return 'background: #f5f5f5;';
    }
  }

  /**
   * Generate HTML for a single layer
   */
  static generateLayerHTML(layer) {
    return `<div class="asset-container__layer asset-container__layer--${layer.id}" data-anim-speed="${layer.animSpeed ?? 2}">
      <img src="${layer.filename}" alt="">
    </div>`;
  }

  /**
   * Generate CSS for a single layer
   */
  static generateLayerCSS(layer) {
    const styles = [];
    
    // Z-index
    styles.push(`z-index: ${layer.zIndex};`);

    // X positioning
    switch (layer.xAlign) {
      case 'left':
        styles.push(`left: ${layer.xPosition}px;`);
        break;
      case 'right':
        styles.push(`right: ${layer.xPosition}px;`);
        break;
      case 'left+right':
        styles.push(`left: ${layer.xPosition}px;`);
        styles.push(`right: ${layer.xPosition}px;`);
        break;
      case 'center':
        styles.push(`left: 50%;`);
        styles.push(`transform: translateX(-50%)${layer.yAlign === 'center' ? ' translateY(-50%)' : ''};`);
        if (layer.xPosition !== 0) {
          styles.push(`margin-left: ${layer.xPosition}px;`);
        }
        break;
      case 'scale':
        styles.push(`left: 10%;`);
        styles.push(`right: 10%;`);
        break;
    }

    // Y positioning
    switch (layer.yAlign) {
      case 'top':
        styles.push(`top: ${layer.yPosition}px;`);
        break;
      case 'bottom':
        styles.push(`bottom: ${layer.yPosition}px;`);
        break;
      case 'top+bottom':
        styles.push(`top: ${layer.yPosition}px;`);
        styles.push(`bottom: ${layer.yPosition}px;`);
        break;
      case 'center':
        styles.push(`top: 50%;`);
        if (layer.xAlign !== 'center') {
          styles.push(`transform: translateY(-50%);`);
        }
        if (layer.yPosition !== 0) {
          styles.push(`margin-top: ${layer.yPosition}px;`);
        }
        break;
      case 'scale':
        styles.push(`top: 10%;`);
        styles.push(`bottom: 10%;`);
        break;
    }

    // Dimensions
    const imgStyles = [];
    if (layer.width && layer.width !== 'auto') {
      imgStyles.push(`width: ${layer.width}px;`);
    }
    if (layer.height && layer.height !== 'auto') {
      imgStyles.push(`height: ${layer.height}px;`);
    }
    if (layer.xAlign === 'left+right') {
      imgStyles.push(`width: 100%;`);
    }
    if (layer.yAlign === 'top+bottom') {
      imgStyles.push(`height: 100%;`);
      imgStyles.push(`object-fit: ${layer.aspectRatioLocked ? 'contain' : 'fill'};`);
    }

    let css = `.asset-container__layer--${layer.id} {
  ${styles.join('\n  ')}
}`;

    if (imgStyles.length > 0) {
      css += `

.asset-container__layer--${layer.id} img {
  ${imgStyles.join('\n  ')}
}`;
    }

    return css;
  }

  /**
   * Download JSON file
   */
  static downloadJSON(state, filename = 'asset-container-config.json') {
    const json = this.generateJSON(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch (e) {
        document.body.removeChild(textarea);
        return false;
      }
    }
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.Exporter = Exporter;
}
