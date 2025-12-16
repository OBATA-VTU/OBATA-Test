import { ApiConfig, ApiResponse } from '../types';

export const executeApiRequest = async (config: ApiConfig): Promise<ApiResponse> => {
  const startTime = performance.now();
  
  // Construct headers object
  const headers: Record<string, string> = {};
  config.headers.forEach(h => {
    if (h.key && h.value) {
      headers[h.key] = h.value;
    }
  });

  // Ensure Content-Type is set for POST/PUT if body exists
  if ((config.method === 'POST' || config.method === 'PUT') && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const options: RequestInit = {
    method: config.method,
    headers: headers,
    // Add mode: 'cors' explicitly, though it is default. 
    // If the external API does not support CORS, this request will fail in the browser.
    mode: 'cors', 
  };

  if (config.method !== 'GET' && config.body) {
    try {
      // Validate JSON
      JSON.parse(config.body);
      options.body = config.body;
    } catch (e) {
      return {
        success: false,
        status: 0,
        statusText: 'Validation Error',
        data: { error: 'Invalid JSON in request body' },
        headers: {},
        duration: 0,
      };
    }
  }

  try {
    const res = await fetch(config.url, options);
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    const responseHeaders: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      success: res.ok,
      status: res.status,
      statusText: res.statusText,
      data: data,
      headers: responseHeaders,
      duration: duration,
    };

  } catch (error: any) {
    const endTime = performance.now();
    return {
      success: false,
      status: 0,
      statusText: 'Network Error',
      data: { 
        error: error.message, 
        suggestion: 'This might be a CORS issue. If calling from a browser, the API must support Cross-Origin requests. Try using a CORS proxy or checking the API settings.' 
      },
      headers: {},
      duration: Math.round(endTime - startTime),
      error: error.message
    };
  }
};