import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Layers, 
  Zap, 
  Shield, 
  Flame, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  BookOpen,
  ArrowRight,
  X
} from 'lucide-react';
import { MOBILITY_CATEGORIES, MOBILITY_TIPS_DATA, MobilityCategory, MobilityTip } from '../data/mobilityTips';
import { soundFx } from '../utils/audio';

export const MobilityTipsSection: React.FC = () => {
  // Minimized by default: shows only the featured tip + 'Mais Dicas' button
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<MobilityCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipModal, setSelectedTipModal] = useState<MobilityTip | null>(null);
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);

  // Pick a tip of the day or rotate
  const featuredTip = MOBILITY_TIPS_DATA[featuredIndex % MOBILITY_TIPS_DATA.length];

  const handleNextFeatured = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFeaturedIndex((prev) => (prev + 1) % MOBILITY_TIPS_DATA.length);
    soundFx.playTick();
  };

  // Quick Mobility Timer State
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Filter tips
  const filteredTips = MOBILITY_TIPS_DATA.filter((tip) => {
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      tip.title.toLowerCase().includes(query) ||
      tip.targetBenefit.toLowerCase().includes(query) ||
      tip.idealFor.toLowerCase().includes(query) ||
      tip.categoryLabel.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Timer handlers
  const handleStartTimer = (seconds: number) => {
    setActiveTimerSeconds(seconds);
    setIsTimerRunning(true);
    soundFx.playTick();
  };

  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
    soundFx.playTick();
  };

  const handleResetTimer = (defaultSec: number) => {
    setIsTimerRunning(false);
    setActiveTimerSeconds(defaultSec);
    soundFx.playTick();
  };

  useEffect(() => {
    if (isTimerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        setActiveTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current as NodeJS.Timeout);
            setIsTimerRunning(false);
            soundFx.playCelebration();
            return 0;
          }
          if (prev <= 4) {
            soundFx.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeTimerSeconds]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quadris':
        return <Layers size={14} className="text-[#00D1C1]" />;
      case 'joelhos':
        return <Zap size={14} className="text-amber-400" />;
      case 'ombros':
        return <Shield size={14} className="text-indigo-400" />;
      case 'tornozelos':
        return <Flame size={14} className="text-rose-400" />;
      case 'coluna':
        return <Activity size={14} className="text-emerald-400" />;
      default:
        return <Sparkles size={14} className="text-[#00D1C1]" />;
    }
  };

  return (
    <div id="mobility-tips-section" className="bg-[#161616] border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 flex items-center justify-center text-[#00D1C1]">
            <BookOpen size={17} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              Dicas & Mobilidade
              <span className="text-[10px] font-black font-mono-numbers px-2 py-0.5 rounded-full bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30">
                {MOBILITY_TIPS_DATA.length} guias
              </span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              Aquecimento, prevenção e amplitude articular
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsFullViewOpen((prev) => !prev);
            soundFx.playTick();
          }}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            isFullViewOpen
              ? 'bg-[#222222] text-neutral-300 border-white/10 hover:text-white'
              : 'bg-[#00D1C1] text-black border-[#00D1C1] font-black shadow-md shadow-[#00D1C1]/20 active:scale-95'
          }`}
          title={isFullViewOpen ? 'Recolher quadro' : 'Ver todas as dicas'}
        >
          <span>{isFullViewOpen ? 'Menos Dicas' : 'Mais Dicas'}</span>
          {isFullViewOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* MINIMIZED VIEW: Single Featured Tip Card */}
      {!isFullViewOpen && (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-3.5 hover:border-[#00D1C1]/30 transition-all space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20 flex items-center gap-1">
                {getCategoryIcon(featuredTip.category)}
                DICA EM DESTAQUE • {featuredTip.categoryLabel.toUpperCase()}
              </span>
              <span className="text-[10px] font-medium text-neutral-400 bg-black/40 px-2 py-0.5 rounded">
                {featuredTip.difficulty}
              </span>
            </div>

            <button
              onClick={handleNextFeatured}
              className="text-[11px] text-neutral-400 hover:text-[#00D1C1] font-bold flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
              title="Sortear outra dica"
            >
              <RotateCcw size={11} />
              <span>Outra Dica</span>
            </button>
          </div>

          <div>
            <h4 className="font-black text-white text-sm">
              {featuredTip.title}
            </h4>
            <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
              {featuredTip.targetBenefit}
            </p>
          </div>

          {/* Quick Action bar */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <Clock size={12} className="text-[#00D1C1]" />
              {featuredTip.suggestedProtocol}
            </span>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => setSelectedTipModal(featuredTip)}
                className="py-1 px-2.5 bg-[#222222] hover:bg-[#2c2c2c] text-white text-[11px] font-bold rounded-lg border border-white/10 flex items-center gap-1 transition-colors"
              >
                <Info size={12} className="text-[#00D1C1]" />
                Ver Instruções
              </button>

              <button
                onClick={() => {
                  setIsFullViewOpen(true);
                  soundFx.playTick();
                }}
                className="py-1 px-2.5 bg-[#00D1C1]/15 hover:bg-[#00D1C1]/25 text-[#00D1C1] text-[11px] font-bold rounded-lg border border-[#00D1C1]/30 flex items-center gap-1 transition-colors"
              >
                <span>Explorar Todas ({MOBILITY_TIPS_DATA.length})</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL EXPANDED VIEW: Complete Joint Category Board & Search */}
      {isFullViewOpen && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
            <input
              type="text"
              placeholder="Buscar por articulação, benefício ou exercício..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0E0E0E] text-xs text-white placeholder-neutral-500 rounded-2xl pl-9 pr-3.5 py-2.5 border border-white/10 focus:outline-none focus:border-[#00D1C1]/60 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Joint Categories Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {MOBILITY_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    soundFx.playTick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-[#00D1C1] text-black border-[#00D1C1] shadow-md shadow-[#00D1C1]/20 font-black'
                      : 'bg-[#222222] text-neutral-300 border-white/5 hover:bg-[#2a2a2a] hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tips List */}
          <div className="space-y-2.5">
            {filteredTips.length === 0 ? (
              <div className="bg-[#0E0E0E] border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs text-neutral-400">
                Nenhuma dica encontrada para "{searchQuery}".
              </div>
            ) : (
              filteredTips.map((tip) => {
                const isExpanded = expandedTipId === tip.id;

                return (
                  <div
                    key={tip.id}
                    className="bg-[#0E0E0E] border border-white/5 hover:border-white/15 rounded-2xl p-3.5 transition-all shadow-md"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                            {getCategoryIcon(tip.category)}
                            {tip.categoryLabel}
                          </span>
                          <span className="text-[10px] font-medium text-neutral-400 bg-black/40 px-2 py-0.5 rounded">
                            {tip.difficulty}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm hover:text-[#00D1C1] transition-colors">
                          {tip.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                          {tip.targetBenefit}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedTipModal(tip)}
                          className="p-2 text-xs font-bold text-[#00D1C1] bg-[#00D1C1]/10 hover:bg-[#00D1C1]/20 rounded-xl border border-[#00D1C1]/25 flex items-center gap-1 transition-colors"
                          title="Abrir guia completo com timer"
                        >
                          <Info size={14} />
                        </button>
                        <button
                          onClick={() => setExpandedTipId(isExpanded ? null : tip.id)}
                          className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Protocol Pill */}
                    <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 flex-wrap gap-2">
                      <span className="flex items-center gap-1 font-mono-numbers">
                        <Clock size={13} className="text-[#00D1C1]" />
                        <strong>Protocolo:</strong> {tip.suggestedProtocol}
                      </span>
                    </div>

                    {/* Inline Expand Details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-in fade-in text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-[#00D1C1] uppercase tracking-wider block mb-1">
                            Como Executar Passo a Passo:
                          </span>
                          <ol className="space-y-1.5 pl-4 list-decimal text-neutral-300">
                            {tip.steps.map((step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed pl-1">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Pro Tip Box */}
                        <div className="p-2.5 rounded-xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 text-[#00D1C1] text-xs flex items-start gap-2">
                          <Sparkles size={15} className="shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Dica de Ouro: </span>
                            <span className="text-neutral-200">{tip.proTip}</span>
                          </div>
                        </div>

                        {/* Mistakes Box */}
                        {tip.commonMistakes.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                            <span className="font-bold flex items-center gap-1">
                              <AlertTriangle size={13} />
                              Erros comuns a evitar:
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5 text-neutral-300 text-[11px]">
                              {tip.commonMistakes.map((m, mIdx) => (
                                <li key={mIdx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Full Detail Modal with Interactive Timer */}
      {selectedTipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 my-auto animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                    {getCategoryIcon(selectedTipModal.category)}
                    {selectedTipModal.categoryLabel}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 bg-black/40 px-2 py-0.5 rounded">
                    {selectedTipModal.difficulty}
                  </span>
                </div>
                <h3 className="font-black text-white text-base leading-tight">
                  {selectedTipModal.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  setSelectedTipModal(null);
                  setIsTimerRunning(false);
                  setActiveTimerSeconds(null);
                }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Target Benefit & When to Use */}
            <div className="p-3 bg-[#0E0E0E] rounded-2xl border border-white/5 space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Benefício Principal:
                </span>
                <p className="text-white font-medium mt-0.5">{selectedTipModal.targetBenefit}</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Ideal Antes De:
                </span>
                <p className="text-[#00D1C1] font-medium mt-0.5">{selectedTipModal.idealFor}</p>
              </div>
            </div>

            {/* Interactive Timer (if applicable) */}
            {selectedTipModal.defaultTimerSeconds && (
              <div className="p-3.5 bg-[#202020] rounded-2xl border border-[#00D1C1]/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    Cronômetro Isométrico
                  </span>
                  <p className="text-xl font-black font-mono-numbers text-white mt-0.5">
                    {activeTimerSeconds !== null
                      ? `${activeTimerSeconds}s`
                      : `${selectedTipModal.defaultTimerSeconds}s`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeTimerSeconds === null ? (
                    <button
                      onClick={() => handleStartTimer(selectedTipModal.defaultTimerSeconds!)}
                      className="py-2 px-3.5 bg-[#00D1C1] hover:bg-[#15e8d7] text-black text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-[#00D1C1]/20 active:scale-95"
                    >
                      <Play size={14} fill="currentColor" />
                      Iniciar {selectedTipModal.defaultTimerSeconds}s
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleToggleTimer}
                        className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center gap-1 ${
                          isTimerRunning ? 'bg-amber-500 text-black' : 'bg-[#00D1C1] text-black'
                        }`}
                      >
                        {isTimerRunning ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                        {isTimerRunning ? 'Pausar' : 'Continuar'}
                      </button>
                      <button
                        onClick={() => handleResetTimer(selectedTipModal.defaultTimerSeconds!)}
                        className="p-2 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl"
                        title="Reiniciar"
                      >
                        <RotateCcw size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step by step */}
            <div className="space-y-2">
              <span className="text-[11px] font-black text-[#00D1C1] uppercase tracking-wider block">
                Instruções de Execução:
              </span>
              <div className="space-y-2 bg-[#0E0E0E] p-3 rounded-2xl border border-white/5">
                {selectedTipModal.steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-200">
                    <span className="w-5 h-5 rounded-full bg-[#222222] text-[#00D1C1] font-mono-numbers font-black flex items-center justify-center shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <p className="flex-1 leading-relaxed">{st}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip */}
            <div className="p-3 rounded-2xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 text-xs">
              <div className="flex items-center gap-1.5 text-[#00D1C1] font-bold mb-1">
                <Sparkles size={14} />
                <span>Recomendação Profissional</span>
              </div>
              <p className="text-neutral-300 leading-relaxed">{selectedTipModal.proTip}</p>
            </div>

            {/* Close Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedTipModal(null);
                  setIsTimerRunning(false);
                  setActiveTimerSeconds(null);
                }}
                className="w-full py-2.5 bg-[#222222] hover:bg-[#2c2c2c] text-white font-bold text-xs rounded-2xl border border-white/10 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
