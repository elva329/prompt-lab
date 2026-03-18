/**
 * AI API Integration for prompt evaluation
 * Supports OpenAI, Anthropic, or other LLM providers
 */

export type AIResponse = {
  response: string;
  tokensUsed: number;
  responseTimeMs: number;
  model: string;
};

export type AIProvider = 'openai' | 'anthropic' | 'custom';

export interface AIApiConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  customApiUrl?: string; // For custom API endpoints
}

/**
 * Send prompt to AI and get response
 */
export async function sendPromptToAI(
  promptText: string,
  config: AIApiConfig
): Promise<AIResponse> {
  const startTime = performance.now();

  try {
    if (config.provider === 'openai') {
      return await callOpenAI(promptText, config);
    } else if (config.provider === 'anthropic') {
      return await callAnthropic(promptText, config);
    } else if (config.provider === 'custom') {
      return await callCustomAPI(promptText, config);
    }

    throw new Error(`Unsupported AI provider: ${config.provider}`);
  } catch (error) {
    const endTime = performance.now();
    console.error('AI API Error:', error);
    
    throw new Error(
      `Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * OpenAI API Integration
 */
async function callOpenAI(
  promptText: string,
  config: AIApiConfig
): Promise<AIResponse> {
  const startTime = performance.now();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: promptText }],
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API returned ${response.status}`);
  }

  const data = await response.json();
  const endTime = performance.now();

  const responseContent = data.choices[0]?.message?.content || '';
  
  // Get actual tokens or estimate if missing
  let tokens = data.usage?.total_tokens;
  if (!tokens) {
    // Fallback estimation: ~4 chars per token for prompt + response
    tokens = Math.ceil((promptText.length + responseContent.length) / 4);
  }

  return {
    response: responseContent,
    tokensUsed: tokens,
    responseTimeMs: Math.round(endTime - startTime),
    model: data.model || config.model,
  };
}

/**
 * Anthropic (Claude) API Integration
 */
async function callAnthropic(
  promptText: string,
  config: AIApiConfig
): Promise<AIResponse> {
  const startTime = performance.now();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-sonnet-20240229',
      max_tokens: config.maxTokens ?? 1024,
      messages: [{ role: 'user', content: promptText }],
      temperature: config.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API returned ${response.status}`);
  }

  const data = await response.json();
  const endTime = performance.now();

  const responseContent = data.content[0]?.text || '';
  
  // Get actual tokens or estimate if missing
  let tokens = 0;
  if (data.usage) {
    tokens = (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0);
  }
  
  if (!tokens) {
    // Fallback estimation: ~4 chars per token for prompt + response
    tokens = Math.ceil((promptText.length + responseContent.length) / 4);
  }

  return {
    response: responseContent,
    tokensUsed: tokens,
    responseTimeMs: Math.round(endTime - startTime),
    model: data.model || config.model,
  };
}

/**
 * Custom API Integration (for compatible OpenAI-like endpoints)
 * Works with HKBU GenAI and other OpenAI-compatible APIs
 * Routes through server proxy to avoid CORS issues
 */
async function callCustomAPI(
  promptText: string,
  config: AIApiConfig
): Promise<AIResponse> {
  const startTime = performance.now();
  
  // Use local proxy to avoid CORS issues
  const proxyUrl = '/api/ai/chat';
  
  const requestBody = {
    model: config.model || 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: promptText }],
    temperature: config.temperature ?? 0.7,
    max_tokens: config.maxTokens ?? 1000,
  };

  console.log('Sending request via proxy:', proxyUrl);
  console.log('Request body:', requestBody);

  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Proxy Error Response:', errorText);
    
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 200)}`);
    }
    
    throw new Error(
      errorData.error?.message || 
      errorData.message || 
      `Server returned ${response.status}`
    );
  }

  const responseText = await response.text();
  console.log('Proxy Response:', responseText.substring(0, 500));
  
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (error) {
    throw new Error('Invalid JSON response from server');
  }
  
  const endTime = performance.now();

  // Handle various response formats
  let responseContent = '';
  
  // Standard OpenAI format
  if (data.choices && data.choices[0]?.message?.content) {
    responseContent = data.choices[0].message.content;
  }
  // Alternative format: direct text field
  else if (data.text) {
    responseContent = data.text;
  }
  // Alternative format: content field
  else if (data.content) {
    responseContent = data.content;
  }
  // Alternative format: response field
  else if (data.response) {
    responseContent = data.response;
  }
  // Check if the whole response is a string
  else if (typeof data === 'string') {
    responseContent = data;
  }
  else {
    console.error('Unexpected response format:', data);
    throw new Error('Could not find response content in API response');
  }

  // Get actual tokens or estimate if missing
  let tokens = data.usage?.total_tokens || data.tokens || 0;
  if (!tokens) {
    // Fallback estimation: ~4 chars per token for prompt + response
    tokens = Math.ceil((promptText.length + responseContent.length) / 4);
  }

  return {
    response: responseContent,
    tokensUsed: tokens,
    responseTimeMs: Math.round(endTime - startTime),
    model: data.model || config.model,
  };
}

/**
 * Get default API configuration from environment variables
 */
export function getDefaultConfig(): AIApiConfig {
  const customKey = import.meta.env.VITE_CUSTOM_API_KEY;
  const customBaseUrl = import.meta.env.VITE_CUSTOM_BASE_URL;
  const customModel = import.meta.env.VITE_CUSTOM_MODEL;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

  console.log('Loading API configuration...');
  console.log('Custom API configured:', !!customKey && !!customBaseUrl);
  console.log('Custom model:', customModel);
  console.log('OpenAI API configured:', !!openaiKey);

  // Prioritize custom API (HKBU GenAI) - uses server proxy to avoid CORS
  if (customKey && customBaseUrl) {
    console.log('Using custom API via server proxy');
    console.log('Model:', customModel || 'gpt-5-mini');
    return {
      provider: 'custom',
      apiKey: customKey, // Not used by frontend, kept for reference
      model: customModel || 'gpt-5-mini',
      temperature: 0.7,
      maxTokens: 1000,
      customApiUrl: customBaseUrl, // Not used by frontend, kept for reference
    };
  }

  // Fall back to OpenAI if configured
  if (openaiKey && openaiKey !== 'sk-your-actual-openai-key-here') {
    console.log('Using OpenAI API');
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
    };
  }

  throw new Error('No API key configured. Please set VITE_CUSTOM_API_KEY and VITE_CUSTOM_BASE_URL in .env file');
}

/**
 * Batch process multiple prompts
 */
export async function runBatchExperiment(
  prompts: string[],
  config: AIApiConfig,
  onProgress?: (current: number, total: number) => void
): Promise<AIResponse[]> {
  const results: AIResponse[] = [];

  for (let i = 0; i < prompts.length; i++) {
    const response = await sendPromptToAI(prompts[i], config);
    results.push(response);

    if (onProgress) {
      onProgress(i + 1, prompts.length);
    }

    // Add delay to avoid rate limiting
    if (i < prompts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
