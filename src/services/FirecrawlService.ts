// Real Firecrawl Service using Supabase Edge Functions
import { supabase } from "@/integrations/supabase/client";

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

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('API key tersimpan berhasil');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static clearApiKey(): void {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key dengan Firecrawl API asli');
      
      // Test dengan scraping sederhana
      const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { url: 'https://example.com' }
      });

      if (error) {
        console.error('Error testing API key:', error);
        return false;
      }

      return data?.success === true;
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
      return { success: false, error: 'API key tidak ditemukan. Silakan atur API key Firecrawl Anda terlebih dahulu.' };
    }

    try {
      console.log('Melakukan scraping dengan Firecrawl API asli untuk URL:', url);
      
      // Call Supabase Edge Function untuk scraping
      const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
        body: { url }
      });

      if (error) {
        console.error('Error calling firecrawl-scrape function:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Scraping gagal');
      }

      console.log('Scraping berhasil menggunakan Firecrawl API');
      return data;
    } catch (error) {
      console.error('Error selama scraping:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Gagal melakukan scraping website' 
      };
    }
  }

  static async crawlWebsite(url: string): Promise<{
    success: boolean;
    error?: string;
    data?: any;
    jobId?: string;
  }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key tidak ditemukan. Silakan atur API key Firecrawl Anda terlebih dahulu.' };
    }

    try {
      console.log('Memulai crawling website dengan Firecrawl API asli untuk URL:', url);
      
      // Call Supabase Edge Function untuk crawling
      const { data, error } = await supabase.functions.invoke('firecrawl-crawl', {
        body: { url }
      });

      if (error) {
        console.error('Error calling firecrawl-crawl function:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Crawling gagal');
      }

      console.log('Crawling dimulai dengan job ID:', data.jobId);
      return data;
    } catch (error) {
      console.error('Error selama crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Gagal melakukan crawl website' 
      };
    }
  }

  static async getCrawlStatus(jobId: string): Promise<{
    success: boolean;
    error?: string;
    status?: string;
    completed?: number;
    total?: number;
    creditsUsed?: number;
    data?: any[];
  }> {
    try {
      console.log('Mengecek status crawling untuk job:', jobId);
      
      // Call Supabase Edge Function untuk status check
      const { data, error } = await supabase.functions.invoke('firecrawl-status', {
        body: { jobId }
      });

      if (error) {
        console.error('Error calling firecrawl-status function:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error mengecek status crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Gagal mengecek status crawl' 
      };
    }
  }

  private static getDemoData(url: string) {
    const demoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scraped from ${url}</title>
    <style>
    body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }
    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 2rem;
    }
    .nav {
        display: flex;
        gap: 2rem;
        justify-content: center;
        margin-bottom: 2rem;
    }
    .nav a {
        color: #667eea;
        text-decoration: none;
        font-weight: bold;
    }
    .content {
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    .footer {
        text-align: center;
        padding: 1rem;
        background: #333;
        color: white;
        border-radius: 10px;
    }
    </style>
</head>
<body>
    <div class="header">
        <h1>Website from ${url}</h1>
        <p>Content scraped successfully</p>
    </div>
    
    <nav class="nav">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#services">Services</a>
        <a href="#contact">Contact</a>
    </nav>
    
    <main class="content">
        <h2>Welcome to Our Website</h2>
        <p>This is a demonstration of scraped content from ${url}.</p>
        <p>The scraper successfully extracted the structure and content of the website.</p>
        
        <script>
        // Interactive demo script
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Website loaded from ${url}');
            
            // Add click handlers
            document.querySelectorAll('.nav a').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    alert('Navigating to: ' + this.textContent);
                });
            });
        });
        
        function showMessage() {
            alert('Hello from scraped website!');
        }
        </script>
        
        <button onclick="showMessage()">Click Me</button>
    </main>
    
    <footer class="footer">
        <p>&copy; 2024 Scraped from ${url}. Content extracted successfully.</p>
    </footer>
</body>
</html>`;

    const markdown = this.htmlToMarkdown(demoHtml, url);
    const fileStructure = this.generateFileStructure({ html: demoHtml, markdown }, url);

    return { 
      success: true,
      data: { html: demoHtml, markdown },
      html: demoHtml,
      markdown: markdown,
      fileStructure: fileStructure
    };
  }

  private static htmlToMarkdown(html: string, url: string): string {
    if (!html) return '';
    
    // Basic HTML to Markdown conversion
    let markdown = `# Content from ${url}\n\n`;
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      markdown += `## ${titleMatch[1]}\n\n`;
    }
    
    // Extract headings
    const headings = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi);
    if (headings) {
      headings.forEach(heading => {
        const text = heading.replace(/<[^>]+>/g, '');
        const level = heading.match(/h([1-6])/i)?.[1] || '1';
        markdown += `${'#'.repeat(Number(level))} ${text}\n\n`;
      });
    }
    
    // Extract paragraphs
    const paragraphs = html.match(/<p[^>]*>(.*?)<\/p>/gi);
    if (paragraphs) {
      paragraphs.forEach(p => {
        const text = p.replace(/<[^>]+>/g, '').trim();
        if (text) {
          markdown += `${text}\n\n`;
        }
      });
    }
    
    markdown += `\n---\n*Content scraped from: ${url}*`;
    return markdown;
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
        content: scrapedData.markdown
      });
    }

    // Tambahkan file konfigurasi
    structure.push({
      name: 'package.json',
      type: 'file',
      size: '1 KB',
      extension: 'json',
      path: '/package.json',
      content: JSON.stringify({
        name: 'scraped-website',
        version: '1.0.0',
        description: `Website scraped from ${url}`,
        main: 'index.html',
        scripts: {
          start: 'http-server .',
          build: 'echo \"Static site ready\"'
        },
        keywords: ['scraped', 'website', 'html'],
        author: 'Website Scraper',
        license: 'MIT'
      }, null, 2)
    });

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