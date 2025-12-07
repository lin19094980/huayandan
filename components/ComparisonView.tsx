import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisRecord } from '../types';
import { ArrowLeft, GitCompare, Calendar, FileText } from 'lucide-react';

interface ComparisonViewProps {
  recordA: AnalysisRecord;
  recordB: AnalysisRecord;
  comparisonResult: string;
  onBack: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ recordA, recordB, comparisonResult, onBack }) => {
  // Sort chronologically for display headers (Older -> Newer usually makes more sense for comparison)
  const [older, newer] = recordA.timestamp < recordB.timestamp ? [recordA, recordB] : [recordB, recordA];

  const RecordHeaderCard = ({ record, label }: { record: AnalysisRecord, label: string }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex-1">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="font-semibold text-slate-800 mb-2 truncate" title={record.summary}>
        {record.summary || "化验单"}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(record.timestamp).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <FileText size={12} />
          {record.files.length} 文件
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in zoom-in-95 duration-300">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={18} className="mr-1" />
        返回列表
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <GitCompare size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">对比分析报告</h2>
          <p className="text-slate-500 text-sm">智能分析两份化验单之间的关键变化</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <RecordHeaderCard record={older} label="早期记录" />
        <div className="hidden md:flex items-center justify-center text-slate-300">
          <ArrowLeft className="rotate-180" size={24} />
        </div>
        <RecordHeaderCard record={newer} label="近期记录" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden">
        <div className="p-8">
          <article className="prose prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-indigo-700 prose-li:text-slate-600 max-w-none">
            <ReactMarkdown
              components={{
                h3: ({node, ...props}) => (
                  <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3 flex items-center pb-2 border-b border-slate-100" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="font-semibold" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="leading-relaxed mb-1" {...props} />
                )
              }}
            >
              {comparisonResult}
            </ReactMarkdown>
          </article>
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-slate-500 text-xs text-center">
            AI对比分析仅供参考，请以医生专业诊断为准。
        </div>
      </div>
    </div>
  );
};