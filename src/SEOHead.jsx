import { useEffect } from 'react';

export default function SEOHead({ title, description, url }) {
  useEffect(() => {
    document.title = title || 'House-AI | 不動産AIコンシェルジュ';

    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    const setOG = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.content = content;
    };

    setMeta('description', description || '');
    setOG('og:title', title || '');
    setOG('og:description', description || '');
    setOG('og:url', url || window.location.href);
    setOG('og:type', 'website');
    setOG('og:site_name', 'House-AI');
  }, [title, description, url]);

  return null;
}
