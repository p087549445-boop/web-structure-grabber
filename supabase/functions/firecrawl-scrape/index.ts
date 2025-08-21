import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  extension?: string;
  children?: FileItem[];
  content?: string;
  path: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY tidak ditemukan di environment');
    }

    if (!url) {
      throw new Error('URL diperlukan');
    }

    console.log('Melakukan scraping untuk URL:', url);

    // Call Firecrawl API untuk scraping
    const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'img'],
        excludeTags: ['script', 'style'],
        waitFor: 0,
        timeout: 30000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error:', response.status, errorText);
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Scraping berhasil:', data.success);

    if (!data.success) {
      throw new Error(data.error || 'Scraping gagal');
    }

    // Generate file structure from scraped data
    const fileStructure = generateFileStructure(data.data, url);

    return new Response(JSON.stringify({ 
      success: true,
      data: data.data,
      html: data.data.html || '',
      markdown: data.data.markdown || '',
      fileStructure: fileStructure
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in firecrawl-scrape function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFileStructure(scrapedData: any, url: string): FileItem[] {
  const structure: FileItem[] = [];
  
  // Main HTML file
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

  // Markdown file
  if (scrapedData.markdown) {
    structure.push({
      name: 'content.md',
      type: 'file',
      size: `${Math.round(scrapedData.markdown.length / 1024)} KB`,
      extension: 'md',
      path: '/content.md',
      content: scrapedData.markdown
    });
  }

  // Metadata as JSON
  const metadata = {
    url: url,
    title: scrapedData.metadata?.title || '',
    description: scrapedData.metadata?.description || '',
    scrapedAt: new Date().toISOString(),
    sourceURL: scrapedData.metadata?.sourceURL || url
  };

  structure.push({
    name: 'metadata.json',
    type: 'file',
    size: '1 KB',
    extension: 'json',
    path: '/metadata.json',
    content: JSON.stringify(metadata, null, 2)
  });

  return structure;
}