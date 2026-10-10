import React from 'react';
import { Home, Dumbbell, TrendingUp, BookOpen, User } from 'lucide-react';
import { soundFx } from '../utils/audio';

export type TabType = 'home' | 'routines' | 'progress' | 'exercises' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  hasActiveWorkout?: boolean;
  onOpenActiveWorkout?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  hasActiveWorkout = false,
  onOpenActiveWorkout
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Início', icon: Home },
    { id: 'routines' as TabType, label: 'Treinos', icon: Dumbbell },
    { id: 'progress' as TabType, label: 'Progresso', icon: TrendingUp },
    { id: 'exercises' as TabType, label: 'Exercícios', icon: BookOpen },
    { id: 'profile' as TabType, label: 'Perfil', icon: User },
  ];

  const handleTabClick = (tabId: TabType) => {
    soundFx.playTick();
    onSelectTab(tabId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5 px-2 py-1.5 max-w-lg mx-auto">
      {/* If an active workout is in background, show quick resume banner right above the nav */}
      {hasActiveWorkout && onOpenActiveWorkout && (
        <div 
          onClick={onOpenActiveWorkout}
          className="mb-1.5 mx-2 bg-gradient-to-r from-[#00D1C1]/20 via-[#00D1C1]/10 to-transparent border border-[#00D1C1]/40 rounded-2xl p-2.5 flex items-center justify-between cursor-pointer hover:border-[#00D1C1] transition-all shadow-lg shadow-[#00D1C1]/10"
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D1C1] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D1C1]"></span>
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              TREINO EM ANDAMENTO
            </span>
          </div>
          <span className="text-xs font-bold text-[#00D1C1] flex items-center gap-1 bg-[#00D1C1]/10 px-2 py-0.5 rounded-lg border border-[#00D1C1]/30">
            VOLTAR AO TREINO →
          </span>
        </div>
      )}

      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#00D1C1] font-bold scale-105'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative p-1">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(0,209,193,0.6)]' : 'stroke-[1.75px]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00D1C1] shadow-[0_0_6px_#00D1C1]" />
                )}
              </div>
              <span className={`text-[11px] tracking-tight mt-0.5 ${isActive ? 'font-black text-[#00D1C1]' : 'font-medium text-neutral-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
