import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIResponseRendererProps {
  content: string;
  className?: string;
}

const AIResponseRenderer: React.FC<AIResponseRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  return (
    <div className={`ai-response-container ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-gray-200 mb-6 mt-8 first:mt-0" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold text-gray-200 mb-4 mt-6 first:mt-0 border-b-2 border-gray-200 pb-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold text-gray-200 mb-3 mt-5 first:mt-0" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-semibold text-gray-200 mb-3 mt-4 first:mt-0" {...props} />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-gray-200 mb-4 leading-relaxed" {...props} />
          ),
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-xl shadow-lg border border-gray-600/30 backdrop-blur-sm">
              <table className="min-w-full border-collapse bg-gray-900/80" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider border-b border-blue-500/20" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-gray-600/30" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-gray-700/30 transition-colors duration-200" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-6 py-4 text-sm text-gray-200 border-b border-gray-600/20 last:border-b-0" {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-none mb-6 space-y-2 text-gray-200" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-none mb-6 space-y-2 text-gray-200 counter-reset-list" {...props} />
          ),
          li: ({ node, ordered, ...props }) => 
            ordered ? (
              <li className="flex items-start space-x-3 counter-increment-list">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold counter-display"></span>
                <span className="flex-1 pt-0.5" {...props} />
              </li>
            ) : (
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span className="flex-1" {...props} />
              </li>
            ),
          
          // Code
          code: ({ node, inline, ...props }) => 
            inline ? (
              <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-mono font-semibold" {...props} />
            ) : (
              <code className="block text-gray-400 p-4 rounded-xl overflow-x-auto text-sm font-mono " {...props} />
            ),
          
          pre: ({ node, ...props }) => (
            <pre className="bg-gradient-to-br from-gray-900 to-gray-800 text-green-400 p-1 rounded-xl overflow-x-auto mb-6 shadow-lg border border-gray-700 break-words text-wrap" {...props} />
          ),
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 bg-transparent pl-6 pr-4 my-6 italic text-gray-700 rounded-r-lg shadow-sm" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all duration-200 font-medium" {...props} />
          ),
          
          // Horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8" {...props} />
          ),
          
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gray-200" {...props} />
          ),
          
          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-gray-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default AIResponseRenderer;