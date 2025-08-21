import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Memulai crawling untuk URL:', url);

    // Call Firecrawl API untuk crawling
    const response = await fetch('https://api.firecrawl.dev/v0/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        crawlerOptions: {
          maxDepth: 2,
          limit: 50,
          allowedDomains: [new URL(url).hostname]
        },
        pageOptions: {
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a'],
          excludeTags: ['script', 'style'],
          waitFor: 0
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firecrawl API error:', response.status, errorText);
      throw new Error(`Firecrawl API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Crawling response:', data.success, data.jobId);

    if (!data.success) {
      throw new Error(data.error || 'Crawling gagal');
    }

    // Return job ID untuk status checking
    return new Response(JSON.stringify({ 
      success: true,
      jobId: data.jobId,
      message: 'Crawling dimulai, gunakan jobId untuk cek status'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in firecrawl-crawl function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});