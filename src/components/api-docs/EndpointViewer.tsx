import { useState, useEffect } from 'react';
import type { Operation, Schema } from '@/types/openapi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X, ExternalLink, Copy, Check, Code } from 'lucide-react';
import { ApiDocumentationService } from '@/lib/api/services';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/lib/context/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface EndpointViewerProps {
    method: string;
    path: string;
    operation: Operation;
    host?: string;
    basePath?: string;
    definitions?: Record<string, Schema>;
    onUpdate?: () => void;
    isPublic?: boolean;
    layout?: 'left' | 'right';
}

const METHOD_COLORS: Record<string, string> = {
    get: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
    post: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
    put: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200",
    delete: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
    patch: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200",
};

const API_HOSTNAME = 'http://api.geepay.co.zm';
const API_BASE_PATH = '/api/v1';

// Code generators
const generateCurlExample = (method: string, path: string, examplePayload?: any): string => {
    const fullUrl = `${API_HOSTNAME}${API_BASE_PATH}${path}`;
    const isPost = method.toUpperCase() === 'POST';

    if (isPost && examplePayload) {
        return `curl -X POST "${fullUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(examplePayload, null, 2)}'`;
    }

    return `curl -X ${method.toUpperCase()} "${fullUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
};

const generateJavaScriptExample = (method: string, path: string, examplePayload?: any): string => {
    const fullUrl = `${API_HOSTNAME}${API_BASE_PATH}${path}`;

    if (method.toUpperCase() === 'POST' && examplePayload) {
        return `const response = await fetch('${fullUrl}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${JSON.stringify(examplePayload, null, 4)})
});

