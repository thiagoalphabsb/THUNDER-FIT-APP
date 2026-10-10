import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  MessageCircle, 
  Image as ImageIcon, 
  FileText, 
  Sparkles,
  Trophy,
  ExternalLink,
  Flame
} from 'lucide-react';
import { CompletedWorkout } from '../types';
import { soundFx } from '../utils/audio';
import { 
  generateWorkoutShareText, 
  renderWorkoutShareCanvas, 
  downloadCanvasAsImage, 
  copyCanvasImageToClipboard, 
  copyTextToClipboard 
} from '../utils/workoutShareGenerator';

interface WorkoutShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: CompletedWorkout | null;
  athleteName?: string;
}

export const WorkoutShareModal: React.FC<WorkoutShareModalProps> = ({
  isOpen,
  onClose,
  workout,
  athleteName
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate canvas & preview when workout changes or modal opens
  useEffect(() => {
    if (!isOpen || !workout) {
      setPreviewImageUrl(null);
      return;
    }

    try {
      const canvas = renderWorkoutShareCanvas(workout, athleteName);
      canvasRef.current = canvas;
      const dataUrl = canvas.toDataURL('image/png');
      setPreviewImageUrl(dataUrl);
    } catch (err) {
      console.error('Failed to render share canvas preview', err);
    }
  }, [isOpen, workout, athleteName]);

  if (!isOpen || !workout) return null;

  const shareText = generateWorkoutShareText(workout, athleteName);

  // Copy text handler
  const handleCopyText = async () => {
    soundFx.playTick();
    const success = await copyTextToClipboard(shareText);
    if (success) {
      soundFx.playSuccess();
      setCopiedText(true);
      setCopyFeedback('Texto do resumo copiado para a área de transferência!');
      setTimeout(() => {
        setCopiedText(false);
        setCopyFeedback(null);
      }, 3500);
    }
  };

  // Copy image handler
  const handleCopyImage = async () => {
    soundFx.playTick();
    if (!canvasRef.current) return;

    const success = await copyCanvasImageToClipboard(canvasRef.current);
    if (success) {
      soundFx.playCelebration();
      setCopiedImage(true);
      setCopyFeedback('Imagem copiada para a área de transferência! (Cole no Instagram, WhatsApp ou chat)');
      setTimeout(() => {
        setCopiedImage(false);
        setCopyFeedback(null);
      }, 4000);
    } else {
      // Fallback: download automatically if clipboard write is restricted
      handleDownloadImage();
      setCopyFeedback('Imagem baixada em alta resolução para sua galeria!');
      setTimeout(() => setCopyFeedback(null), 4000);
    }
  };

  // Download image handler
  const handleDownloadImage = () => {
    soundFx.playSuccess();
    if (!canvasRef.current) return;
    const safeTitle = (workout.routineName || 'treino')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 20);
    const filename = `thunder_${safeTitle}_${Date.now()}.png`;
    downloadCanvasAsImage(canvasRef.current, filename);
  };

  // Native Web Share handler
  const handleNativeShare = async () => {
    soundFx.playTick();
    if (navigator.share) {
      try {
        if (canvasRef.current && navigator.canShare) {
          canvasRef.current.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'treino_thunder.png', { type: 'image/png' });
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: workout.routineName || 'Resumo do Treino',
                  text: shareText,
                  files: [file]
                });
                return;
              }
            }
            await navigator.share({
              title: workout.routineName || 'Resumo do Treino',
              text: shareText
            });
          });
        } else {
          await navigator.share({
            title: workout.routineName || 'Resumo do Treino',
            text: shareText
          });
        }
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleOpenWhatsApp();
    }
  };

  // WhatsApp share
  const handleOpenWhatsApp = () => {
    soundFx.playTick();
    const encoded = encodeURIComponent(shareText);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#141418] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl my-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30 flex items-center justify-center">
              <Share2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                Compartilhar Desempenho
                <span className="text-[10px] font-black font-mono-numbers px-2 py-0.5 rounded-full bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30">
                  REDES SOCIAIS
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Gere um resumo em imagem ou texto para celebrar sua evolução
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Imagem vs Texto */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0A0C] rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('image');
              soundFx.playTick();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'image'
                ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>Card Visual (Imagem)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              soundFx.playTick();
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'text'
                ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText size={14} />
            <span>Texto Formatado</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {copyFeedback && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-400 shrink-0" />
              <span>{copyFeedback}</span>
            </div>
            <button
              onClick={() => setCopyFeedback(null)}
              className="text-neutral-400 hover:text-white p-0.5"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 1: CARD VISUAL (IMAGEM)                              */}
        {/* ======================================================== */}
        {activeTab === 'image' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Visual Canvas Preview Frame */}
            <div className="relative bg-[#0A0A0C] rounded-2xl p-2 border border-white/10 flex justify-center items-center overflow-hidden max-h-[380px]">
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Pré-visualização do card de treino"
                  className="max-h-[360px] w-auto rounded-xl shadow-2xl object-contain border border-white/5"
                />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-neutral-500 text-xs gap-2">
                  <Sparkles size={24} className="text-[#00D1C1] animate-spin" />
                  <span>Gerando imagem de alta definição...</span>
                </div>
              )}

              {/* Watermark badge on top */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono-numbers font-bold text-[#00D1C1] border border-white/10 flex items-center gap-1">
                <span>1080 × 1350 · 4:5 Instagram</span>
              </div>
            </div>

            {/* Image Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyImage}
                className={`py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  copiedImage
                    ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                    : 'bg-[#00D1C1] hover:bg-[#15e8d7] text-black shadow-[#00D1C1]/20'
                }`}
                title="Copiar imagem diretamente para a área de transferência"
              >
                {copiedImage ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedImage ? 'Imagem Copiada!' : 'Copiar Imagem'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadImage}
                className="py-3 px-4 bg-[#222226] hover:bg-[#2c2c32] text-white border border-white/10 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                title="Baixar imagem em PNG para sua galeria"
              >
                <Download size={16} className="text-[#00D1C1]" />
                <span>Baixar PNG</span>
              </button>
            </div>

            {/* Quick Share Links */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 size={14} className="text-[#00D1C1]" />
                <span>Compartilhar Direto</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 2: TEXTO FORMATADO COM EMOJIS                         */}
        {/* ======================================================== */}
        {activeTab === 'text' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Formatted Text Box */}
            <div className="relative">
              <textarea
                readOnly
                value={shareText}
                rows={9}
                className="w-full bg-[#0A0A0C] border border-white/10 rounded-2xl p-3.5 text-xs font-mono-numbers text-neutral-200 leading-relaxed focus:outline-none resize-none select-all"
              />
              <span className="absolute bottom-3 right-3 text-[10px] text-neutral-500 font-mono-numbers">
                {shareText.length} caracteres
              </span>
            </div>

            {/* Text Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCopyText}
                className={`py-3 px-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                  copiedText
                    ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                    : 'bg-[#00D1C1] hover:bg-[#15e8d7] text-black shadow-[#00D1C1]/20'
                }`}
              >
                {copiedText ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedText ? 'Texto Copiado!' : 'Copiar Texto'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="py-3 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <MessageCircle size={16} className="text-emerald-400" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Pro-tip Footer */}
        <p className="text-[11px] text-neutral-500 text-center pt-1 border-t border-white/5">
          💡 Dica: Cole a imagem ou texto no Instagram Stories, status do WhatsApp ou Twitter para inspirar sua comunidade!
        </p>
      </div>
    </div>
  );
};
