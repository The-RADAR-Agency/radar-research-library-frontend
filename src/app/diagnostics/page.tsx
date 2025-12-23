// src/app/diagnostics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

type DiagnosticResult = {
  table: string;
  status: 'success' | 'error' | 'empty';
  rowCount: number;
  error?: string;
  errorCode?: string;
  errorDetails?: string;
  sampleRow?: any;
};

export default function DiagnosticsPage() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [envCheck, setEnvCheck] = useState<{ url: string; hasKey: boolean } | null>(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    setLoading(true);

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setEnvCheck({
      url: supabaseUrl,
      hasKey: !!supabaseKey,
    });

    const tablesToTest = [
      'source_documents',
      'drivers',
      'trends',
      'signals',
      'evidence',
      'topics',
      'categories',
      'steep_categories',
      'geographical_focus',
      'hubspot_industries',
    ];

    const diagnosticResults: DiagnosticResult[] = [];

    for (const table of tablesToTest) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          diagnosticResults.push({
            table,
            status: 'error',
            rowCount: 0,
            error: error.message,
            errorCode: error.code,
            errorDetails: error.details,
          });
        } else if (!data || data.length === 0) {
          diagnosticResults.push({
            table,
            status: 'empty',
            rowCount: count || 0,
          });
        } else {
          diagnosticResults.push({
            table,
            status: 'success',
            rowCount: count || data.length,
            sampleRow: data[0],
          });
        }
      } catch (e: any) {
        diagnosticResults.push({
          table,
          status: 'error',
          rowCount: 0,
          error: e.message || 'Unknown error',
        });
      }
    }

    setResults(diagnosticResults);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 RADAR Database Diagnostics</h1>

        {/* Environment Check */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className="text-blue-600">{envCheck?.url || 'Checking...'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className={envCheck?.hasKey ? 'text-green-600' : 'text-red-600'}>
                {envCheck?.hasKey ? '✓ Set' : '✗ NOT SET'}
              </span>
            </div>
          </div>
        </div>

        {/* Database Tables */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Database Tables</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Running diagnostics...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.table}
                  className={`border rounded-lg p-4 ${
                    result.status === 'success'
                      ? 'border-green-300 bg-green-50'
                      : result.status === 'empty'
                      ? 'border-yellow-300 bg-yellow-50'
                      : 'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-mono font-semibold">{result.table}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            result.status === 'success'
                              ? 'bg-green-600 text-white'
                              : result.status === 'empty'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {result.status === 'success'
                            ? `✓ ${result.rowCount} rows`
                            : result.status === 'empty'
                            ? '⚠ EMPTY'
                            : '✗ ERROR'}
                        </span>
                      </div>

                      {result.error && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-semibold text-red-700">Error:</p>
                          <p className="text-sm text-red-600">{result.error}</p>
                          {result.errorCode && (
                            <p className="text-xs text-red-500 font-mono">Code: {result.errorCode}</p>
                          )}
                          {result.errorDetails && (
                            <p className="text-xs text-red-500">{result.errorDetails}</p>
                          )}
                        </div>
                      )}

                      {result.sampleRow && (
                        <details className="mt-2">
                          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                            View sample row
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                            {JSON.stringify(result.sampleRow, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {results.filter((r) => r.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Working</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {results.filter((r) => r.status === 'empty').length}
                </div>
                <div className="text-sm text-gray-600">Empty</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {results.filter((r) => r.status === 'error').length}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                {results.some((r) => r.status === 'error') && (
                  <li>• <strong>Fix RLS Policies:</strong> Tables showing errors likely have Row Level Security blocking access</li>
                )}
                {results.some((r) => r.status === 'empty') && (
                  <li>• <strong>Add Data:</strong> Tables showing empty need data to be imported</li>
                )}
                {results.every((r) => r.status === 'success') && (
                  <li>✓ All tables accessible and have data! The issue might be in data mapping logic.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={runDiagnostics}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            🔄 Re-run Diagnostics
          </button>
          <a
            href="/library"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            ← Back to Library
          </a>
        </div>
      </div>
    </div>
  );
}