const data = await response.json();
console.log(data);`;
    }

    return `const response = await fetch('${fullUrl}', {
  method: '${method.toUpperCase()}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const data = await response.json();
console.log(data);`;
};

// Code examples component
const CodeExamples = ({ method, path, examplePayload }: { method: string; path: string; examplePayload?: any }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const examples = {
        curl: generateCurlExample(method, path, examplePayload),
        javascript: generateJavaScriptExample(method, path, examplePayload),
    };

    const handleCopy = (language: string, code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(language);
        setTimeout(() => setCopied(null), 2000);
    };

    const responseExample = {
        status: "success",
        message: "Operation completed",
        data: {
            id: "tx_123456789",
            status: "completed",
            timestamp: new Date().toISOString()
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Code className="h-4 w-4 text-gp-cobalt" />
                    <h4 className="font-display font-semibold text-text-md text-gray-900">Request Examples</h4>
                </div>

                <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100/50 p-1 rounded-xl">
                        <TabsTrigger value="curl" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">curl</TabsTrigger>
                        <TabsTrigger value="javascript" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">JavaScript</TabsTrigger>
                    </TabsList>

                    {Object.entries(examples).map(([language, code]) => (
                        <TabsContent key={language} value={language} className="space-y-3">
                            <div className="relative group">
                                <div className="absolute right-3 top-3 z-10">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopy(language, code)}
                                        className="h-8 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                                    >
                                        {copied === language ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="bg-slate-900 text-slate-50 p-6 rounded-2xl border border-slate-800 overflow-auto text-xs font-mono leading-relaxed shadow-xl">
                                    <pre className="whitespace-pre-wrap">{code}</pre>
                                </div>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {/* Response Example */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <h4 className="font-display font-semibold text-text-md text-gray-900">Expected Response</h4>
                </div>
                <div className="bg-slate-900 text-slate-50 p-6 rounded-2xl border border-slate-800 overflow-auto text-xs font-mono shadow-xl relative">
                    <div className="absolute right-4 top-4 text-[10px] text-slate-500 uppercase tracking-widest font-sans font-bold">JSON</div>
                    <pre>{JSON.stringify(responseExample, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export const EndpointViewer = ({
    method,
    path,
    operation,
    definitions,
    onUpdate,
    isPublic = false,
    layout = 'left'
}: EndpointViewerProps) => {
    const { user } = useAuth();
    const canEdit = !isPublic && (user?.role === 'admin' || user?.role === 'super_admin');

    const [isEditing, setIsEditing] = useState(false);
    const [description, setDescription] = useState(operation.description || '');
    const [summary, setSummary] = useState(operation.summary || '');

    useEffect(() => {
        setDescription(operation.description || '');
        setSummary(operation.summary || '');
    }, [operation]);

    const handleSave = async () => {
        setIsEditing(false);
        try {
            await ApiDocumentationService.saveOverride({
                path,
                method,
                description,
                summary
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to save override:", error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setDescription(operation.description || '');
        setSummary(operation.summary || '');
    };

    const renderSchema = (schema?: Schema) => {
        if (!schema) return <span className="text-gray-400 italic font-sans">No content</span>;

        let displaySchema = schema;
        if (schema.$ref) {
            const refName = schema.$ref.split('/').pop();
            if (refName && definitions && definitions[refName]) {
                displaySchema = definitions[refName];
            }
        }

        if (displaySchema.type === 'object' && displaySchema.properties) {
            return (
                <div className="space-y-4">
                    {Object.entries(displaySchema.properties).map(([key, prop]: [string, any]) => (
                        <div key={key} className="border-l-2 border-slate-100 pl-4 py-1 hover:border-gp-sky/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <code className="text-xs font-mono font-bold text-gp-cobalt bg-gp-cobalt-100/50 px-2 py-1 rounded">
                                    {key}
                                </code>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                    {prop.type || 'string'}
                                    {displaySchema.required?.includes(key) && <span className="text-danger ml-1">*</span>}
                                </span>
                            </div>
                            {prop.description && (
                                <p className="text-xs text-gray-500 mt-1.5 font-sans leading-relaxed">{prop.description}</p>
                            )}
                            {prop.example && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">Example:</span>
                                    <code className="text-[10px] bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-gray-600">
                                        {typeof prop.example === 'string' ? `"${prop.example}"` : JSON.stringify(prop.example)}
                                    </code>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="bg-slate-50 p-4 rounded-xl text-xs font-mono overflow-auto max-h-[200px] border border-slate-100 shadow-inner">
                <pre>{JSON.stringify(displaySchema, null, 2)}</pre>
            </div>
        );
    }

    if (layout === 'right') {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
            >
                <CodeExamples method={method} path={path} />

                <div className="pt-6 border-t border-slate-200">
                    <h4 className="font-display font-semibold text-text-md text-gray-900 mb-4">Responses</h4>
                    <div className="space-y-4">
                        {operation.responses && Object.entries(operation.responses).map(([code, resp]) => (
                            <div key={code} className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <Badge className={cn(
                                        "font-mono font-bold px-2 py-0.5 rounded-lg",
                                        code.startsWith('2') ? 'bg-success-light text-success-fg' : 'bg-danger-light text-danger-fg'
                                    )}>
                                        {code}
                                    </Badge>
                                    <span className="text-sm font-medium text-gray-700">{resp.description}</span>
                                </div>
                                {resp.schema && (
                                    <div className="text-xs mt-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Response Model</span>
                                        {renderSchema(resp.schema)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gp-sky-100/30 border border-gp-sky/20 rounded-2xl p-6 text-sm">
                    <p className="font-display font-bold text-gp-sky-800 mb-3 flex items-center gap-2">
                        <span className="h-5 w-5 rounded-lg bg-gp-sky flex items-center justify-center text-white text-[10px]">🔐</span>
                        Authentication
                    </p>
                    <p className="text-gp-sky-900/70 leading-relaxed">
                        Include your API key in the <code className="bg-white px-1.5 py-0.5 rounded border border-gp-sky/20 font-mono text-xs">Authorization</code> header:
                        <code className="block bg-white p-3 mt-3 border border-gp-sky/20 rounded-xl text-xs font-mono text-gp-sky-900 shadow-sm">
                            Authorization: Bearer <span className="opacity-40">gp_live_...</span>
                        </code>
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <Card className="mb-12 border-slate-100 shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300" id={`${method}-${path}`}>
            <CardHeader className="pb-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2">
                            <Badge className={cn("uppercase font-mono font-bold px-3 py-1 text-xs border rounded-lg", METHOD_COLORS[method])}>
                                {method}
                            </Badge>
                            <code className="text-xs font-mono font-semibold text-gp-cobalt bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                {path}
                            </code>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono bg-white inline-flex px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
                            <ExternalLink className="h-3 w-3" />
                            {`${API_HOSTNAME}${API_BASE_PATH}${path}`}
                        </div>

                        {isEditing ? (
                            <input
                                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-sans placeholder:text-gray-400 focus:ring-2 focus:ring-gp-sky focus:outline-none shadow-sm"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                placeholder="Summary..."
                            />
                        ) : (
                            <h3 className="font-display font-bold text-display-xs text-gray-900">{summary}</h3>
                        )}
                    </div>

                    {canEdit && (
                        <div className="ml-4">
                            <AnimatePresence mode="wait">
                                {!isEditing ? (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsEditing(true)}
                                            className="h-10 w-10 text-gray-400 hover:text-gp-cobalt hover:bg-gp-cobalt-100 rounded-xl transition-all"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="save"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleCancel}
                                            className="h-10 w-10 text-gray-400 hover:text-danger hover:bg-danger-light rounded-xl transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleSave}
                                            className="h-10 w-10 text-success hover:bg-success-light rounded-xl transition-all"
                                        >
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                <div className="space-y-10">
                    {description && (
                        <div className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100">
                            <div className="prose prose-slate prose-sm max-w-none text-gray-600 font-sans leading-relaxed">
                                {isEditing ? (
                                    <Textarea
                                        className="min-h-[160px] rounded-xl border-slate-200 shadow-sm focus:ring-gp-sky"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Markdown description..."
                                    />
                                ) : (
                                    <div className="markdown-body">
                                        <ReactMarkdown>{description}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-display font-semibold text-text-lg text-gray-900">Parameters</h4>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{operation.parameters?.length || 0} Total</span>
                        </div>
                        {operation.parameters && operation.parameters.length > 0 ? (
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm font-sans">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">In</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {operation.parameters.map((param, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-gp-cobalt">
                                                    {param.name}
                                                    {param.required && <span className="text-danger ml-1">*</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold text-gray-400 bg-slate-100 px-2 py-1 rounded-md uppercase">{param.in}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium text-gray-600">{param.type || 'object'}</span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">{param.description}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 font-sans">
                                No parameters required for this endpoint
                            </div>
                        )}
                    </div>

                    {operation.requestBody && operation.requestBody.content && operation.requestBody.content['application/json'] && (
                        <div>
                            <h4 className="font-display font-semibold text-text-lg text-gray-900 mb-6 font-display">Request Model</h4>
                            <div className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm">
                                {renderSchema(operation.requestBody.content['application/json'].schema)}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
