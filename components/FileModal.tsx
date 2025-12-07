import React, { useState } from 'react';
import { X, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { FileRecord } from '../types';

interface FileModalProps {
  files: FileRecord[];
  initialIndex?: number;
  onClose: () => void;
}

export const FileModal: React.FC<FileModalProps> = ({ files, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentFile = files[currentIndex];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentFile.data;
    link.download = currentFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
      >
        <X size={24} />
      </button>

      <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-transparent relative">
        {/* Navigation Buttons */}
        {files.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={handleNext}
              disabled={currentIndex === files.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-3 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}

        {/* Content Viewer */}
        <div className="flex-1 min-h-0 bg-slate-900/50 rounded-lg overflow-hidden relative flex items-center justify-center border border-white/10 mx-12">
          {currentFile.type.includes('image') ? (
            <img 
              src={currentFile.data} 
              alt={currentFile.name} 
              className="max-w-full max-h-full object-contain"
            />
          ) : (
             <iframe 
               src={currentFile.data} 
               className="w-full h-full bg-white" 
               title="PDF Viewer"
             />
          )}
        </div>

        {/* Footer / Controls */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white px-12">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full md:max-w-[60%] py-2 scrollbar-hide">
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden relative transition-all ${
                  idx === currentIndex ? 'border-primary scale-110' : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
                }`}
              >
                {file.type.includes('image') ? (
                  <img src={file.data} className="w-full h-full object-cover" alt="thumb" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 shrink-0">
             <div className="text-sm text-white/60 font-medium">
                {currentIndex + 1} / {files.length}
             </div>
             <button
               onClick={handleDownload}
               className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-transform active:scale-95 shadow-lg shadow-primary/20"
             >
               <Download size={18} />
               下载此化验单
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
