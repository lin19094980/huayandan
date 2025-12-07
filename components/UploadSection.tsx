import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2, Activity, User, Calendar, Stethoscope } from 'lucide-react';
import { FileRecord, PatientInfo } from '../types';

interface UploadSectionProps {
  onAnalyze: (files: FileRecord[], patientInfo: PatientInfo) => void;
  isAnalyzing: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Patient Info State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: FileRecord[] = [];
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB limit per file for client performance
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > MAX_SIZE) {
        setError(`文件 ${file.name} 太大。请上传小于 4MB 的文件。`);
        continue;
      }

      try {
        const base64 = await readFileAsBase64(file);
        newFiles.push({
          name: file.name,
          type: file.type,
          data: base64
        });
      } catch (e) {
        console.error("Error reading file", e);
        setError("读取文件失败，请重试。");
      }
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
    setError(null);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = () => {
    if (selectedFiles.length === 0) return;
    
    const patientInfo: PatientInfo = {
      name: name.trim() || undefined,
      age: age.trim() || undefined,
      gender: gender || undefined,
      diagnosis: diagnosis.trim() || undefined
    };

    onAnalyze(selectedFiles, patientInfo);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User size={20} className="text-primary" />
          基本信息 (可选)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">姓名</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">年龄</label>
            <input 
              type="text" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="例如: 35"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">性别</label>
            <div className="flex gap-4 h-[42px] items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value="男" 
                  checked={gender === '男'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-slate-700">男</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="gender" 
                  value="女" 
                  checked={gender === '女'}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <span className="text-slate-700">女</span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">临床诊断 / 症状描述</label>
          <textarea 
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="例如：发烧两天，或者医生诊断为支气管炎..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">上传化验单</h2>
        <p className="text-sm text-slate-500">支持图片 (JPG, PNG) 或 PDF 格式</p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] ${
          isAnalyzing ? 'bg-slate-50 border-slate-200' : 'bg-white border-primary/30 hover:border-primary/60 hover:bg-primary/5'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          accept="image/*,application/pdf"
          multiple
          disabled={isAnalyzing}
        />
        
        <div className="flex flex-col items-center pointer-events-none">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
            <Upload size={24} />
          </div>
          <p className="text-base font-medium text-slate-700">点击上传或拖拽文件至此</p>
          <p className="text-xs text-slate-400 mt-1">支持多张上传</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
           <span className="mr-2">⚠️</span> {error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">已选文件 ({selectedFiles.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="relative group flex items-center p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center mr-3 text-slate-500 shrink-0">
                  {file.type.includes('pdf') ? <FileText size={16} /> : <ImageIcon size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{file.type.split('/')[1]}</p>
                </div>
                {!isAnalyzing && (
                  <button 
                    onClick={() => removeFile(idx)}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleStartAnalysis}
          disabled={selectedFiles.length === 0 || isAnalyzing}
          className={`
            w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-lg flex items-center justify-center gap-2
            transition-all duration-200 shadow-lg shadow-primary/20
            ${selectedFiles.length === 0 || isAnalyzing
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-primary hover:bg-primary/90 text-white transform hover:-translate-y-0.5'
            }
          `}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>智能分析中...</span>
            </>
          ) : (
            <>
              <Activity size={20} />
              <span>开始解读</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};