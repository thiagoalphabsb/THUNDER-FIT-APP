import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Plus, 
  Dumbbell, 
  Info, 
  X, 
  ChevronRight, 
  Check, 
  Trophy, 
  ListOrdered,
  Sparkles
} from 'lucide-react';
import { CompletedWorkout, EquipmentType, Exercise, MuscleGroup } from '../types';
import { getExerciseStatsFromHistory, isIsometricExercise, formatHoldDuration } from '../utils/calc';

interface ExercisesViewProps {
  exercises: Exercise[];
  history: CompletedWorkout[];
  onAddCustomExercise: (exercise: Exercise) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Quadríceps',
  'Posteriores',
  'Glúteos',
  'Panturrilhas',
  'Abdômen'
];

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Barra',
  'Halteres',
  'Máquina',
  'Polia',
  'Peso Corporal',
  'Kettlebell',
  'Outro'
];

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  exercises,
  history,
  onAddCustomExercise
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'Todos'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExerciseModal, setActiveExerciseModal] = useState<Exercise | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Form for custom exercise
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>('Peito');
  const [customEquipment, setCustomEquipment] = useState<EquipmentType>('Halteres');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customRest, setCustomRest] = useState(120);
  const [customIsIsometric, setCustomIsIsometric] = useState(false);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMuscle = selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle;
      const matchEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
      return matchSearch && matchMuscle && matchEquipment;
    });
  }, [exercises, searchQuery, selectedMuscle, selectedEquipment]);

  const handleSaveCustomExercise = () => {
    if (!customName.trim()) {
      alert('Informe o nome do exercício.');
      return;
    }

    const newEx: Exercise = {
      id: `custom-ex-${Date.now()}`,
      name: customName.trim(),
      muscleGroup: customMuscle,
      equipment: customEquipment,
      defaultRestSeconds: customRest,
      instructions: customInstructions
        ? customInstructions.split('\n').filter((l) => l.trim())
        : ['Execute com controle e boa postura.'],
      isCustom: true,
      isIsometric: customIsIsometric
    };

    onAddCustomExercise(newEx);
    setIsCustomModalOpen(false);
    setCustomName('');
    setCustomInstructions('');
    setCustomIsIsometric(false);
  };

  // Get user's personal records for the active modal exercise
  const activeExStats = useMemo(() => {
    if (!activeExerciseModal) return null;
    return getExerciseStatsFromHistory(activeExerciseModal.id, history);
  }, [activeExerciseModal, history]);

  return (
    <div id="exercises-view" className="space-y-4 pb-28 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#00D1C1] uppercase">
            BIBLIOTECA COMPLETA ({exercises.length})
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Exercícios
          </h1>
        </div>

        <button
          onClick={() => setIsCustomModalOpen(true)}
          className="py-2.5 px-3.5 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          CRIAR NOVO
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
        <input
          type="text"
          placeholder="Buscar exercício por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#161616] text-white placeholder-neutral-500 rounded-2xl border border-white/5 focus:outline-none focus:border-[#00D1C1] text-sm shadow-md"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs font-semibold"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Muscle Group Horizontal Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedMuscle('Todos')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            selectedMuscle === 'Todos'
              ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/25'
              : 'bg-[#161616] text-neutral-300 hover:bg-[#222222] border border-white/5'
          }`}
        >
          Todos ({exercises.length})
        </button>
        {MUSCLE_GROUPS.map((m) => {
          const count = exercises.filter((e) => e.muscleGroup === m).length;
          return (
            <button
              key={m}
              onClick={() => setSelectedMuscle(m)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedMuscle === m
                  ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/25'
                  : 'bg-[#161616] text-neutral-300 hover:bg-[#222222] border border-white/5'
              }`}
            >
              {m} ({count})
            </button>
          );
        })}
      </div>

      {/* List of Exercises Cards */}
      <div className="space-y-2.5">
        {filteredExercises.length === 0 ? (
          <div className="bg-[#161616] border border-dashed border-white/10 rounded-3xl p-8 text-center text-neutral-400 text-xs">
            Nenhum exercício encontrado com esses filtros.
          </div>
        ) : (
          filteredExercises.map((exercise) => {
            const exStats = getExerciseStatsFromHistory(exercise.id, history);
            const isIso = exercise.isIsometric || isIsometricExercise(exercise);

            return (
              <div
                key={exercise.id}
                onClick={() => setActiveExerciseModal(exercise)}
                className="bg-[#161616] hover:bg-[#222222] border border-white/5 hover:border-[#00D1C1]/40 rounded-3xl p-3.5 cursor-pointer transition-all flex items-center justify-between shadow-md"
              >
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                      {exercise.muscleGroup}
                    </span>
                    {isIso && (
                      <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 flex items-center gap-1 shadow-sm">
                        ⏱️ ISOMETRIA
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                      {exercise.equipment}
                    </span>
                    {exercise.isCustom && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        PERSONALIZADO
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-sm tracking-tight">
                    {exercise.name}
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  {exStats && (isIso ? exStats.maxHoldSeconds > 0 : exStats.maxWeight > 0) ? (
                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 uppercase block">Recorde</span>
                      <span className="font-mono-numbers font-black text-xs text-[#00D1C1]">
                        {isIso
                          ? `${formatHoldDuration(exStats.maxHoldSeconds)}${exStats.maxWeight > 0 ? ` (+${exStats.maxWeight}kg)` : ''}`
                          : `${exStats.maxWeight} kg`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-500">Sem histórico</span>
                  )}
                  <ChevronRight size={16} className="text-neutral-500" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Exercise Detail Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-3xl p-5 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded border border-[#00D1C1]/20">
                    {activeExerciseModal.muscleGroup}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-400 bg-white/5 px-2 py-0.5 rounded">
                    {activeExerciseModal.equipment}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">
                  {activeExerciseModal.name}
                </h3>
              </div>

              <button
                onClick={() => setActiveExerciseModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
              {/* User Record Snapshot */}
              {(() => {
                const isModalIso = activeExerciseModal.isIsometric || isIsometricExercise(activeExerciseModal);
                if (isModalIso && activeExStats && activeExStats.maxHoldSeconds > 0) {
                  return (
                    <div className="bg-[#222222] border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
                          <Trophy size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-amber-400 uppercase">Recorde de Sustentação (PR)</span>
                          <p className="font-mono-numbers font-black text-sm text-white">
                            {formatHoldDuration(activeExStats.maxHoldSeconds)}
                            {activeExStats.maxWeight > 0 ? ` (+${activeExStats.maxWeight} kg extra)` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 uppercase block">Total Séries</span>
                        <span className="font-mono-numbers font-bold text-white text-xs">
                          {activeExStats.totalSetsPerformed} séries
                        </span>
                      </div>
                    </div>
                  );
                }

                if (!isModalIso && activeExStats && activeExStats.maxWeight > 0) {
                  return (
                    <div className="bg-[#222222] border border-[#00D1C1]/30 rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl">
                          <Trophy size={18} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">Seu Recorde Pessoal (PR)</span>
                          <p className="font-mono-numbers font-black text-sm text-[#00D1C1]">
                            {activeExStats.maxWeight} kg ({activeExStats.maxRepsAtMaxWeight} reps)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 uppercase block">1RM Est.</span>
                        <span className="font-mono-numbers font-bold text-white text-xs">
                          {activeExStats.best1RM} kg
                        </span>
                      </div>
                    </div>
                  );
                }

                return null;
              })()}

              {/* Step by step Instructions */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ListOrdered size={14} className="text-[#00D1C1]" />
                  Instruções de Execução:
                </h4>
                <div className="space-y-2">
                  {activeExerciseModal.instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-[#222222] p-2.5 rounded-xl border border-white/5">
                      <span className="w-5 h-5 rounded-full bg-[#161616] text-[#00D1C1] font-mono-numbers font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-neutral-300 leading-relaxed text-xs">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips & Coaching points */}
              {activeExerciseModal.tips && (
                <div className="bg-[#00D1C1]/5 border border-[#00D1C1]/20 rounded-2xl p-3">
                  <span className="text-[10px] font-black uppercase text-[#00D1C1] block mb-1">
                    💡 Dica Profissional:
                  </span>
                  <p className="text-neutral-300 leading-relaxed text-xs">
                    {activeExerciseModal.tips}
                  </p>
                </div>
              )}

              {/* Secondary Muscles */}
              {activeExerciseModal.secondaryMuscles && activeExerciseModal.secondaryMuscles.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">
                    Músculos Sinérgicos / Secundários:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {activeExerciseModal.secondaryMuscles.map((m) => (
                      <span key={m} className="bg-white/5 text-neutral-300 text-[10px] px-2 py-0.5 rounded-md">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="w-full py-3 bg-[#222222] hover:bg-[#2c2c2c] text-white font-bold text-xs rounded-2xl border border-white/10"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Exercise Modal */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
          <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-white text-base">Novo Exercício Personalizado</h3>
              <button onClick={() => setIsCustomModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="py-3 space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold block mb-1">Nome do Exercício *</label>
                <input
                  type="text"
                  placeholder="Ex: Supino Inclinado com Halteres Pegada Neutra"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00D1C1]"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Grupo Muscular Principal</label>
                <select
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
                  className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00D1C1]"
                >
                  {MUSCLE_GROUPS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Equipamento</label>
                <select
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value as EquipmentType)}
                  className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00D1C1]"
                >
                  {EQUIPMENT_TYPES.map((eq) => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Descanso Padrão (segundos)</label>
                <input
                  type="number"
                  step="15"
                  value={customRest}
                  onChange={(e) => setCustomRest(parseInt(e.target.value, 10) || 120)}
                  className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00D1C1]"
                />
              </div>

              {/* Isometria Checkbox */}
              <div
                onClick={() => setCustomIsIsometric(!customIsIsometric)}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors ${
                  customIsIsometric
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-[#222222] border-white/10 text-neutral-300'
                }`}
              >
                <input
                  type="checkbox"
                  id="custom-is-isometric"
                  checked={customIsIsometric}
                  onChange={(e) => setCustomIsIsometric(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400 accent-amber-400 cursor-pointer"
                />
                <label htmlFor="custom-is-isometric" className="text-xs font-bold cursor-pointer select-none">
                  ⏱️ Exercício de Isometria (contado por tempo/segundos de sustentação e séries, como Prancha, Wall Sit ou Hollow Body)
                </label>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1">Instruções / Dicas (Opcional)</label>
                <textarea
                  rows={3}
                  placeholder="Instruções de execução linha a linha..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full bg-[#222222] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#00D1C1]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="py-2.5 px-4 bg-[#222222] text-neutral-300 rounded-xl font-bold text-xs border border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustomExercise}
                className="flex-1 py-2.5 px-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-xl shadow-lg shadow-[#00D1C1]/20"
              >
                SALVAR EXERCÍCIO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
