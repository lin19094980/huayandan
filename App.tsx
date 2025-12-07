import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ResultView } from './components/ResultView';
import { HistoryList } from './components/HistoryList';
import { ComparisonView } from './components/ComparisonView';
import { AppView, FileRecord, AnalysisRecord, PatientInfo } from './types';
import { analyzeLabReports, compareLabReports } from './services/geminiService';
import { saveRecord, getAllRecords, deleteRecord } from './services/storage';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<AnalysisRecord | null>(null);
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  
  // Comparison State
  const [comparisonData, setComparisonData] = useState<{
    recordA: AnalysisRecord;
    recordB: AnalysisRecord;
    result: string;
  } | null>(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const records = await getAllRecords();
      setHistory(records);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handleAnalyze = async (files: FileRecord[], patientInfo: PatientInfo) => {
    setIsAnalyzing(true);
    try {
      const resultText = await analyzeLabReports(files, patientInfo);
      
      // Try to extract a summary (Detection Items) from the response
      // Regex looks for "检测项目" followed by colon and text until newline
      const summaryMatch = resultText.match(/检测项目\*\*?[:：]\s*([^\n]+)/);
      const summary = summaryMatch ? summaryMatch[1].trim().replace(/\*\*/g, '') : "化验单解读";

      const newRecord: AnalysisRecord = {
        id: uuidv4(),
        timestamp: Date.now(),
        files: files,
        patientInfo: patientInfo,
        analysisResult: resultText,
        summary: summary // Save extracted summary
      };

      await saveRecord(newRecord);
      await loadHistory(); // Refresh history
      
      setCurrentRecord(newRecord);
      setCurrentView(AppView.DETAILS);
    } catch (error) {
      console.error(error);
      alert("解读失败，请检查网络或重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectRecord = (record: AnalysisRecord) => {
    setCurrentRecord(record);
    setCurrentView(AppView.DETAILS);
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteRecord(id);
    await loadHistory();
    if (currentRecord?.id === id) {
      setCurrentRecord(null);
      setCurrentView(AppView.HISTORY);
    }
  };

  const handleCompareRecords = async (record1: AnalysisRecord, record2: AnalysisRecord) => {
    setIsAnalyzing(true);
    try {
      const result = await compareLabReports(record1, record2);
      setComparisonData({
        recordA: record1,
        recordB: record2,
        result: result
      });
      setCurrentView(AppView.COMPARISON);
    } catch (error) {
      console.error(error);
      alert("对比分析失败，请重试。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderContent = () => {
    if (isAnalyzing && currentView === AppView.HISTORY) {
        // Show full screen loader when analyzing from history page (comparison)
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-primary">
                <Loader2 size={48} className="animate-spin mb-4" />
                <p className="text-lg font-medium">正在对比分析化验单...</p>
            </div>
        );
    }

    switch (currentView) {
      case AppView.UPLOAD:
        return (
          <UploadSection 
            onAnalyze={handleAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
        );
      case AppView.DETAILS:
        if (!currentRecord) return null;
        return (
          <ResultView 
            record={currentRecord} 
            onBack={() => setCurrentView(AppView.HISTORY)} 
          />
        );
      case AppView.HISTORY:
        return (
          <HistoryList 
            records={history} 
            onSelectRecord={handleSelectRecord}
            onDeleteRecord={handleDeleteRecord}
            onCompareRecords={handleCompareRecords}
          />
        );
      case AppView.COMPARISON:
        if (!comparisonData) return null;
        return (
          <ComparisonView
            recordA={comparisonData.recordA}
            recordB={comparisonData.recordB}
            comparisonResult={comparisonData.result}
            onBack={() => setCurrentView(AppView.HISTORY)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header 
        currentView={currentView} 
        onNavigate={(view) => setCurrentView(view)} 
      />
      
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {renderContent()}
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} 化验单 AI 助手</p>
      </footer>
    </div>
  );
};

export default App;