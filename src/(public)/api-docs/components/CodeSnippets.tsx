import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { CodeLanguage } from '../utils/codeGeneration';
import { generateCodeSnippet } from '../utils/codeGeneration';

interface CodeSnippetsProps {
  method: string;
  path: string;
  authToken?: string;
}

const languages: { id: CodeLanguage; label: string; highlightLang: string }[] = [
  { id: 'curl', label: 'cURL', highlightLang: 'bash' },
  { id: 'javascript', label: 'JavaScript', highlightLang: 'javascript' },
  { id: 'php', label: 'PHP', highlightLang: 'php' },
  { id: 'go', label: 'Go', highlightLang: 'go' },
  { id: 'python', label: 'Python', highlightLang: 'python' },
];

export function CodeSnippets({ method, path, authToken }: CodeSnippetsProps) {
  const [activeLanguage, setActiveLanguage] = useState<CodeLanguage>('curl');
  const [copied, setCopied] = useState(false);

  const code = generateCodeSnippet(activeLanguage, {
    method,
    path,
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLang = languages.find((l) => l.id === activeLanguage);

  return (
    <div className="space-y-3">
      {/* Language Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setActiveLanguage(lang.id)}
            className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeLanguage === lang.id
                ? 'bg-gp-cobalt-50 text-gp-cobalt-700 border-b-2 border-gp-cobalt-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <div className="relative bg-gray-950 rounded-lg overflow-hidden">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors z-10 flex items-center gap-2"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>

        <SyntaxHighlighter
          language={currentLang?.highlightLang || 'bash'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
