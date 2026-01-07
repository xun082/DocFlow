/**
 * Document export styles
 */

/**
 * Extra CSS for document exports (PDF, etc.)
 */
export const extraCss = `
  * { box-sizing: border-box; }
  img { display: block; max-width: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.8;
    color: #333;
    font-size: 16px;
    padding: 10px;
    max-width: 677px;
    margin: 0 auto;
  }
  h1, h2, h3, h4, h5, h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.4;
  }
  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
  h4 { font-size: 16px; }
  p {
    margin-bottom: 16px;
    text-align: justify;
  }
  a {
    color: #576b95;
    text-decoration: none;
  }
  blockquote {
    border-left: 4px solid #576b95;
    padding-left: 16px;
    margin: 20px 0;
    color: #666;
    background-color: #f7f7f7;
    padding: 16px;
    border-radius: 4px;
  }
  ul, ol {
    padding-left: 24px;
    margin-bottom: 16px;
  }
  li {
    margin-bottom: 8px;
  }
  code {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: Consolas, Monaco, "Andale Mono", monospace;
    font-size: 14px;
    color: #d63384;
  }
  pre {
    background-color: #0d1117;
    color: #e6edf3;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 20px 0;
    border: 1px solid #21262d;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.6;
  }
  pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 14px;
  }
  th, td {
    border: 1px solid #e0e0e0;
    padding: 12px;
    text-align: left;
  }
  th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  hr {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 24px 0;
  }
  strong {
    font-weight: 600;
  }
  em {
    font-style: italic;
  }
  .ProseMirror {
    outline: none;
  }
`;

/**
 * Clean element attributes by removing event handlers and unnecessary data attributes
 * @param container - HTML container element
 * @param allowedDataAttributes - Data attributes to preserve
 */
export function cleanElementAttributes(
  container: HTMLElement,
  allowedDataAttributes: string[] = ['data-src', 'data-type'],
): void {
  const allElements = container.querySelectorAll('*');
  allElements.forEach((el) => {
    // Remove event handlers (on* attributes)
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // Remove data-* attributes except allowed ones
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-') && !allowedDataAttributes.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
  });
}

/**
 * Convert relative URL to absolute URL
 * @param url - Original URL
 * @returns Absolute URL string
 */
function toAbsoluteUrl(url: string): string {
  if (url.startsWith('http') || url.startsWith('#')) {
    return url;
  }

  return new URL(url, window.location.origin).href;
}

/**
 * Process images by converting to absolute URLs
 * @param container - HTML container element
 * @param attributesToRemove - Image attributes to remove
 */
export function processImages(
  container: HTMLElement,
  attributesToRemove: string[] = ['loading', 'decoding'],
): void {
  const images = container.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src');

    if (src) {
      img.setAttribute('src', toAbsoluteUrl(src));
    }

    attributesToRemove.forEach((attr) => img.removeAttribute(attr));
  });
}

/**
 * Process links by ensuring absolute URLs
 * @param container - HTML container element
 */
export function processLinks(container: HTMLElement): void {
  const links = container.querySelectorAll('a');
  links.forEach((link) => {
    const href = link.getAttribute('href');

    if (href) {
      link.setAttribute('href', toAbsoluteUrl(href));
    }
  });
}
