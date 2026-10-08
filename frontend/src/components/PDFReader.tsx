'use client';

import { useEffect, useState } from 'react';
import { TORContract } from '@/types';
import { useLanguage } from '@/lib/LanguageProvider';
import { resolveApiUrl } from '@/lib/api';
import { Download, ExternalLink, Loader2, FileText } from 'lucide-react';

interface DocumentPreviewProps {
  contract: TORContract;
  onDownload: () => void;
}

export function DocumentPreview({ contract, onDownload }: DocumentPreviewProps) {
  const { t } = useLanguage();
  const sourceUrl = contract.documentUrl || contract.url;
  const previewUrl = sourceUrl ? resolveApiUrl(`/api/tors/documents/${encodeURIComponent(contract.projectId)}?document=${encodeURIComponent(sourceUrl)}`) : null;
  const [loading, setLoading] = useState(Boolean(previewUrl));
  const [failed, setFailed] = useState(false);
  useEffect(() => { setLoading(Boolean(previewUrl)); setFailed(false); }, [previewUrl]);
  let externalUrl: string | null = null;
  try {
    const source = new URL(sourceUrl || '');
    if (source.protocol === 'https:' || source.protocol === 'http:') externalUrl = source.href;
  } catch { /* A missing or invalid source URL has no external link. */ }

  return <section className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 min-w-0 text-sm">
        <FileText className="w-4 h-4 shrink-0 text-sky-600" />
        <span className="font-semibold">{t('Document preview')}</span>
        <span className="text-xs text-slate-500 font-mono truncate">{contract.projectId}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {externalUrl && <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sky-600 hover:underline"><ExternalLink className="w-4 h-4" />{t('Open original document')}</a>}
        <button onClick={onDownload} disabled={!previewUrl} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 bg-sky-600 text-white disabled:opacity-40"><Download className="w-4 h-4" />{t('Download document')}</button>
      </div>
    </div>
    {!previewUrl ? <p className="p-8 text-center text-sm text-slate-500">{t('No source document is available for this project.')}</p> : <>
      {loading && <p role="status" className="flex justify-center items-center gap-2 p-3 text-sm text-slate-500"><Loader2 className="w-4 h-4 animate-spin" />{t('Loading document...')}</p>}
      {failed && <p role="alert" className="p-4 text-sm text-rose-600">{t('The preview could not be loaded. Try opening the original document.')}</p>}
      <iframe key={previewUrl} src={previewUrl} title={`${t('Document preview')}: ${contract.title}`}
        onLoad={() => setLoading(false)} onError={() => { setLoading(false); setFailed(true); }}
        referrerPolicy="no-referrer" className="block w-full h-[70vh] min-h-[420px] bg-white border-0" />
      <p className="px-4 py-3 text-xs text-slate-500">{t('PDF and HTML documents are supported. If the preview is unavailable, open or download the original document.')}</p>
    </>}
  </section>;
}
