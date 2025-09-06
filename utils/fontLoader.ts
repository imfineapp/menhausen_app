/**
 * Font Loading Utility for iOS Safari
 * Ensures proper font loading and fallback handling on Apple devices
 */

export class FontLoader {
  private static instance: FontLoader;
  private fontsLoaded = false;
  private fontLoadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader();
    }
    return FontLoader.instance;
  }

  /**
   * Preloads fonts for iOS Safari compatibility
   */
  async preloadFonts(): Promise<void> {
    if (this.fontsLoaded) return;
    
    if (this.fontLoadPromise) {
      return this.fontLoadPromise;
    }

    this.fontLoadPromise = this.loadFonts();
    return this.fontLoadPromise;
  }

  private async loadFonts(): Promise<void> {
    try {
      // Check if we're on iOS Safari
      const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                         /Safari/.test(navigator.userAgent) && 
                         !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);

      if (isIOSSafari) {
        // Force font loading on iOS Safari
        await this.forceFontLoad();
      }

      // Wait for Google Fonts to load
      await this.waitForGoogleFonts();
      
      this.fontsLoaded = true;
    } catch (error) {
      console.warn('Font loading failed, using fallback fonts:', error);
      this.fontsLoaded = true; // Still mark as loaded to prevent retries
    }
  }

  private async forceFontLoad(): Promise<void> {
    // Create hidden elements with fonts to force loading
    const testElements = [
      { font: 'Roboto Slab', text: 'Test Heading' },
      { font: 'PT Sans', text: 'Test Body Text' }
    ];

    const promises = testElements.map(({ font, text }) => {
      return new Promise<void>((resolve) => {
        const element = document.createElement('div');
        element.style.fontFamily = font;
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '-9999px';
        element.style.visibility = 'hidden';
        element.textContent = text;
        
        document.body.appendChild(element);
        
        // Force reflow
        void element.offsetHeight;
        
        // Check if font is loaded
        const isLoaded = this.isFontLoaded(font, text);
        
        if (isLoaded) {
          document.body.removeChild(element);
          resolve();
        } else {
          // Fallback timeout
          setTimeout(() => {
            document.body.removeChild(element);
            resolve();
          }, 1000);
        }
      });
    });

    await Promise.all(promises);
  }

  private isFontLoaded(fontFamily: string, testText: string): boolean {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return false;

    // Test with fallback font
    context.font = '16px monospace';
    const fallbackWidth = context.measureText(testText).width;

    // Test with target font
    context.font = `16px ${fontFamily}, monospace`;
    const targetWidth = context.measureText(testText).width;

    return Math.abs(targetWidth - fallbackWidth) > 1;
  }

  private async waitForGoogleFonts(): Promise<void> {
    return new Promise((resolve) => {
      if ('fonts' in document) {
        // Modern browsers with Font Loading API
        Promise.all([
          document.fonts.load('400 16px "Roboto Slab"'),
          document.fonts.load('400 16px "PT Sans"'),
          document.fonts.load('500 16px "PT Sans"')
        ]).then(() => {
          resolve();
        }).catch(() => {
          resolve(); // Fallback on error
        });
      } else {
        // Fallback for older browsers
        setTimeout(resolve, 1000);
      }
    });
  }

  /**
   * Applies font classes to ensure proper rendering
   */
  applyFontClasses(): void {
    // Apply font classes to common elements
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headingElements.forEach(el => {
      el.classList.add('font-heading');
    });

    const textElements = document.querySelectorAll('p, span, div, button, input, label');
    textElements.forEach(el => {
      el.classList.add('font-sans');
    });
  }

  /**
   * Initializes font loading for the application
   */
  async initialize(): Promise<void> {
    await this.preloadFonts();
    this.applyFontClasses();
  }
}

// Export singleton instance
export const fontLoader = FontLoader.getInstance();

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fontLoader.initialize();
    });
  } else {
    fontLoader.initialize();
  }
}
