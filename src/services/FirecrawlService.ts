import FirecrawlApp from '@mendable/firecrawl-js';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  extension?: string;
  children?: FileItem[];
  content?: string;
  path: string;
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key tersimpan berhasil');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static clearApiKey(): void {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
    this.firecrawlApp = null;
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key dengan Firecrawl API');
      const testApp = new FirecrawlApp({ apiKey });
      // Test dengan scrape sederhana
      const testResponse = await testApp.scrape('https://example.com');
      return !!testResponse && typeof testResponse === 'object';
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async scrapeWebsite(url: string): Promise<{ 
    success: boolean; 
    error?: string; 
    data?: any;
    html?: string;
    markdown?: string;
    fileStructure?: FileItem[];
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key tidak ditemukan' };
    }

    try {
      console.log('Melakukan scraping dengan Firecrawl API');
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      // Scrape HTML dan markdown
      const scrapeResponse = await this.firecrawlApp.scrape(url, {
        formats: ['markdown', 'html'],
        includeTags: ['title', 'meta', 'link', 'script'],
        excludeTags: [],
        onlyMainContent: false
      });

      if (!scrapeResponse) {
        return { 
          success: false, 
          error: 'Gagal melakukan scraping website' 
        };
      }

      // Convert response to our expected format
      const responseData = scrapeResponse as any;
      const html = responseData.html || responseData.content || '';
      const markdown = responseData.markdown || '';

      // Generate struktur file berdasarkan konten yang di-scrape
      const fileStructure = this.generateFileStructure({ html, markdown }, url);

      return { 
        success: true,
        data: responseData,
        html: html,
        markdown: markdown,
        fileStructure: fileStructure
      };
    } catch (error) {
      console.error('Error selama scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Gagal terhubung ke Firecrawl API' 
      };
    }
  }

  static async crawlWebsite(url: string): Promise<{
    success: boolean;
    error?: string;
    data?: any;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key tidak ditemukan' };
    }

    try {
      console.log('Melakukan crawling website dengan Firecrawl API');
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const crawlResponse = await this.firecrawlApp.crawl(url, {
        limit: 50,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta', 'link', 'script', 'style'],
          onlyMainContent: false
        }
      });

      if (!crawlResponse) {
        return { 
          success: false, 
          error: 'Gagal melakukan crawl website' 
        };
      }

      console.log('Crawl berhasil:', crawlResponse);
      return { 
        success: true,
        data: crawlResponse
      };
    } catch (error) {
      console.error('Error selama crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Gagal terhubung ke Firecrawl API' 
      };
    }
  }

  private static generateFileStructure(scrapedData: any, url: string): FileItem[] {
    const structure: FileItem[] = [];
    
    // Buat file HTML utama
    if (scrapedData.html) {
      structure.push({
        name: 'index.html',
        type: 'file',
        size: `${Math.round(scrapedData.html.length / 1024)} KB`,
        extension: 'html',
        path: '/index.html',
        content: scrapedData.html
      });
    }

    // Clean HTML for extraction
    const htmlContent = scrapedData.html || '';

    // Ekstrak CSS dan JS dari HTML
    const cssContent = this.extractCSSFromHTML(htmlContent);
    const jsContent = this.extractJSFromHTML(htmlContent);

    if (cssContent.length > 0) {
      const cssFolder: FileItem = {
        name: 'css',
        type: 'folder',
        path: '/css',
        children: cssContent.map((css, index) => ({
          name: `style${index > 0 ? index + 1 : ''}.css`,
          type: 'file' as const,
          size: `${Math.round(css.length / 1024)} KB`,
          extension: 'css',
          path: `/css/style${index > 0 ? index + 1 : ''}.css`,
          content: css
        }))
      };
      structure.push(cssFolder);
    }

    if (jsContent.length > 0) {
      const jsFolder: FileItem = {
        name: 'js',
        type: 'folder',
        path: '/js',
        children: jsContent.map((js, index) => ({
          name: `script${index > 0 ? index + 1 : ''}.js`,
          type: 'file' as const,
          size: `${Math.round(js.length / 1024)} KB`,
          extension: 'js',
          path: `/js/script${index > 0 ? index + 1 : ''}.js`,
          content: js
        }))
      };
      structure.push(jsFolder);
    }

    // Tambahkan file markdown jika ada
    if (scrapedData.markdown) {
      structure.push({
        name: 'README.md',
        type: 'file',
        size: `${Math.round(scrapedData.markdown.length / 1024)} KB`,
        extension: 'md',
        path: '/README.md',
        content: `# Website Content from ${url}\n\n${scrapedData.markdown}`
      });
    }

    // Jika tidak ada file yang diekstrak, buat struktur minimal
    if (structure.length === 0) {
      structure.push({
        name: 'scraped-content.txt',
        type: 'file',
        size: '1 KB',
        extension: 'txt',
        path: '/scraped-content.txt',
        content: `Website scraped from: ${url}\n\nContent extracted successfully but no specific files detected.`
      });
    }

    return structure;
  }

  private static extractCSSFromHTML(html: string): string[] {
    if (!html) return [];
    
    const cssContents: string[] = [];
    
    // Ekstrak inline styles
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatches) {
      styleMatches.forEach(match => {
        const content = match.replace(/<\/?style[^>]*>/gi, '').trim();
        if (content) {
          cssContents.push(content);
        }
      });
    }

    return cssContents;
  }

  private static extractJSFromHTML(html: string): string[] {
    if (!html) return [];
    
    const jsContents: string[] = [];
    
    // Ekstrak inline scripts
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatches) {
      scriptMatches.forEach(match => {
        // Skip external scripts
        if (match.includes('src=')) return;
        
        const content = match.replace(/<\/?script[^>]*>/gi, '').trim();
        if (content) {
          jsContents.push(content);
        }
      });
    }

    return jsContents;
  }
}