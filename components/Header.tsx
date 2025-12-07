import React from 'react';
import { Activity, History, PlusCircle } from 'lucide-react';
import { AppView } from '../types';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate(AppView.UPLOAD)}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Activity size={20} />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            化验单
          </h1>
        </div>

        <nav className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => onNavigate(AppView.UPLOAD)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === AppView.UPLOAD 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <PlusCircle size={16} />
            <span>新咨询</span>
          </button>
          <button
            onClick={() => onNavigate(AppView.HISTORY)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === AppView.HISTORY || currentView === AppView.DETAILS
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <History size={16} />
            <span>历史记录</span>
          </button>
        </nav>
      </div>
    </header>
  );
};