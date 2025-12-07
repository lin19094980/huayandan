import React, { useState, useMemo } from 'react';
import { AnalysisRecord } from '../types';
import { ChevronRight, FileText, Trash2, Eye, AlertTriangle, Search, GitCompare, CheckSquare, Square } from 'lucide-react';
import { FileModal } from './FileModal';

interface HistoryListProps {
  records: AnalysisRecord[];
  onSelectRecord: (record: AnalysisRecord) => void;
  onDeleteRecord: (id: string) => void;
  onCompareRecords: (record1: AnalysisRecord, record2: AnalysisRecord) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ records, onSelectRecord, onDeleteRecord, onCompareRecords }) => {
  const [viewingFilesRecord, setViewingFilesRecord] = useState<AnalysisRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleOpenFile = (e: React.MouseEvent, record: AnalysisRecord) => {
    e.stopPropagation();
    setViewingFilesRecord(record);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteRecord(deleteId);
      setDeleteId(null);
      // Remove from selection if deleted
      if (selectedIds.has(deleteId)) {
        const newSet = new Set(selectedIds);
        newSet.delete(deleteId);
        setSelectedIds(newSet);
      }
    }
  };

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      if (newSet.size >= 2) {
        return; 
      }
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleCompareClick = () => {
    if (selectedIds.size !== 2) return;
    const selectedRecords = records.filter(r => selectedIds.has(r.id));
    if (selectedRecords.length === 2) {
      onCompareRecords(selectedRecords[0], selectedRecords[1]);
    }
  };

  // Filter records based on search
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const lowerTerm = searchTerm.toLowerCase();
    return records.filter(record => 
      (record.summary || '').toLowerCase().includes(lowerTerm) ||
      record.analysisResult.toLowerCase().includes(lowerTerm)
    );
  }, [records, searchTerm]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <FileText size={32} />
        </div>
        <p className="text-lg font-medium text-slate-500">暂无历史记录</p>
        <p className="text-sm">上传的化验单将显示在这里</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800">历史化验单记录</h2>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索检查项目..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            
            <button
              onClick={handleCompareClick}
              disabled={selectedIds.size !== 2}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedIds.size === 2 
                  ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:-translate-y-0.5' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <GitCompare size={16} />
              <span>对比 ({selectedIds.size}/2)</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
             <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <p>没有找到匹配的记录</p>
             </div>
          ) : (
            filteredRecords.map((record) => {
              const isSelected = selectedIds.has(record.id);
              return (
                <div 
                  key={record.id}
                  onClick={() => onSelectRecord(record)}
                  className={`group relative bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${
                    isSelected ? 'border-indigo-400 ring-1 ring-indigo-400 bg-indigo-50/10' : 'border-slate-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for selection */}
                    <div 
                      onClick={(e) => toggleSelection(e, record.id)}
                      className="mt-5 shrink-0 text-slate-300 hover:text-indigo-500 transition-colors cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="text-indigo-600" size={24} />
                      ) : (
                        <Square size={24} />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                       {record.files[0].type.includes('image') ? (
                          <img src={record.files[0].data} alt="preview" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <FileText size={24} />
                          </div>
                       )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[4rem] py-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-slate-800 pr-8 text-lg break-words leading-tight">
                          {record.summary || "化验单解读"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                          {new Date(record.timestamp).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        
                        {/* Lab Report Button */}
                        <button
                          onClick={(e) => handleOpenFile(e, record)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-primary hover:text-white text-slate-600 rounded-full text-xs font-medium transition-colors mr-6 z-10"
                        >
                          <Eye size={12} />
                          <span>{record.files.length > 1 ? `${record.files.length} 张化验单` : '化验单'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-slate-300 group-hover:text-primary transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteClick(e, record.id)}
                    className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="删除记录"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {viewingFilesRecord && (
        <FileModal 
          files={viewingFilesRecord.files} 
          onClose={() => setViewingFilesRecord(null)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setDeleteId(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">删除记录</h3>
                  <p className="text-sm text-slate-500 mt-1">您确定要删除这条化验单记录吗？此操作无法撤销。</p>
                </div>
              </div>
            </div>
            <div className="flex items-center bg-slate-50 p-4 gap-3 border-t border-slate-100">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
