import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Share2, 
  Check, 
  Sparkles, 
  Calendar, 
  Trophy, 
  Flame, 
  Clock, 
  ChevronRight,
  TrendingUp,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompletedWorkout, CardioSession } from '../types';
import { formatWorkoutDuration } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { vibration } from '../utils/vibrationWrapper';
import { 
  calculateMonthlyWrappedData, 
  getAvailableMonths, 
  generateMonthlyWrappedShareText, 
  renderMonthlyWrappedCardToCanvas,
  MonthlyWrappedData
} from '../utils/monthlyWrappedGenerator';

interface MonthlyWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CompletedWorkout[];
  cardioSessions?: CardioSession[];
  athleteName?: string;
  accentHex?: string;
}

export const MonthlyWrappedModal: React.FC<MonthlyWrappedModalProps> = ({
  isOpen,
  onClose,
  history,
  cardioSessions = [],
  athleteName = 'Atleta Thunder',
  accentHex = '#00D1C1'
}) => {
  const availableMonths = useMemo(() => getAvailableMonths(history), [history]);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    availableMonths[0]?.key || new Date().toISOString().slice(0, 7)
  );

  const [activeTab, setActiveTab] = useState<'card' | 'text'>('card');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Sync selectedMonthKey when availableMonths updates
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.some((m) => m.key === selectedMonthKey)) {
      setSelectedMonthKey(availableMonths[0].key);
    }
  }, [availableMonths, selectedMonthKey]);

  // Compute wrapped stats for selected month
  const wrappedData: MonthlyWrappedData = useMemo(() => {
    return calculateMonthlyWrappedData(history, selectedMonthKey, cardioSessions);
  }, [history, selectedMonthKey, cardioSessions]);

  const shareText = useMemo(() => {
    return generateMonthlyWrappedShareText(wrappedData, athleteName);
  }, [wrappedData, athleteName]);

  // Trigger celebration confetti on opening
  useEffect(() => {
    if (isOpen) {
      soundFx.playCelebration();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
          colors: [accentHex, '#8B5CF6', '#F59E0B', '#FFFFFF', '#10B981']
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen, accentHex]);

  if (!isOpen) return null;

  // Handler: Copy image to clipboard
  const handleCopyImage = async () => {
    soundFx.playTick();
    setIsGeneratingImage(true);
    try {
      const canvas = await renderMonthlyWrappedCardToCanvas(wrappedData, athleteName, accentHex);
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob generation failed');
        if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          soundFx.playSuccess();
          vibration.trigger([100, 50, 100]);
          setCopyStatus('Imagem copiada para a área de transferência!');
        } else {
          // Fallback to download
          handleDownloadImage();
          setCopyStatus('Download iniciado!');
        }
        setIsGeneratingImage(false);
        setTimeout(() => setCopyStatus(null), 3500);
      }, 'image/png');
    } catch (err) {
      console.error('Error copying image:', err);
      setIsGeneratingImage(false);
      handleDownloadImage();
    }
  };

  // Handler: Download PNG image
  const handleDownloadImage = async () => {
    soundFx.playTick();
    setIsGeneratingImage(true);
    try {
      const canvas = await renderMonthlyWrappedCardToCanvas(wrappedData, athleteName, accentHex);
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `thunder_wrapped_${wrappedData.monthKey}_${athleteName.replace(/\s+/g, '_').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      soundFx.playCelebration();
      vibration.trigger(120);
      setCopyStatus('Imagem PNG baixada com sucesso!');
      setIsGeneratingImage(false);
      setTimeout(() => setCopyStatus(null), 3500);
    } catch (err) {
      console.error('Error downloading card:', err);
      setIsGeneratingImage(false);
    }
  };

  // Handler: Native Mobile Share
  const handleNativeShare = async () => {
    soundFx.playTick();
    if (navigator.share) {
      try {
        const canvas = await renderMonthlyWrappedCardToCanvas(wrappedData, athleteName, accentHex);
        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'wrapped.png', { type: 'image/png' })] })) {
            const file = new File([blob], `wrapped_${wrappedData.monthKey}.png`, { type: 'image/png' });
            await navigator.share({
              title: `Thunder Wrapped · ${wrappedData.monthNamePT}`,
              text: shareText,
              files: [file]
            });
          } else {
            await navigator.share({
              title: `Thunder Wrapped · ${wrappedData.monthNamePT}`,
              text: shareText
            });
          }
        }, 'image/png');
      } catch (e) {
        // User cancelled share
      }
    } else {
      handleCopyImage();
    }
  };

  // Handler: Copy text
  const handleCopyText = async () => {
    soundFx.playTick();
    try {
      await navigator.clipboard.writeText(shareText);
      soundFx.playSuccess();
      vibration.trigger(80);
      setCopyStatus('Texto copiado com sucesso!');
      setTimeout(() => setCopyStatus(null), 3500);
    } catch {
      setCopyStatus('Erro ao copiar texto');
      setTimeout(() => setCopyStatus(null), 3500);
    }
  };

  return (
    <div 
      id="monthly-wrapped-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#0F1015] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl text-left my-6 overflow-hidden">
        {/* Glowing Ambient Backdrop Blurs */}
        <div 
          className="absolute -top-20 -left-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-30" 
          style={{ backgroundColor: accentHex }}
        />
        <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center p-0.5 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accentHex}, #8B5CF6)` }}
            >
              <div className="w-full h-full bg-[#0A0A0C] rounded-[14px] flex items-center justify-center text-white">
                <Sparkles size={20} style={{ color: accentHex }} />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest block text-neutral-400">
                ESTILO SPOTIFY WRAPPED
              </span>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Thunder Wrapped <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono-numbers">Mensal</span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Month Selector Pills */}
        <div className="mt-4 relative z-10">
          <label className="text-[11px] font-bold text-neutral-400 uppercase flex items-center gap-1.5 mb-2">
            <Calendar size={13} style={{ color: accentHex }} /> Selecione o Mês da Retrospectiva:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar-x pb-2">
            {availableMonths.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  soundFx.playTick();
                  setSelectedMonthKey(m.key);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedMonthKey === m.key
                    ? 'bg-white text-black font-black shadow-md scale-[1.02]'
                    : 'bg-[#181920] text-neutral-300 hover:text-white border border-white/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Toast */}
        {copyStatus && (
          <div className="my-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>{copyStatus}</span>
          </div>
        )}

        {/* Tab Toggle: Visual Card Preview vs Formatted Text */}
        <div className="flex items-center gap-2 mt-3 mb-4 bg-[#181920] p-1 rounded-2xl border border-white/5 relative z-10">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'bg-white/15 text-white shadow-sm font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon size={14} style={{ color: accentHex }} />
            <span>Card Visual (Stories)</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white/15 text-white shadow-sm font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText size={14} className="text-amber-400" />
            <span>Texto Formatado</span>
          </button>
        </div>

        {/* Main Content Area */}
        {activeTab === 'card' ? (
          /* ========================================================================= */
          /* SPOTIFY WRAPPED STYLE VISUAL PREVIEW CARD                                 */
          /* ========================================================================= */
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#08090D] p-5 text-white shadow-2xl space-y-4">
            {/* Background Radial Glow */}
            <div 
              className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-2xl opacity-25 pointer-events-none"
              style={{ backgroundColor: accentHex }}
            />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header Top */}
            <div className="flex items-center justify-between text-xs relative z-10">
              <span className="font-black tracking-widest text-neutral-400">
                THUNDER WRAPPED
              </span>
              <span className="font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/10 text-[11px]">
                {wrappedData.monthNamePT.toUpperCase()}
              </span>
            </div>

            {/* Card Hero: Carga Total Acumulada */}
            <div className="bg-[#12131A] border border-white/10 rounded-2xl p-4 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-wider block" style={{ color: accentHex }}>
                CARGA TOTAL ACUMULADA NO MÊS
              </span>
              <div className="text-3xl sm:text-4xl font-black font-mono-numbers text-white mt-1">
                {wrappedData.totalVolumeKg.toLocaleString('pt-BR')} <span className="text-lg font-bold text-neutral-400">kg</span>
              </div>
              <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-neutral-200 font-medium flex items-center gap-2">
                <span className="text-base">{wrappedData.comparisonIcon}</span>
                <span>{wrappedData.comparisonText}</span>
              </div>
            </div>

            {/* Card Hero 2: Número de Treinos no Mês */}
            <div className="bg-[#12131A] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">
                  TREINOS CONCLUÍDOS
                </span>
                <div className="text-3xl font-black font-mono-numbers mt-0.5" style={{ color: accentHex }}>
                  {wrappedData.workoutsCount} <span className="text-sm font-bold text-white">sessões</span>
                </div>
                <span className="text-[11px] text-neutral-400 block mt-1">
                  Média de {wrappedData.averageWeeklyFrequency} treinos por semana
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Flame size={24} className="text-amber-400 fill-amber-400/30" />
              </div>
            </div>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-2 gap-2 relative z-10">
              <div className="bg-[#12131A] border border-white/5 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <Clock size={11} className="text-blue-400" /> Tempo no Ferro
                </span>
                <p className="text-sm font-black font-mono-numbers text-white mt-0.5">
                  {formatWorkoutDuration(wrappedData.totalDurationSeconds)}
                </p>
              </div>

              <div className="bg-[#12131A] border border-white/5 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <Flame size={11} className="text-amber-400" /> Gasto Estimado
                </span>
                <p className="text-sm font-black font-mono-numbers text-amber-300 mt-0.5">
                  ~{wrappedData.estimatedCalories.toLocaleString('pt-BR')} kcal
                </p>
              </div>

              <div className="bg-[#12131A] border border-white/5 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <Trophy size={11} className="text-purple-400" /> Foco Muscular
                </span>
                <p className="text-sm font-black text-white mt-0.5 truncate" title={wrappedData.topMuscleGroup}>
                  {wrappedData.topMuscleGroup}
                </p>
                <span className="text-[10px] text-neutral-400">
                  {wrappedData.topMusclePercentage}% do volume
                </span>
              </div>

              <div className="bg-[#12131A] border border-white/5 p-3 rounded-2xl">
                <span className="text-[10px] font-bold text-neutral-400 uppercase flex items-center gap-1">
                  <TrendingUp size={11} style={{ color: accentHex }} /> Recordes / Séries
                </span>
                <p className="text-sm font-black font-mono-numbers mt-0.5" style={{ color: accentHex }}>
                  {wrappedData.prsCount > 0 ? `${wrappedData.prsCount} PRs batidos` : `${wrappedData.totalSets} séries`}
                </p>
                <span className="text-[10px] text-neutral-400">
                  {wrappedData.totalReps} repetições totais
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-white/10 relative z-10">
              <span className="font-bold text-white">Atleta: {athleteName}</span>
              <span className="font-mono-numbers" style={{ color: accentHex }}>#ThunderWrapped</span>
            </div>
          </div>
        ) : (
          /* Formatted Text Box */
          <div className="relative rounded-3xl border border-white/10 bg-[#08090D] p-4 text-white">
            <textarea
              readOnly
              rows={11}
              value={shareText}
              className="w-full bg-transparent text-xs font-mono text-neutral-300 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 relative z-10">
          <button
            onClick={handleCopyImage}
            disabled={isGeneratingImage}
            className="py-3 px-3 rounded-2xl text-xs font-black bg-white hover:bg-neutral-100 text-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            title="Copiar imagem para colar no Instagram Stories / WhatsApp"
          >
            <Copy size={15} />
            <span>Copiar Imagem</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={isGeneratingImage}
            className="py-3 px-3 rounded-2xl text-xs font-black text-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: accentHex }}
            title="Baixar imagem em PNG alta resolução"
          >
            <Download size={15} />
            <span>Baixar PNG</span>
          </button>

          <button
            onClick={handleNativeShare}
            disabled={isGeneratingImage}
            className="py-3 px-3 rounded-2xl text-xs font-black bg-[#1C1D24] hover:bg-[#252630] text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Compartilhar no celular"
          >
            <Share2 size={15} />
            <span>Compartilhar</span>
          </button>

          <button
            onClick={handleCopyText}
            className="py-3 px-3 rounded-2xl text-xs font-bold bg-[#1C1D24] hover:bg-[#252630] text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Copiar texto formatado"
          >
            <FileText size={15} />
            <span>Copiar Texto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
