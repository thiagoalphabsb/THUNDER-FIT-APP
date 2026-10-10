import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Filter, Check } from 'lucide-react';
import { Exercise, MuscleGroup } from '../types';

interface QuickAddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  alreadyAddedIds?: string[];
  title?: string;
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

export const QuickAddExerciseModal: React.FC<QuickAddExerciseModalProps> = ({
  isOpen,
  onClose,
  exercises,
  onSelectExercise,
  alreadyAddedIds = [],
  title = 'Adicionar Exercício'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'Todos'>('Todos');

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchQuery, selectedMuscle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00D1C1]"></div>
            <h3 className="font-black text-lg text-white tracking-wide">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-3 space-y-3 bg-[#0A0A0A]">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome, equipamento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#222222] text-white placeholder-neutral-500 rounded-xl border border-white/10 focus:outline-none focus:border-[#00D1C1] text-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Muscle Group Horizontal Scroll Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedMuscle('Todos')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedMuscle === 'Todos'
                  ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20'
                  : 'bg-[#222222] text-neutral-300 hover:bg-[#2c2c2c] border border-white/5'
              }`}
            >
              Todos
            </button>
            {MUSCLE_GROUPS.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMuscle(m)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedMuscle === m
                    ? 'bg-[#00D1C1] text-black shadow-md shadow-[#00D1C1]/20'
                    : 'bg-[#222222] text-neutral-300 hover:bg-[#2c2c2c] border border-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* List of Exercises */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-white/5">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Filter className="mx-auto mb-2 opacity-50" size={32} />
              <p className="text-sm">Nenhum exercício encontrado com esse filtro.</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const isAlreadyAdded = alreadyAddedIds.includes(exercise.id);

              return (
                <div
                  key={exercise.id}
                  onClick={() => {
                    onSelectExercise(exercise);
                    onClose();
                  }}
                  className={`pt-2 flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isAlreadyAdded
                      ? 'bg-[#222222]/40 opacity-75 hover:bg-[#222222]'
                      : 'bg-[#161616] hover:bg-[#222222] border border-white/5 hover:border-[#00D1C1]/40'
                  }`}
                >
                  <div className="flex flex-col pr-2">
                    <span className="font-bold text-white text-sm">
                      {exercise.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                        {exercise.muscleGroup}
                      </span>
                      <span className="text-[11px] text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
                        {exercise.equipment}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                      isAlreadyAdded
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-bold shadow-md shadow-[#00D1C1]/20'
                    }`}
                  >
                    {isAlreadyAdded ? <Check size={16} /> : <Plus size={16} strokeWidth={3} />}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
