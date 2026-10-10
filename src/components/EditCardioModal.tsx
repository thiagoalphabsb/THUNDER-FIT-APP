import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bike, 
  Flame, 
  Zap, 
  Calendar, 
  Clock, 
  Gauge, 
  Save, 
  Trash2, 
  Check, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { CardioSession } from '../types';
import { soundFx } from '../utils/audio';

interface EditCardioModalProps {
  isOpen: boolean;
  session: CardioSession | null;
  onClose: () => void;
  onSave: (updatedSession: CardioSession) => void;
  onDelete?: (sessionId: string) => void;
}

export const EditCardioModal: React.FC<EditCardioModalProps> = ({
  isOpen,
  session,
  onClose,
  onSave,
  onDelete
}) => {
  const [type, setType] = useState<'warmup' | 'moderate' | 'hiit'>('moderate');
  const [modality, setModality] = useState('Bicicleta Spinning');
  const [dateTimeLocal, setDateTimeLocal] = useState('');
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [calories, setCalories] = useState(200);
  const [distanceKm, setDistanceKm] = useState<string>('8.0');
  const [cadenceRpm, setCadenceRpm] = useState<string>('80');
  const [resistanceLevel, setResistanceLevel] = useState('Moderada');
  const [hiitRounds, setHiitRounds] = useState(8);
  const [workSeconds, setWorkSeconds] = useState(20);
  const [restSeconds, setRestSeconds] = useState(40);
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync state whenever active session opens
  useEffect(() => {
    if (session) {
      setType(session.type || 'moderate');
      setModality(session.modality || 'Bicicleta Spinning');

      // Format ISO date to YYYY-MM-DDTHH:mm for datetime-local input
      try {
        const d = new Date(session.completedAt);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          setDateTimeLocal(localISOTime);
        } else {
          setDateTimeLocal(new Date().toISOString().slice(0, 16));
        }
      } catch {
        setDateTimeLocal(new Date().toISOString().slice(0, 16));
      }

      const totalSec = Math.max(0, session.durationSeconds || 0);
      setMinutes(Math.floor(totalSec / 60));
      setSeconds(totalSec % 60);

      setCalories(session.estimatedCalories || 0);
      setDistanceKm(session.estimatedDistanceKm !== undefined ? String(session.estimatedDistanceKm) : '');
      setCadenceRpm(session.cadenceRpm ? String(session.cadenceRpm) : '');
      setResistanceLevel(session.resistanceLevel || '');
      setHiitRounds(session.hiitRounds || 8);
      setWorkSeconds(session.workSeconds || 20);
      setRestSeconds(session.restSeconds || 40);
      setNotes(session.notes || '');
      setConfirmDelete(false);
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  // Auto recalculate estimate calories & distance based on duration and session type
  const handleRecalculateEstimates = () => {
    soundFx.playTick();
    const totalMin = Math.max(1, minutes + seconds / 60);
    let calPerMin = 7.5; // Moderate spinning default ~450 kcal/h
    let kmPerMin = 0.35; // ~21 km/h

    if (type === 'warmup') {
      calPerMin = 6.0;
      kmPerMin = 0.30;
    } else if (type === 'hiit') {
      calPerMin = 11.5; // High intensity burn ~700 kcal/h
      kmPerMin = 0.42;
    }

    const newCal = Math.round(totalMin * calPerMin);
    const newKm = parseFloat((totalMin * kmPerMin).toFixed(1));
    setCalories(newCal);
    setDistanceKm(String(newKm));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();

    const totalDurationSeconds = Math.max(10, (Number(minutes) || 0) * 60 + (Number(seconds) || 0));

    // Convert local datetime to ISO string
    let finalCompletedAt = session.completedAt;
    try {
      if (dateTimeLocal) {
        const parsed = new Date(dateTimeLocal);
        if (!isNaN(parsed.getTime())) {
          finalCompletedAt = parsed.toISOString();
        }
      }
    } catch {
      // Keep original
    }

    const updatedSession: CardioSession = {
      ...session,
      type,
      modality: modality.trim() || 'Bicicleta Spinning',
      durationSeconds: totalDurationSeconds,
      completedAt: finalCompletedAt,
      estimatedCalories: Math.max(0, Number(calories) || 0),
      estimatedDistanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      cadenceRpm: cadenceRpm ? parseInt(cadenceRpm, 10) : undefined,
      resistanceLevel: resistanceLevel.trim() || undefined,
      hiitRounds: type === 'hiit' ? Math.max(1, Number(hiitRounds) || 1) : undefined,
      workSeconds: type === 'hiit' ? Math.max(5, Number(workSeconds) || 20) : undefined,
      restSeconds: type === 'hiit' ? Math.max(5, Number(restSeconds) || 40) : undefined,
      notes: notes.trim() || undefined
    };

    onSave(updatedSession);
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      soundFx.playTick();
      setConfirmDelete(true);
      return;
    }

    soundFx.playTick();
    if (onDelete && session) {
      onDelete(session.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div 
        id="edit-cardio-modal-content"
        className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative my-auto space-y-4.5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              type === 'warmup' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : type === 'hiit'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-[#00D1C1]/20 text-[#00D1C1] border border-[#00D1C1]/30'
            }`}>
              {type === 'warmup' ? <Flame size={20} /> : type === 'hiit' ? <Zap size={20} /> : <Bike size={20} />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Editar Sessão de Cardio
              </h2>
              <p className="text-[11px] text-neutral-400">
                Ajuste os dados salvos caso tenha havido algum erro no registro
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* 1. Tipo de Sessão */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1.5">
              Tipo de Treino
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setType('warmup'); soundFx.playTick(); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  type === 'warmup'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                    : 'bg-[#18181b] text-neutral-400 border-white/5 hover:text-white'
                }`}
              >
                <Flame size={13} className="text-amber-400" />
                <span>Aquecimento</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('moderate'); soundFx.playTick(); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  type === 'moderate'
                    ? 'bg-[#00D1C1]/20 text-[#00D1C1] border-[#00D1C1]/50 shadow-sm'
                    : 'bg-[#18181b] text-neutral-400 border-white/5 hover:text-white'
                }`}
              >
                <Bike size={13} className="text-[#00D1C1]" />
                <span>Moderado</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('hiit'); soundFx.playTick(); }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                  type === 'hiit'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                    : 'bg-[#18181b] text-neutral-400 border-white/5 hover:text-white'
                }`}
              >
                <Zap size={13} className="text-rose-400" />
                <span>HIIT</span>
              </button>
            </div>
          </div>

          {/* 2. Modalidade & Data e Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
                Modalidade
              </label>
              <input
                type="text"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
                placeholder="Ex: Bicicleta Spinning"
                className="w-full px-3 py-2 bg-[#18181b] text-white rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00D1C1] transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1 flex items-center gap-1">
                <Calendar size={12} className="text-[#00D1C1]" />
                <span>Data e Hora Realizada</span>
              </label>
              <input
                type="datetime-local"
                value={dateTimeLocal}
                onChange={(e) => setDateTimeLocal(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] text-white rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00D1C1] transition-colors"
                required
              />
            </div>
          </div>

          {/* 3. Duração (Minutos e Segundos) */}
          <div className="bg-[#18181b] border border-white/5 p-3 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-300 uppercase flex items-center gap-1.5">
                <Clock size={13} className="text-[#00D1C1]" />
                <span>Duração do Treino</span>
              </label>
              <span className="text-[11px] font-mono-numbers text-[#00D1C1] font-bold">
                Total: {minutes}m {seconds > 0 ? `${seconds}s` : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5">Minutos</span>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-2 bg-[#121214] text-white rounded-xl border border-white/10 text-sm font-bold font-mono-numbers focus:outline-none focus:border-[#00D1C1]"
                  required
                />
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5">Segundos</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                  className="w-full px-3 py-2 bg-[#121214] text-white rounded-xl border border-white/10 text-sm font-bold font-mono-numbers focus:outline-none focus:border-[#00D1C1]"
                />
              </div>
            </div>
          </div>

          {/* 4. Calorias & Distância + Botão Recalcular */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase">
                Métricas de Desempenho
              </label>
              <button
                type="button"
                onClick={handleRecalculateEstimates}
                className="text-[11px] text-[#00D1C1] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                title="Recalcular estimativa com base no tempo e modalidade"
              >
                <RotateCcw size={11} />
                <span>Recalcular Estimativas</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5 flex items-center gap-1">
                  <Flame size={11} className="text-amber-400" /> Calorias (kcal)
                </span>
                <input
                  type="number"
                  min="0"
                  max="3000"
                  value={calories}
                  onChange={(e) => setCalories(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-full px-3 py-2 bg-[#18181b] text-white rounded-xl border border-white/10 text-xs font-bold font-mono-numbers focus:outline-none focus:border-[#00D1C1]"
                  required
                />
              </div>

              <div>
                <span className="text-[10px] text-neutral-400 block mb-0.5 flex items-center gap-1">
                  <Gauge size={11} className="text-[#00D1C1]" /> Distância (km)
                </span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="Ex: 8.5"
                  className="w-full px-3 py-2 bg-[#18181b] text-white rounded-xl border border-white/10 text-xs font-bold font-mono-numbers focus:outline-none focus:border-[#00D1C1]"
                />
              </div>
            </div>
          </div>

          {/* 5. Cadência & Nível de Carga */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-neutral-400 block mb-0.5">
                Cadência Média (RPM)
              </span>
              <input
                type="number"
                min="0"
                max="250"
                value={cadenceRpm}
                onChange={(e) => setCadenceRpm(e.target.value)}
                placeholder="Ex: 80"
                className="w-full px-3 py-2 bg-[#18181b] text-white rounded-xl border border-white/10 text-xs font-mono-numbers focus:outline-none focus:border-[#00D1C1]"
              />
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 block mb-0.5">
                Nível de Carga / Resistência
              </span>
              <input
                type="text"
                value={resistanceLevel}
                onChange={(e) => setResistanceLevel(e.target.value)}
                placeholder="Ex: Leve, Moderada, Pesada..."
                className="w-full px-3 py-2 bg-[#18181b] text-white rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00D1C1]"
              />
            </div>
          </div>

          {/* 6. Se for HIIT, configurações de rounds */}
          {type === 'hiit' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-rose-300 uppercase block">
                Detalhes do HIIT
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Rounds</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={hiitRounds}
                    onChange={(e) => setHiitRounds(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-2 py-1.5 bg-[#121214] text-white rounded-lg border border-white/10 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Tiro (s)</span>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={workSeconds}
                    onChange={(e) => setWorkSeconds(Math.max(5, parseInt(e.target.value, 10) || 20))}
                    className="w-full px-2 py-1.5 bg-[#121214] text-white rounded-lg border border-white/10 text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Descanso (s)</span>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={restSeconds}
                    onChange={(e) => setRestSeconds(Math.max(5, parseInt(e.target.value, 10) || 40))}
                    className="w-full px-2 py-1.5 bg-[#121214] text-white rounded-lg border border-white/10 text-xs font-bold text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. Observações */}
          <div>
            <label className="text-[11px] font-bold text-neutral-300 uppercase block mb-1">
              Observações & Sensações (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino forte, mantive cadência alta na subida..."
              rows={2}
              className="w-full px-3 py-2 bg-[#18181b] text-white rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00D1C1] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  confirmDelete
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                }`}
                title={confirmDelete ? 'Clique novamente para confirmar a exclusão' : 'Excluir esta sessão'}
              >
                <Trash2 size={14} />
                <span>{confirmDelete ? 'Confirmar Exclusão?' : 'Excluir'}</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="py-2.5 px-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-xl shadow-lg shadow-[#00D1C1]/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Save size={14} />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
