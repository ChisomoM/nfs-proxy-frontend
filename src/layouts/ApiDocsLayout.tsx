import { useState, useEffect } from 'react';
import type { OpenApiSpec } from '@/types/openapi';
import { mergeDocs, cn } from '@/lib/utils';
import { EndpointViewer } from '@/components/api-docs/EndpointViewer';
import { ApiDocumentationService } from '@/lib/api/services';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Server, RefreshCw, Code, TestTube, Lightbulb, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { QuickstartGuide } from '@/components/api-docs/QuickstartGuide';
import { motion, AnimatePresence } from 'framer-motion';

export const ApiDocsLayout = ({ isPublic = false }: { isPublic?: boolean }) => {
    const [spec, setSpec] = useState<OpenApiSpec | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState<{ method: string, path: string, operation: any } | null>(null);

    const loadDocs = async () => {
        setLoading(true);
        try {
            const liveSpec = await ApiDocumentationService.fetchSwaggerSpec();
            const overrides = await ApiDocumentationService.getOverrides();
            const finalSpec = mergeDocs(liveSpec, overrides);
            setSpec(finalSpec);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load API Docs. Falling back to offline mode.");
            setSpec({
                swagger: "2.0",
                info: { title: "API Backend Offline", version: "0.0.0", description: "Could not fetch swagger.json" },
                paths: {},
                definitions: {}
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDocs();
    }, []);

    const groupedPaths: Record<string, any[]> = {};

    if (spec?.paths) {
        Object.entries(spec.paths).forEach(([path, methods]) => {
            Object.entries(methods).forEach(([method, operation]: [string, any]) => {
                const tag = (operation.tags?.[0]) || 'API Reference';
                if (!groupedPaths[tag]) groupedPaths[tag] = [];
                groupedPaths[tag].push({
                    path,
                    method,
                    ...operation
                });
            });
        });
    }

    const filteredTags = Object.keys(groupedPaths).filter(tag => {
        if (!searchTerm) return true;
        return groupedPaths[tag].some((op: any) =>
            op.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (op.summary && op.summary.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-gp-sky/20 border-t-gp-sky animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-gp-sky">
                            <RefreshCw className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="text-gray-500 font-medium animate-pulse">Initializing API Documentation...</p>
                </div>
            </div>
        );
    }

    if (!spec) return <div className="p-10 text-center">Error loading API documentation</div>;

    const host = spec.host || 'api.geepay.co.zm';
    const basePath = spec.basePath || '/api/v1';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white rounded-none border-none shadow-none">
            {/* Sidebar - Navigation */}
            <div className="w-72 border-r border-slate-50 bg-slate-50/30 hidden lg:flex lg:flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-50 bg-white">
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-gp-sky transition-colors" />
                        <Input
                            placeholder="Find endpoint..."
                            className="pl-10 h-10 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">
                        <button
                            onClick={() => {
                                setSelectedEndpoint(null);
                                document.getElementById('quickstart')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full flex items-center gap-3 text-sm py-2.5 px-4 rounded-xl hover:bg-gp-sky-100/50 text-gp-sky font-bold transition-all group"
                        >
                            <div className="h-6 w-6 rounded-lg bg-gp-sky/10 flex items-center justify-center group-hover:bg-gp-sky group-hover:text-white transition-colors">
                                <Lightbulb className="h-3.5 w-3.5" />
                            </div>
                            ⚡ Quickstart
                        </button>

                        {filteredTags.map(tag => (
                            <div key={tag} className="space-y-2">
                                <h4 className="font-display font-bold text-[10px] px-4 text-gray-400 uppercase tracking-[0.2em]">
                                    {tag}
                                </h4>
                                <div className="space-y-1">
                                    {groupedPaths[tag].filter((op: any) =>
                                        !searchTerm ||
                                        op.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        (op.summary && op.summary.toLowerCase().includes(searchTerm.toLowerCase()))
                                    ).map((op: any) => (
                                        <button
                                            key={`${op.method}-${op.path}`}
                                            className={cn(
                                                "w-full text-left text-xs py-2 px-4 rounded-xl transition-all truncate flex items-center gap-3",
                                                selectedEndpoint?.method === op.method && selectedEndpoint?.path === op.path
                                                    ? 'bg-gp-cobalt text-white shadow-lg shadow-gp-cobalt/20'
                                                    : 'hover:bg-slate-100 text-gray-600'
                                            )}
                                            onClick={() => {
                                                setSelectedEndpoint({ method: op.method, path: op.path, operation: op });
                                                document.getElementById(`${op.method}-${op.path}`)?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            <span className={cn(
                                                "uppercase text-[9px] font-black inline-block w-8 text-center px-1 rounded",
                                                selectedEndpoint?.method === op.method && selectedEndpoint?.path === op.path
                                                    ? 'text-white border border-white/30'
                                                    : op.method === 'get' ? 'text-blue-600 bg-blue-50' :
                                                        op.method === 'post' ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'
                                            )}>
                                                {op.method}
                                            </span>
                                            <span className="font-medium truncate">{op.summary || op.path}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sandbox Testing Section */}
                    <div className="mt-8 px-4 pb-10">
                        <div className="p-5 rounded-2xl bg-gp-cobalt text-white shadow-xl shadow-gp-cobalt/20 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                            <h4 className="font-display font-bold text-xs mb-3 flex items-center gap-2">
                                <TestTube className="h-3.5 w-3.5" />
                                Sandbox Testing
                            </h4>
                            <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                Use our production-mirrored sandbox for risk-free integration.
                            </p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => navigator.clipboard.writeText('sk_sandbox_gp_12345')}
                                    className="w-full text-left bg-white/10 hover:bg-white/20 p-2 rounded-lg border border-white/20 text-[10px] font-mono transition-colors flex justify-between items-center"
                                >
                                    <span>Copy Test Key</span>
                                    <Copy className="h-3 w-3 opacity-50" />
                                </button>
                                <div className="text-[9px] text-white/50 italic text-center">
                                    💡 No real ZMW will be moved
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-6 border-t border-slate-50 bg-slate-50/50">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-gray-500">
                            <Server className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-mono truncate">{host}</span>
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Version {spec.info.version}</div>
                    </div>
                </div>
            </div>

            {/* Main Content - Split Container */}
            <div className="flex-1 flex min-w-0 bg-white">
                {/* Left Column - Documentation Content */}
                <div className="flex-1 border-r border-slate-50 flex flex-col min-w-0">
                    {/* Floating Header */}
                    <div className="border-b border-slate-50 bg-white/80 backdrop-blur-md p-8 sticky top-0 z-20">
                        <div className="max-w-4xl mx-auto flex items-end justify-between">
                            <div>
                                <h1 className="text-display-sm font-display font-bold text-gray-900 mb-2 truncate">{spec.info.title}</h1>
                                <p className="text-gray-500 font-sans text-sm max-w-2xl leading-relaxed">
                                    {spec.info.description}
                                </p>
                            </div>
                            <Button variant="outline" size="sm" onClick={loadDocs} className="h-10 rounded-xl px-4 border-slate-200 hover:bg-slate-50 shadow-sm">
                                <RefreshCw className="mr-2 h-4 w-4 text-gp-sky" />
                                Sync API
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-8 lg:p-12">
                            <div className="max-w-4xl mx-auto space-y-20 pb-20">
                                {/* Quickstart Guide */}
                                <div id="quickstart" className="scroll-mt-32">
                                    <QuickstartGuide />
                                </div>

                                {/* Endpoints Layout */}
                                {filteredTags.map(tag => (
                                    <div key={tag} className="space-y-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <h2 className="text-display-xs font-display font-bold text-gray-900">{tag}</h2>
                                            <div className="h-px flex-1 bg-slate-50" />
                                            <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-100 text-gray-400 px-3">
                                                {groupedPaths[tag].length} Endpoints
                                            </Badge>
                                        </div>

                                        {groupedPaths[tag].map((op: any) => (
                                            <EndpointViewer
                                                key={`${op.method}-${op.path}`}
                                                method={op.method}
                                                path={op.path}
                                                operation={op}
                                                definitions={spec.definitions}
                                                onUpdate={loadDocs}
                                                isPublic={isPublic}
                                                layout="left"
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Column - Code Playground (Desktop Only) */}
                <div className="w-[40rem] flex flex-col bg-slate-50/50 relative">
                    <div className="border-b border-slate-100 bg-white p-6 sticky top-0 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                                <Code className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-gray-900 text-sm tracking-tight">
                                {selectedEndpoint ? `${selectedEndpoint.method.toUpperCase()} ${selectedEndpoint.path}` : 'API Explorer'}
                            </h3>
                        </div>
                        {selectedEndpoint && (
                            <Badge variant="outline" className="bg-slate-50 border-slate-100 text-gray-400 font-mono text-[10px]">
                                {selectedEndpoint.method.toUpperCase()}
                            </Badge>
                        )}
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-8">
                            {selectedEndpoint ? (
                                <EndpointViewer
                                    method={selectedEndpoint.method}
                                    path={selectedEndpoint.path}
                                    operation={selectedEndpoint.operation}
                                    definitions={spec.definitions}
                                    onUpdate={loadDocs}
                                    isPublic={isPublic}
                                    layout="right"
                                />
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[60vh] flex flex-col items-center justify-center text-center p-12"
                                >
                                    <div className="h-20 w-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 text-slate-200">
                                        <Code className="h-10 w-10" />
                                    </div>
                                    <h4 className="font-display font-bold text-gray-900 mb-2">Ready to explore?</h4>
                                    <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                                        Select an endpoint from the sidebar to view code examples, response models, and authentication details.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};
