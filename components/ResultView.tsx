import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisRecord } from '../types';
import { ArrowLeft, Calendar, FileText, User, Download } from 'lucide-react';
import { FileModal } from './FileModal';

interface ResultViewProps {
  record: AnalysisRecord;
  onBack: () => void;
  isHistoryView?: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({ record, onBack, isHistoryView }) => {
  const [showFileModal, setShowFileModal] = useState(false);
  const [initialFileIndex, setInitialFileIndex] = useState(0);

  const hasPatientInfo = record.patientInfo && (
    record.patientInfo.name || 
    record.patientInfo.age || 
    record.patientInfo.gender || 
    record.patientInfo.diagnosis
  );

  const handleThumbnailClick = (index: number) => {
    setInitialFileIndex(index);
    setShowFileModal(true);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          返回
        </button>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">化验单解读报告</h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(record.timestamp).toLocaleString('zh-CN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={14} />
                    {record.files.length} 个文件
                  </span>
                </div>
                
                {hasPatientInfo && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100/50 inline-block">
                     <div className="flex items-start gap-2 text-sm text-slate-700">
                        <User size={16} className="mt-0.5 text-primary shrink-0" />
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {record.patientInfo?.name && <span><span className="text-slate-500">姓名:</span> {record.patientInfo.name}</span>}
                          {record.patientInfo?.gender && <span><span className="text-slate-500">性别:</span> {record.patientInfo.gender}</span>}
                          {record.patientInfo?.age && <span><span className="text-slate-500">年龄:</span> {record.patientInfo.age}</span>}
                          {record.patientInfo?.diagnosis && (
                            <div className="w-full mt-1 border-t border-slate-200/50 pt-1">
                               <span className="text-slate-500">诊断/主诉:</span> {record.patientInfo.diagnosis}
                            </div>
                          )}
                        </div>
                     </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Preview Grid - Clickable */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex -space-x-3 shrink-0 pt-1">
                  {record.files.map((file, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleThumbnailClick(idx)}
                      className="relative w-16 h-16 rounded-lg border-2 border-white shadow-md overflow-hidden bg-white hover:scale-110 transition-transform cursor-pointer group"
                      title="点击查看大图"
                    >
                      {file.type.includes('image') ? (
                        <img src={file.data} alt="thumb" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                          <FileText size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
                <button 
                   onClick={() => handleThumbnailClick(0)}
                   className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                >
                  <Download size={12} />
                  下载/查看化验单
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <article className="prose prose-slate prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-slate-900 prose-li:text-slate-600 max-w-none">
              <ReactMarkdown
                components={{
                  h3: ({node, ...props}) => (
                    <h3 className="text-lg font-bold text-primary mt-6 mb-3 flex items-center pb-2 border-b border-slate-100" {...props} />
                  ),
                  strong: ({node, ...props}) => (
                    <strong className="font-semibold text-slate-900 bg-yellow-50 px-1 rounded" {...props} />
                  ),
                  ul: ({node, ...props}) => (
                    <ul className="list-disc pl-5 space-y-2 my-4" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="leading-relaxed" {...props} />
                  )
                }}
              >
                {record.analysisResult}
              </ReactMarkdown>
            </article>
          </div>

          {/* Disclaimer Footer */}
          <div className="bg-orange-50 p-4 border-t border-orange-100 text-orange-800 text-xs text-center">
            免责声明：本报告由人工智能生成，仅供参考，不可作为医疗诊断依据。请务必咨询专业医生。
          </div>
        </div>
      </div>

      {showFileModal && (
        <FileModal 
          files={record.files} 
          initialIndex={initialFileIndex}
          onClose={() => setShowFileModal(false)} 
        />
      )}
    </>
  );
};
