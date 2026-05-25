'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useOpenAPISpec } from './hooks/useOpenAPISpec';
import { useSearch } from './hooks/useSearch';
import { SearchBar } from './components/SearchBar';
import { EndpointCard } from './components/EndpointCard';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function ApiDocsPage() {
  const { spec, endpoints, loading, error } = useOpenAPISpec();
  const { search } = useSearch(endpoints);
  const [searchQuery, setSearchQuery] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  const filteredEndpoints = search(searchQuery);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-gp-cobalt-600 mx-auto animate-spin" />
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6" />
            <h2 className="font-semibold">Failed to Load Documentation</h2>
          </div>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500">
            Make sure the backend API is running at http://localhost:8080
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gp-cobalt-600 text-white rounded-lg hover:bg-gp-cobalt-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!spec) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gp-cobalt-600 to-gp-sky-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-display text-lg font-bold">API</span>
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-gp-cobalt-900">
                  {spec.info.title}
                </h1>
                <p className="text-sm text-gray-600">v{spec.info.version}</p>
              </div>
            </div>

            {spec.info.description && (
              <p className="text-gray-600 text-sm mt-2">{spec.info.description}</p>
            )}

            {spec.info.contact && (
              <div className="text-xs text-gray-500 space-y-1 mt-3">
                {spec.info.contact.name && <p>📧 Contact: {spec.info.contact.name}</p>}
                {spec.info.contact.email && <p>📬 Email: {spec.info.contact.email}</p>}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
        >
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search */}
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search endpoints..."
            />

            {/* Auth Token */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
              <button
                onClick={() => setShowTokenInput(!showTokenInput)}
                className="w-full px-3 py-2 text-sm font-medium text-gp-cobalt-600 hover:bg-gp-cobalt-50 rounded-lg transition-colors"
              >
                {showTokenInput ? '✕ Hide Token' : '🔑 Add Auth Token'}
              </button>

              {showTokenInput && (
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  placeholder="Bearer token"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gp-sky-500 focus:border-transparent outline-none"
                />
              )}
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-2">
              <div className="text-sm">
                <p className="text-gray-600">Endpoints</p>
                <p className="text-2xl font-bold text-gp-cobalt-700">{endpoints.length}</p>
              </div>
              <div className="text-xs text-gray-500">
                Showing {filteredEndpoints.length}
              </div>
            </div>

            {/* Tags */}
            {endpoints.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
                <div className="space-y-2 text-xs">
                  {Array.from(
                    new Set(endpoints.flatMap((e) => e.tags || []))
                  ).map((tag) => (
                    <div key={tag} className="text-gray-600">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Endpoints */}
          <div className="lg:col-span-3">
            {filteredEndpoints.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500">
                  {searchQuery
                    ? 'No endpoints match your search'
                    : 'No endpoints found'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredEndpoints.map((endpoint) => (
                  <motion.div key={endpoint.id} variants={itemVariants}>
                    <EndpointCard endpoint={endpoint} authToken={authToken} baseUrl={baseUrl} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
