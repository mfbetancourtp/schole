import FontFaceObserver from 'fontfaceobserver';
import type { EditorCore, IPlugin, FontConfig } from '../core';

/**
 * Plugin para gestionar fuentes personalizadas
 */
export class FontPlugin implements IPlugin {
  public name = 'FontPlugin';
  private editor: EditorCore | null = null;
  private loadedFonts: Set<string> = new Set();
  private availableFonts: FontConfig[] = [];

  initialize(editor: EditorCore): void {
    this.editor = editor;
    this.initializeDefaultFonts();
  }

  destroy(): void {
    this.editor = null;
    this.loadedFonts.clear();
  }

  /**
   * Inicializar fuentes por defecto
   */
  private initializeDefaultFonts(): void {
    this.availableFonts = [
      // Handwriting / Script
      {
        name: 'Dancing Script',
        family: 'Dancing Script',
        category: 'handwriting',
        url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
      },
      {
        name: 'Great Vibes',
        family: 'Great Vibes',
        category: 'handwriting',
        url: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
      },
      {
        name: 'Pacifico',
        family: 'Pacifico',
        category: 'handwriting',
        url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
      },
      {
        name: 'Satisfy',
        family: 'Satisfy',
        category: 'handwriting',
        url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
      },
      {
        name: 'Allura',
        family: 'Allura',
        category: 'handwriting',
        url: 'https://fonts.googleapis.com/css2?family=Allura&display=swap',
      },
      {
        name: 'Alex Brush',
        family: 'Alex Brush',
        category: 'handwriting',
        url: 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap',
      },
      {
        name: 'Pinyon Script',
        family: 'Pinyon Script',
        category: 'handwriting',
        url: 'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap',
      },

      // Serif
      {
        name: 'Playfair Display',
        family: 'Playfair Display',
        category: 'serif',
        url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap',
      },
      {
        name: 'Merriweather',
        family: 'Merriweather',
        category: 'serif',
        url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap',
      },
      {
        name: 'Lora',
        family: 'Lora',
        category: 'serif',
        url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
      },
      {
        name: 'Cormorant Garamond',
        family: 'Cormorant Garamond',
        category: 'serif',
        url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&display=swap',
      },

      // Sans-serif
      {
        name: 'Roboto',
        family: 'Roboto',
        category: 'sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700;900&display=swap',
      },
      {
        name: 'Open Sans',
        family: 'Open Sans',
        category: 'sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700;800&display=swap',
      },
      {
        name: 'Montserrat',
        family: 'Montserrat',
        category: 'sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap',
      },
      {
        name: 'Raleway',
        family: 'Raleway',
        category: 'sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700;900&display=swap',
      },
      {
        name: 'Poppins',
        family: 'Poppins',
        category: 'sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&display=swap',
      },
      {
        name: 'Oswald',
        family: 'Oswald',
        category: 'sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap',
      },

      // Display
      {
        name: 'Bebas Neue',
        family: 'Bebas Neue',
        category: 'display',
        url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
      },
      {
        name: 'Cinzel',
        family: 'Cinzel',
        category: 'display',
        url: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap',
      },
      {
        name: 'Abril Fatface',
        family: 'Abril Fatface',
        category: 'display',
        url: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap',
      },

      // Fuentes del sistema
      { name: 'Arial', family: 'Arial, sans-serif', category: 'sans-serif' },
      {
        name: 'Times New Roman',
        family: 'Times New Roman, serif',
        category: 'serif',
      },
      { name: 'Georgia', family: 'Georgia, serif', category: 'serif' },
    ];
  }

  /**
   * Cargar una fuente
   */
  public async loadFont(fontConfig: FontConfig): Promise<void> {
    // Si ya está cargada, no hacer nada
    if (this.loadedFonts.has(fontConfig.family)) {
      return;
    }

    // Si tiene URL, cargar desde Google Fonts
    if (fontConfig.url) {
      // Añadir link al head
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontConfig.url;
      document.head.appendChild(link);

      // Esperar a que la fuente esté lista
      const font = new FontFaceObserver(fontConfig.family);
      try {
        await font.load(null, 5000); // Timeout de 5 segundos
        this.loadedFonts.add(fontConfig.family);
      } catch (error) {
        console.error(`Error loading font ${fontConfig.family}:`, error);
        throw error;
      }
    } else {
      // Fuente del sistema, marcar como cargada
      this.loadedFonts.add(fontConfig.family);
    }
  }

  /**
   * Cargar múltiples fuentes
   */
  public async loadFonts(fontConfigs: FontConfig[]): Promise<void> {
    const promises = fontConfigs.map((config) => this.loadFont(config));
    await Promise.all(promises);
  }

  /**
   * Cargar todas las fuentes disponibles
   */
  public async loadAllFonts(): Promise<void> {
    await this.loadFonts(this.availableFonts);
  }

  /**
   * Obtener lista de fuentes disponibles
   */
  public getAvailableFonts(): FontConfig[] {
    return [...this.availableFonts];
  }

  /**
   * Obtener fuentes por categoría
   */
  public getFontsByCategory(category: FontConfig['category']): FontConfig[] {
    return this.availableFonts.filter((font) => font.category === category);
  }

  /**
   * Añadir fuente personalizada
   */
  public addCustomFont(fontConfig: FontConfig): void {
    this.availableFonts.push(fontConfig);
  }

  /**
   * Verificar si una fuente está cargada
   */
  public isFontLoaded(family: string): boolean {
    return this.loadedFonts.has(family);
  }

  /**
   * Aplicar fuente al objeto seleccionado
   */
  public async applyFontToSelected(fontFamily: string): Promise<void> {
    if (!this.editor) return;

    const activeObject = this.editor.getActiveObject();
    if (!activeObject || (activeObject.type !== 'i-text' && activeObject.type !== 'text' && activeObject.type !== 'textbox')) {
      return;
    }

    // Buscar configuración de fuente
    const fontConfig = this.availableFonts.find((f) => f.family === fontFamily);
    if (fontConfig && !this.isFontLoaded(fontFamily)) {
      await this.loadFont(fontConfig);
    }

    // Aplicar fuente
    (activeObject as any).set('fontFamily', fontFamily);
    this.editor.canvas.renderAll();
  }
}
