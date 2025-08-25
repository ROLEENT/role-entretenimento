import DOMPurify from 'dompurify';

// Configure DOMPurify for safe HTML rendering
const configureDOMPurify = () => {
  // Allow common safe HTML tags and attributes
  DOMPurify.addHook('beforeSanitizeElements', (node, data) => {
    // Remove any script tags completely
    if (data && (data as any).tagName === 'script') {
      (node as Element).remove();
    }
  });

  return DOMPurify;
};

// Sanitize HTML content to prevent XSS attacks
export const sanitizeHTML = (htmlContent: string): string => {
  const purify = configureDOMPurify();
  
  return purify.sanitize(htmlContent, {
    // Allow basic formatting tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img',
      'div', 'span', 'pre', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target'
    ],
    // Remove any scripts and event handlers
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
    // Keep relative URLs safe
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true
  });
};

// Sanitize plain text content
export const sanitizeText = (textContent: string): string => {
  // Remove any HTML tags and decode HTML entities
  const div = document.createElement('div');
  div.innerHTML = textContent;
  return div.textContent || div.innerText || '';
};

// Create a safe HTML component props
export const createSafeHTML = (htmlContent: string) => ({
  __html: sanitizeHTML(htmlContent)
});

// Validate URLs to prevent javascript: and data: URLs
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'mailto:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};
