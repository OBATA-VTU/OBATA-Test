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

  const isFormData = config.body instanceof FormData;

  // Ensure Content-Type is set for JSON if not FormData and not GET
  if ((config.method === 'POST' || config.method === 'PUT') && !headers['Content-Type'] && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const options: RequestInit = {
    method: config.method,
    headers: headers,
    mode: 'cors', 
  };

  if (config.method !== 'GET' && config.body) {
    if (isFormData) {
      // Browser automatically sets Content-Type with boundary for FormData
      // We explicitly ensure we don't override it with application/json
      if (headers['Content-Type'] === 'application/json') {
        delete (options.headers as Record<string,string>)['Content-Type'];
      }
      options.body = config.body as FormData;
    } else {
      const bodyStr = config.body as string;
      // Only validate JSON if we are claiming to send JSON
      if (headers['Content-Type']?.includes('application/json')) {
        try {
          JSON.parse(bodyStr);
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
      options.body = bodyStr;
    }
  }

  try {
    // Handle CORS Proxy
    const targetUrl = config.useProxy 
      ? `https://corsproxy.io/?${encodeURIComponent(config.url)}` 
      : config.url;

    const res = await fetch(targetUrl, options);
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
        suggestion: 'Failed to fetch. This is likely a CORS issue. Ensure "Use CORS Proxy" is ENABLED in the settings.' 
      },
      headers: {},
      duration: Math.round(endTime - startTime),
      error: error.message
    };
  }
};