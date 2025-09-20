'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

// Types and Interfaces
interface AIRendererProps {
  content: string;
  className?: string;
  theme?: 'light' | 'dark' | 'custom';
}

interface MarkdownElement {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'code' | 'ul' | 'ol' | 'blockquote' | 'hr' | 'raw_html_code';
  content?: string;
  language?: string;
  items?: string[];
  id?: number;
  title?: string; // For file names like "index.html"
}

interface SyntaxHighlightKeywords {
  [key: string]: string[];
}

// Component
const AIRenderer: React.FC<AIRendererProps> = ({ content, className = '', theme = 'custom' }) => {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Custom theme colors for your dark blue background
  const themeColors = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-700',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      codeBg: 'bg-gray-50',
      codeHeaderBg: 'bg-gray-100',
      buttonBg: 'bg-white hover:bg-gray-50',
      blockquoteBg: 'bg-blue-50',
    },
    dark: {
      bg: 'bg-slate-800',
      text: 'text-white',
      textSecondary: 'text-gray-200',
      textMuted: 'text-gray-400',
      border: 'border-slate-600',
      codeBg: 'bg-slate-900',
      codeHeaderBg: 'bg-slate-700',
      buttonBg: 'bg-slate-600 hover:bg-slate-500',
      blockquoteBg: 'bg-blue-900/30',
    },
    custom: {
      bg: 'bg-slate-800/50',
      text: 'text-gray-100',
      textSecondary: 'text-gray-200',
      textMuted: 'text-gray-300',
      border: 'border-slate-500/50',
      codeBg: 'bg-slate-900/80',
      codeHeaderBg: 'bg-slate-800/80',
      buttonBg: 'bg-slate-700/80 hover:bg-slate-600/80',
      blockquoteBg: 'bg-blue-800/20',
    }
  };

  const colors = themeColors[theme];

  // Syntax highlighting configuration
  const syntaxKeywords: SyntaxHighlightKeywords = {
    javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'try', 'catch'],
    typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'async', 'await', 'try', 'catch', 'interface', 'type', 'enum'],
    python: ['def', 'class', 'import', 'from', 'if', 'else', 'elif', 'for', 'while', 'return', 'try', 'except', 'with', 'as', 'lambda'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'try', 'catch'],
    css: ['color', 'background', 'margin', 'padding', 'border', 'width', 'height', 'display', 'position', 'flex', 'grid'],
    html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'body', 'head', 'html', 'script', 'style', 'img', 'a', 'ul', 'li', 'DOCTYPE', 'meta', 'link'],
    jsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'React', 'useState', 'useEffect'],
    tsx: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'React', 'useState', 'useEffect', 'interface', 'type']
  };

  // Enhanced HTML escape function
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Smart content detection and preprocessing
  const smartContentDetection = useCallback((rawContent: string): { isProcessed: boolean; content: string; detectedBlocks: any[] } => {
    // Pattern 1: Check for file headers like "📄 index.html" or "Html" followed by code
    const fileHeaderPattern = /(?:📄\s*)?(?:(\w+\.(?:html|css|js|tsx?|py|java))|([Hh]tml|[Cc]ss|[Jj]ava[Ss]cript|[Pp]ython))\s*$/gm;
    
    // Pattern 2: Detect raw HTML blocks
    const htmlBlockPattern = /<(?:!DOCTYPE|html|head|body|div|span|p|h[1-6])[^>]*>/i;
    
    // Pattern 3: Check if it's already properly formatted markdown
    const hasMarkdownFormatting = /```|#{1,6}\s+/.test(rawContent);
    
    if (hasMarkdownFormatting) {
      // Already properly formatted
      return { isProcessed: false, content: rawContent, detectedBlocks: [] };
    }
    
    const lines = rawContent.split('\n');
    const detectedBlocks: any[] = [];
    let processedContent = '';
    const currentBlock: { type: string; language: string; content: string; title?: string } | null = null;
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Check for file header
      const fileMatch = line.match(/(?:📄\s*)?(\w+\.[a-zA-Z]+)|^([Hh]tml|[Cc]ss|[Jj]ava[Ss]cript|[Pp]ython)\s*$/);
      
      if (fileMatch) {
        // Found a file header or language indicator
        const fileName = fileMatch[1];
        const language = fileName 
          ? fileName.split('.').pop()?.toLowerCase() || 'text'
          : fileMatch[2]?.toLowerCase() || 'html';
          
        // Look ahead for code content
        let codeContent = '';
        let j = i + 1;
        
        // Skip empty lines
        while (j < lines.length && !lines[j].trim()) {
          j++;
        }
        
        // Collect code lines until next header or end
        while (j < lines.length) {
          const nextLine = lines[j];
          
          // Stop if we hit another file header
          if (nextLine.match(/(?:📄\s*)?(\w+\.[a-zA-Z]+)|^([Hh]tml|[Cc]ss|[Jj]ava[Ss]cript|[Pp]ython)\s*$/)) {
            break;
          }
          
          codeContent += (codeContent ? '\n' : '') + nextLine;
          j++;
        }
        
        if (codeContent.trim()) {
          // Add as markdown code block
          processedContent += `## ${fileName || language.toUpperCase()}\n\n\`\`\`${language}\n${codeContent.trim()}\n\`\`\`\n\n`;
          detectedBlocks.push({ type: 'code', language, title: fileName, content: codeContent.trim() });
        }
        
        i = j;
        continue;
      }
      
      // Check for raw HTML content without header
      if (htmlBlockPattern.test(line)) {
        // Found raw HTML, collect until non-HTML content
        let htmlContent = '';
        let j = i;
        
        while (j < lines.length) {
          const htmlLine = lines[j];
          
          // If line looks like HTML or is empty, include it
          if (htmlLine.trim() === '' || 
              htmlLine.includes('<') || 
              htmlLine.includes('>') || 
              htmlLine.match(/^\s*(color:|font-|background|margin|padding)/)) {
            htmlContent += (htmlContent ? '\n' : '') + htmlLine;
            j++;
          } else {
            // Stop collecting if we hit non-HTML content
            break;
          }
        }
        
        if (htmlContent.trim()) {
          processedContent += `## HTML Code\n\n\`\`\`html\n${htmlContent.trim()}\n\`\`\`\n\n`;
          detectedBlocks.push({ type: 'code', language: 'html', content: htmlContent.trim() });
        }
        
        i = j;
        continue;
      }
      
      // Regular content
      processedContent += line + '\n';
      i++;
    }
    
    return {
      isProcessed: detectedBlocks.length > 0,
      content: processedContent,
      detectedBlocks
    };
  }, []);

  const highlightCode = useCallback((code: string, language: string): string => {
    if (!language || !code) return escapeHtml(code);

    // First escape HTML to prevent interpretation
    let highlighted = escapeHtml(code);
    const keywords = syntaxKeywords[language.toLowerCase()];
    
    if (keywords) {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        highlighted = highlighted.replace(regex, `<span style="color: #a855f7; font-weight: 600;">${keyword}</span>`);
      });
    }

    // Highlight strings
    highlighted = highlighted.replace(
      /(&quot;)((?:(?!&quot;)[^&]|&[^;]*;)*)(&quot;|$)/g, 
      '<span style="color: #10b981;">$1$2$3</span>'
    );
    
    highlighted = highlighted.replace(
      /(&#x27;)((?:(?!&#x27;)[^&]|&[^;]*;)*)((&#x27;)|$)/g,
      '<span style="color: #10b981;">$1$2$3</span>'
    );
    
    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$|&lt;!--[\s\S]*?--&gt;)/gm, 
      '<span style="color: #6b7280; font-style: italic;">$1</span>'
    );
    
    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g, 
      '<span style="color: #ef4444;">$1</span>'
    );

    // Highlight HTML tags and attributes
    highlighted = highlighted.replace(
      /(&lt;\/?)([\w-]+)([^&]*?)(&gt;)/g,
      '<span style="color: #3b82f6;">$1</span><span style="color: #8b5cf6; font-weight: 600;">$2</span><span style="color: #059669;">$3</span><span style="color: #3b82f6;">$4</span>'
    );

    // Highlight attributes
    highlighted = highlighted.replace(
      /(\w+)(=)(&quot;[^&]*?&quot;|&#x27;[^&]*?&#x27;)/g,
      '<span style="color: #f59e0b;">$1</span><span style="color: #ef4444;">$2</span><span style="color: #10b981;">$3</span>'
    );

    return highlighted;
  }, []);

  const copyToClipboard = useCallback(async (text: string, blockId: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set(prev).add(blockId));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }, []);

  const toggleSection = useCallback((sectionId: number): void => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const parseMarkdown = useCallback((markdown: string): MarkdownElement[] => {
    const lines = markdown.split('\n');
    const elements: MarkdownElement[] = [];
    let currentElement: MarkdownElement | null = null;
    let codeBlockId = 0;
    let sectionId = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.startsWith('```')) {
        if (currentElement?.type === 'code') {
          elements.push(currentElement);
          currentElement = null;
        } else {
          const language = line.slice(3).trim() || 'text';
          currentElement = {
            type: 'code',
            language,
            content: '',
            id: codeBlockId++
          };
        }
        continue;
      }

      if (currentElement?.type === 'code') {
        currentElement.content += (currentElement.content ? '\n' : '') + line;
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        if (currentElement) elements.push(currentElement);
        elements.push({ type: 'h1', content: line.slice(2), id: sectionId++ });
        currentElement = null;
      } else if (line.startsWith('## ')) {
        if (currentElement) elements.push(currentElement);
        elements.push({ type: 'h2', content: line.slice(3), id: sectionId++ });
        currentElement = null;
      } else if (line.startsWith('### ')) {
        if (currentElement) elements.push(currentElement);
        elements.push({ type: 'h3', content: line.slice(4), id: sectionId++ });
        currentElement = null;
      } else if (line.startsWith('#### ')) {
        if (currentElement) elements.push(currentElement);
        elements.push({ type: 'h4', content: line.slice(5), id: sectionId++ });
        currentElement = null;
      }
      // Lists
      else if (line.match(/^\s*[-*+]\s/)) {
        if (currentElement?.type !== 'ul') {
          if (currentElement) elements.push(currentElement);
          currentElement = { type: 'ul', items: [] };
        }
        currentElement.items!.push(line.replace(/^\s*[-*+]\s/, ''));
      } else if (line.match(/^\s*\d+\.\s/)) {
        if (currentElement?.type !== 'ol') {
          if (currentElement) elements.push(currentElement);
          currentElement = { type: 'ol', items: [] };
        }
        currentElement.items!.push(line.replace(/^\s*\d+\.\s/, ''));
      }
      // Blockquotes
      else if (line.startsWith('> ')) {
        if (currentElement?.type !== 'blockquote') {
          if (currentElement) elements.push(currentElement);
          currentElement = { type: 'blockquote', content: '' };
        }
        currentElement.content += (currentElement.content ? '\n' : '') + line.slice(2);
      }
      // Horizontal rule
      else if (line.match(/^---+$/)) {
        if (currentElement) {
          elements.push(currentElement);
          currentElement = null;
        }
        elements.push({ type: 'hr' });
      }
      // Paragraphs
      else if (line.trim()) {
        if (currentElement?.type !== 'p') {
          if (currentElement) elements.push(currentElement);
          currentElement = { type: 'p', content: '' };
        }
        currentElement.content += (currentElement.content ? ' ' : '') + line.trim();
      } else {
        if (currentElement) {
          elements.push(currentElement);
          currentElement = null;
        }
      }
    }

    if (currentElement) {
      elements.push(currentElement);
    }

    return elements;
  }, []);

  const renderInlineMarkdown = useCallback((text: string): string => {
    if (!text) return text;
    
    // Escape HTML first to prevent interpretation
    let escaped = escapeHtml(text);
    
    return escaped
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background-color: rgba(15, 23, 42, 0.8); color: #e2e8f0; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em;">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #60a5fa; text-decoration: none;" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">$1 ↗</a>');
  }, []);

  // Process content with smart detection
  const { isProcessed, content: processedContent } = smartContentDetection(content || '');
  const elements = parseMarkdown(processedContent);

  return (
    <div className={`ai-renderer max-w-none ${className}`}>
      {isProcessed && (
        <div className={`mb-4 px-3 py-2 rounded-lg ${colors.blockquoteBg} ${colors.border} border-l-4 border-green-400`}>
          <div className={`text-sm ${colors.textMuted} flex items-center gap-2`}>
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Smart parsing applied - Raw content converted to structured format
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {elements.map((element, index) => {
          switch (element.type) {
            case 'code':
              const blockId = `code-${element.id}`;
              return (
                <div key={index} className={`${colors.codeBg} ${colors.border} border rounded-lg overflow-hidden my-6 backdrop-blur-sm`}>
                  <div className={`flex items-center justify-between ${colors.codeHeaderBg} px-4 py-2 ${colors.border} border-b`}>
                    <span className={`text-sm font-medium ${colors.textMuted} capitalize`}>
                      {element.title || element.language || 'code'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(element.content!, blockId)}
                      className={`flex items-center gap-2 px-3 py-1.5 text-sm ${colors.buttonBg} ${colors.border} border rounded transition-colors backdrop-blur-sm`}
                    >
                      {copiedBlocks.has(blockId) ? (
                        <>
                          <Check size={14} className="text-green-400" />
                          <span className="text-green-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} className={colors.textMuted.replace('text-', 'text-')} />
                          <span className={colors.textSecondary}>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre 
                      className={`text-sm font-mono leading-relaxed ${colors.text} whitespace-pre-wrap`}
                      dangerouslySetInnerHTML={{ 
                        __html: highlightCode(element.content!, element.language!) 
                      }} 
                    />
                  </div>
                </div>
              );

            case 'h1':
              return (
                <div key={index} className={`${colors.border} border-b pb-4`}>
                  <div
                    className={`flex items-center gap-2 cursor-pointer hover:${colors.buttonBg.split(' ')[0]}/10 p-2 -m-2 rounded-lg transition-colors`}
                    onClick={() => toggleSection(element.id!)}
                  >
                    {expandedSections.has(element.id!) ? 
                      <ChevronDown size={20} className={colors.textMuted.replace('text-', 'text-')} /> : 
                      <ChevronRight size={20} className={colors.textMuted.replace('text-', 'text-')} />
                    }
                    <h1 
                      className={`text-3xl font-bold ${colors.text} m-0`}
                      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(element.content!) }} 
                    />
                  </div>
                </div>
              );
            
            case 'h2':
              return (
                <h2 
                  key={index} 
                  className={`text-2xl font-semibold ${colors.text} mt-8 mb-4 ${colors.border} border-b pb-2`}
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(element.content!) }} 
                />
              );
            
            case 'h3':
              return (
                <h3 
                  key={index} 
                  className={`text-xl font-semibold ${colors.text} mt-6 mb-3`}
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(element.content!) }} 
                />
              );
            
            case 'h4':
              return (
                <h4 
                  key={index} 
                  className={`text-lg font-semibold ${colors.text} mt-4 mb-2`}
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(element.content!) }} 
                />
              );
            
            case 'p':
              return (
                <p 
                  key={index} 
                  className={`${colors.textSecondary} leading-relaxed mb-4`}
                  dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(element.content!) }} 
                />
              );
            
            case 'ul':
              return (
                <ul key={index} className="space-y-1 mb-4 pl-6">
                  {element.items!.map((item, itemIndex) => (
                    <li 
                      key={itemIndex} 
                      className={`${colors.textSecondary} list-disc`}
                      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} 
                    />
                  ))}
                </ul>
              );
            
            case 'ol':
              return (
                <ol key={index} className="space-y-1 mb-4 pl-6 list-decimal">
                  {element.items!.map((item, itemIndex) => (
                    <li 
                      key={itemIndex} 
                      className={colors.textSecondary}
                      dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(item) }} 
                    />
                  ))}
                </ol>
              );
            
            case 'blockquote':
              return (
                <blockquote key={index} className={`border-l-4 border-blue-400 ${colors.blockquoteBg} pl-4 py-3 mb-4 rounded-r-lg backdrop-blur-sm`}>
                  <div 
                    className={`${colors.textSecondary} italic`}
                    dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(element.content!) }} 
                  />
                </blockquote>
              );
            
            case 'hr':
              return <hr key={index} className={`my-8 ${colors.border}`} />;
            
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default AIRenderer;

