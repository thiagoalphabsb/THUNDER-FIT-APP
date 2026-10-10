import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, 
  Play, 
  Dumbbell, 
  Trash2, 
  Edit3, 
  Copy, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  Sparkles,
  ArrowUp,
  ArrowDown,
  History,
  Calendar,
  Zap,
  Star,
  Repeat,
  Layers,
  ChevronRight,
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Search
} from 'lucide-react';
import { CompletedWorkout, Exercise, MuscleGroup, Routine, RoutineExerciseTemplate } from '../types';
import { formatDatePT, formatWorkoutDuration, isIsometricExercise, formatHoldDuration } from '../utils/calc';
import { soundFx } from '../utils/audio';
import { exportRoutinesToCSV, downloadFile, parseRoutinesFromCSV, getExerciseDisplayName } from '../utils/routineTransfer';
import { WEEKDAYS, getRoutineEffectiveDays } from '../utils/weekday';

interface RoutinesViewProps {
  routines: Routine[];
  exercises: Exercise[];
  history?: CompletedWorkout[];
  onStartRoutine: (routine: Routine) => void;
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onReorderRoutines?: (newRoutines: Routine[]) => void;
  onImportRoutines?: (importedRoutines: Routine[], mode: 'append' | 'replace', newExercises?: Exercise[]) => void;
  onOpenAddExerciseModal: () => void;
  onRepeatWorkout?: (workout: CompletedWorkout) => void;
  onDeleteHistoryItem?: (workoutId: string) => void;
  onNavigateToFullHistory?: () => void;
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

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  exercises,
  history = [],
  onStartRoutine,
  onSaveRoutine,
  onDeleteRoutine,
  onReorderRoutines,
  onImportRoutines,
  onRepeatWorkout,
  onDeleteHistoryItem,
  onNavigateToFullHistory
}) => {
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [swappingExerciseIndex, setSwappingExerciseIndex] = useState<number | null>(null);
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState<string>('Todos');
  const [isFullHistoryOpen, setIsFullHistoryOpen] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  // Helper to open exercise picker with fresh search
  const handleOpenExercisePicker = (swapIndex: number | null = null) => {
    setSwappingExerciseIndex(swapIndex);
    setPickerSearchQuery('');
    setPickerMuscleFilter('Todos');
    setIsExercisePickerOpen(true);
  };

  // Filtered exercises for the exercise picker modal (searching 300+ catalog)
  const filteredPickerExercises = useMemo(() => {
    const query = pickerSearchQuery.trim().toLowerCase();
    return exercises.filter((ex) => {
      // Muscle filter
      if (pickerMuscleFilter !== 'Todos' && ex.muscleGroup !== pickerMuscleFilter) {
        return false;
      }
      // Search query
      if (query) {
        const matchesName = ex.name.toLowerCase().includes(query);
        const matchesMuscle = ex.muscleGroup.toLowerCase().includes(query);
        const matchesEquip = ex.equipment ? ex.equipment.toLowerCase().includes(query) : false;
        const matchesSecondary = ex.secondaryMuscles
          ? ex.secondaryMuscles.some((m) => m.toLowerCase().includes(query))
          : false;
        return matchesName || matchesMuscle || matchesEquip || matchesSecondary;
      }
      return true;
    });
  }, [exercises, pickerSearchQuery, pickerMuscleFilter]);

  // Import / Export state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedRoutines, setParsedRoutines] = useState<Routine[]>([]);
  const [detectedNewExercises, setDetectedNewExercises] = useState<Exercise[]>([]);
  const [importStats, setImportStats] = useState<{ matchedLibraryCount: number; customCreatedCount: number }>({
    matchedLibraryCount: 0,
    customCreatedCount: 0
  });
  const [importFileName, setImportFileName] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Move routine up/down in the list
  const handleMoveRoutine = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= routines.length) return;
    const updated = [...routines];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    soundFx.playTick();
    if (onReorderRoutines) {
      onReorderRoutines(updated);
    }
  };

  // Export routines as CSV
  const handleExportCSV = () => {
    if (routines.length === 0) {
      alert('Não há treinos cadastrados para exportar.');
      return;
    }
    const csvData = exportRoutinesToCSV(routines, exercises);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvData, `treinos_thunder_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    soundFx.playCelebration();
  };

  // Download Sample CSV template
  const handleDownloadSampleCSV = () => {
    const sampleCSV = '\uFEFF' + [
      'Rotina;Descricao;Grupos_Musculares;Exercicio;Series;Repeticoes;Carga_Kg;Descanso_Seg;Notas',
      'Treino A - Peito & Tríceps;Foco em hipertrofia;Peito, Tríceps;Supino Reto com Barra;4;8;60;120;Manter escápulas retraídas',
      'Treino A - Peito & Tríceps;Foco em hipertrofia;Peito, Tríceps;Supino Inclinado com Halteres;3;10;24;90;Amplitude máxima',
      'Treino A - Peito & Tríceps;Foco em hipertrofia;Peito, Tríceps;Tríceps Corda no Cross;3;12;25;60;Pico de contração',
      'Treino B - Costas & Bíceps;Foco em puxadas;Costas, Bíceps;Puxada Alta Frontal;4;10;50;90;Foco no dorsal',
      'Treino B - Costas & Bíceps;Foco em puxadas;Costas, Bíceps;Remada Baixa Triângulo;3;10;45;90;Tronco estável',
      'Treino B - Costas & Bíceps;Foco em puxadas;Costas, Bíceps;Rosca Direta com Barra W;3;10;15;60;Sem balançar o corpo'
    ].join('\r\n');
    downloadFile(sampleCSV, 'modelo_treinos_thunder.csv', 'text/csv;charset=utf-8;');
  };

  // Process selected CSV file for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);
    setImportSuccessMsg(null);
    setParsedRoutines([]);
    setDetectedNewExercises([]);
    setImportStats({ matchedLibraryCount: 0, customCreatedCount: 0 });

    // Check extension
    if (!file.name.toLowerCase().endsWith('.csv') && file.type && !file.type.includes('csv') && !file.type.includes('text')) {
      setImportError('Formato inválido. Por favor, envie um arquivo de planilha no formato .CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        if (!content || !content.trim()) {
          setImportError('O arquivo selecionado está vazio.');
          return;
        }

        // Parse as CSV with automatic standard library matching & technical notes
        const {
          routines: importedRoutines,
          newExercisesCreated,
          matchedLibraryCount,
          customCreatedCount
        } = parseRoutinesFromCSV(content, exercises);

        if (importedRoutines.length === 0) {
          throw new Error('Nenhum treino identificado no arquivo CSV. Verifique se as colunas estão corretas.');
        }

        setParsedRoutines(importedRoutines);
        setDetectedNewExercises(newExercisesCreated);
        setImportStats({ matchedLibraryCount, customCreatedCount });
      } catch (err: any) {
        console.error('Erro ao ler arquivo de importação:', err);
        setImportError(err.message || 'Erro ao processar a planilha CSV. Verifique a formatação.');
      }
    };

    reader.onerror = () => {
      setImportError('Erro ao ler o arquivo selecionado.');
    };

    reader.readAsText(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (parsedRoutines.length === 0) return;
    if (onImportRoutines) {
      onImportRoutines(parsedRoutines, importMode, detectedNewExercises);
    } else {
      parsedRoutines.forEach((r) => onSaveRoutine(r));
    }
    soundFx.playCelebration();
    setImportSuccessMsg(`${parsedRoutines.length} treino(s) importado(s) com sucesso!`);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setParsedRoutines([]);
      setDetectedNewExercises([]);
      setImportFileName('');
      setImportSuccessMsg(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1200);
  };

  // Open modal to create a new routine
  const handleOpenCreateModal = () => {
    const newRoutine: Routine = {
      id: `routine-${Date.now()}`,
      name: 'Novo Treino',
      description: 'Foco em progressão de carga.',
      targetMuscles: ['Peito', 'Tríceps'],
      createdAt: new Date().toISOString(),
      order: routines.length,
      exercises: []
    };
    setEditingRoutine(newRoutine);
    setIsEditingModalOpen(true);
  };

  // Open modal to edit existing routine
  const handleOpenEditModal = (routine: Routine) => {
    setEditingRoutine(JSON.parse(JSON.stringify(routine)));
    setIsEditingModalOpen(true);
  };

  // Duplicate routine
  const handleDuplicateRoutine = (routine: Routine) => {
    const copy: Routine = {
      ...JSON.parse(JSON.stringify(routine)),
      id: `routine-${Date.now()}`,
      name: `${routine.name} (Cópia)`,
      order: routines.length,
      createdAt: new Date().toISOString()
    };
    onSaveRoutine(copy);
  };

  // Save routine changes
  const handleSaveRoutineChanges = () => {
    if (!editingRoutine || !editingRoutine.name.trim()) {
      alert('Por favor, informe o nome do treino.');
      return;
    }
    if (editingRoutine.exercises.length === 0) {
      alert('Adicione pelo menos um exercício ao treino.');
      return;
    }
    onSaveRoutine(editingRoutine);
    setIsEditingModalOpen(false);
    setEditingRoutine(null);
  };

  // Add or swap exercise in editing routine
  const handleAddExerciseToRoutine = (ex: Exercise) => {
    if (!editingRoutine) return;

    if (
      swappingExerciseIndex !== null &&
      swappingExerciseIndex >= 0 &&
      swappingExerciseIndex < editingRoutine.exercises.length
    ) {
      const updated = [...editingRoutine.exercises];
      const isIso = ex.isIsometric || isIsometricExercise(ex);
      updated[swappingExerciseIndex] = {
        ...updated[swappingExerciseIndex],
        exerciseId: ex.id,
        exerciseName: ex.name,
        targetReps: isIso ? (updated[swappingExerciseIndex].targetReps === 10 ? 45 : updated[swappingExerciseIndex].targetReps) : updated[swappingExerciseIndex].targetReps,
        initialWeight: isIso ? (updated[swappingExerciseIndex].initialWeight === 20 ? 0 : updated[swappingExerciseIndex].initialWeight) : updated[swappingExerciseIndex].initialWeight,
        restSeconds: ex.defaultRestSeconds || (isIso ? 60 : updated[swappingExerciseIndex].restSeconds || 120),
        isIsometric: isIso
      };
      setEditingRoutine({
        ...editingRoutine,
        exercises: updated
      });
      setSwappingExerciseIndex(null);
    } else {
      const isIso = ex.isIsometric || isIsometricExercise(ex);
      const newTemplate: RoutineExerciseTemplate = {
        exerciseId: ex.id,
        exerciseName: ex.name,
        setsCount: 3,
        targetReps: isIso ? 45 : 10,
        initialWeight: isIso ? 0 : 20,
        restSeconds: ex.defaultRestSeconds || (isIso ? 60 : 120),
        notes: '',
        isIsometric: isIso
      };
      setEditingRoutine({
        ...editingRoutine,
        exercises: [...editingRoutine.exercises, newTemplate]
      });
    }
    setIsExercisePickerOpen(false);
  };

  // Remove exercise from editing routine
  const handleRemoveExerciseFromRoutine = (index: number) => {
    if (!editingRoutine) return;
    const updated = [...editingRoutine.exercises];
    updated.splice(index, 1);
    setEditingRoutine({ ...editingRoutine, exercises: updated });
  };

  // Reorder template up/down within editing modal
  const handleMoveTemplate = (index: number, direction: 'up' | 'down') => {
    if (!editingRoutine) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= editingRoutine.exercises.length) return;
    const updated = [...editingRoutine.exercises];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setEditingRoutine({ ...editingRoutine, exercises: updated });
  };

  return (
    <div id="routines-view" className="space-y-6 pb-28 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-black tracking-widest text-[#00D1C1] uppercase">
            PROGRAMAÇÃO DE TREINOS
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Minhas Rotinas
          </h1>
        </div>

        {/* Create Routine Button */}
        <button
          id="create-routine-btn"
          onClick={handleOpenCreateModal}
          className="py-2.5 px-3.5 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus size={16} strokeWidth={3} />
          <span>NOVA ROTINA</span>
        </button>
      </div>

      {/* List of Routines with Reordering */}
      <div className="space-y-3">
        {routines.length === 0 ? (
          <div className="bg-[#161616] border border-dashed border-white/10 rounded-3xl p-8 text-center">
            <Dumbbell className="mx-auto text-neutral-600 mb-3" size={36} />
            <h3 className="font-bold text-white text-base mb-1">Nenhum treino criado</h3>
            <p className="text-xs text-neutral-400 mb-4">Crie sua primeira rotina personalizada.</p>
            <button
              onClick={handleOpenCreateModal}
              className="py-3 px-5 bg-[#00D1C1] text-black font-black rounded-2xl text-xs"
            >
              Criar Treino Agora
            </button>
          </div>
        ) : (
          routines.map((routine, index) => {
            const isExpanded = expandedRoutineId === routine.id;
            const totalSets = routine.exercises.reduce((acc, curr) => acc + curr.setsCount, 0);

            return (
              <div
                key={routine.id}
                id={`routine-card-${routine.id}`}
                className="bg-[#161616] border border-white/5 rounded-3xl p-4 shadow-xl transition-all"
              >
                {/* Routine Card Header: Badges Strip on Left, Reorder & Action Controls on Right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {/* Position Badge - Fixed */}
                    <span className="shrink-0 text-[10px] font-black font-mono-numbers text-white bg-white/10 px-2 py-0.5 rounded-md border border-white/10 whitespace-nowrap">
                      #{index + 1}
                    </span>

                    {/* Single-line Scrollable Badges Strip (Days + Target Muscles) */}
                    <div
                      className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto custom-scrollbar-x pb-0.5 pt-0.5 flex-nowrap scroll-smooth"
                      title="Dias agendados e grupos musculares alvo (rolagem horizontal)"
                      onWheel={(e) => {
                        if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth) {
                          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                            e.currentTarget.scrollLeft += e.deltaY;
                          }
                        }
                      }}
                    >
                      {/* Days of Week Badge */}
                      {getRoutineEffectiveDays(routine).map((dayIdx) => {
                        const wDay = WEEKDAYS[dayIdx];
                        return (
                          <span
                            key={dayIdx}
                            className="shrink-0 text-[10px] font-extrabold uppercase text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1 whitespace-nowrap"
                          >
                            <span>📅</span> {wDay ? wDay.shortName : `Dia ${dayIdx}`}
                          </span>
                        );
                      })}

                      {/* Subtle divider if both days and muscles exist */}
                      {getRoutineEffectiveDays(routine).length > 0 && routine.targetMuscles.length > 0 && (
                        <span className="h-2.5 w-px bg-white/15 shrink-0" aria-hidden="true" />
                      )}

                      {/* Target Muscles - strictly single line */}
                      {routine.targetMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="shrink-0 text-[10px] font-black uppercase text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20 whitespace-nowrap transition-colors hover:bg-[#00D1C1]/20"
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reorder and Action Buttons */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMoveRoutine(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-neutral-400 hover:text-[#00D1C1] disabled:text-neutral-700 disabled:hover:bg-transparent rounded-xl hover:bg-white/5 transition-colors"
                      title="Mover treino para cima"
                    >
                      <ArrowUp size={15} />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMoveRoutine(index, 'down')}
                      disabled={index === routines.length - 1}
                      className="p-1.5 text-neutral-400 hover:text-[#00D1C1] disabled:text-neutral-700 disabled:hover:bg-transparent rounded-xl hover:bg-white/5 transition-colors"
                      title="Mover treino para baixo"
                    >
                      <ArrowDown size={15} />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(routine)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                      title="Editar rotina"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDuplicateRoutine(routine)}
                      className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                      title="Duplicar rotina"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir a rotina "${routine.name}"?`)) {
                          onDeleteRoutine(routine.id);
                        }
                      }}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                      title="Excluir rotina"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Routine Name & Description - Spans full card width without line break */}
                <div className="mt-2.5">
                  <h3
                    className="font-black text-white text-lg tracking-tight whitespace-nowrap truncate"
                    title={routine.name}
                  >
                    {routine.name}
                  </h3>
                  <p
                    className="text-xs text-neutral-400 whitespace-nowrap truncate mt-0.5"
                    title={routine.description || `${routine.exercises.length} exercícios`}
                  >
                    {routine.description || `${routine.exercises.length} exercícios`}
                  </p>
                </div>

                {/* Metadata info */}
                <div className="flex items-center gap-3 my-3 text-xs text-neutral-300">
                  <span className="bg-[#222222] px-2.5 py-1 rounded-xl border border-white/5 font-mono-numbers">
                    🏋️ {routine.exercises.length} exercícios
                  </span>
                  <span className="bg-[#222222] px-2.5 py-1 rounded-xl border border-white/5 font-mono-numbers">
                    ⚡ {totalSets} séries
                  </span>
                  {routine.lastPerformed && (
                    <span className="text-neutral-500 text-[11px]">
                      Último: {formatDatePT(routine.lastPerformed)}
                    </span>
                  )}
                </div>

                {/* Exercises Preview (Collapsible) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-in fade-in">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">
                      Exercícios inclusos:
                    </span>
                    {routine.exercises.map((item, idx) => {
                      const displayName = getExerciseDisplayName(item, exercises);
                      const isIso = item.isIsometric || isIsometricExercise(item) || isIsometricExercise(exercises.find(e => e.id === item.exerciseId));

                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#222222] rounded-xl border border-white/5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-[#161616] text-[#00D1C1] font-mono-numbers font-black flex items-center justify-center text-[10px]">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-white">
                                {displayName}
                              </span>
                              {isIso && (
                                <span className="text-[9px] font-black text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                                  ⏱️ ISOMETRIA
                                </span>
                              )}
                            </div>
                            <span className="text-neutral-400 font-mono-numbers text-[11px]">
                              {item.setsCount} séries × {isIso ? `${item.targetReps}s sustentação` : `${item.targetReps} reps`}
                              {item.initialWeight > 0 ? ` (${isIso ? `+${item.initialWeight}kg` : `${item.initialWeight}kg`})` : ''}
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-[10px] text-neutral-400 italic pl-7 line-clamp-2">
                              📝 {item.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                    className="py-2.5 px-3 bg-[#222222] hover:bg-[#2c2c2c] text-neutral-300 rounded-2xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={14} /> Recolher
                      </>
                    ) : (
                      <>
                        <ChevronDown size={14} /> Ver Exercícios
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playTick();
                      onStartRoutine(routine);
                    }}
                    className="flex-1 py-2.5 px-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Play size={15} fill="currentColor" />
                    INICIAR ESTE TREINO
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER SECTION: Histórico de Treinos (Minimizado por padrão) */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        {/* Footer Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 flex items-center justify-center text-[#00D1C1]">
              <History size={16} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                Histórico de Treinos
                <span className="text-[10px] font-black font-mono-numbers px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/5">
                  {history.length}
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">
                Sessões concluídas e registros anteriores
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                onClick={() => {
                  setIsFullHistoryOpen(!isFullHistoryOpen);
                  soundFx.playTick();
                }}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                  isFullHistoryOpen
                    ? 'bg-[#222222] text-neutral-300 border-white/10 hover:text-white'
                    : 'bg-[#00D1C1] text-black border-[#00D1C1] font-black shadow-md shadow-[#00D1C1]/20 active:scale-95'
                }`}
                title={isFullHistoryOpen ? 'Recolher para o último treino' : 'Ver histórico completo'}
              >
                <span>{isFullHistoryOpen ? 'Menos Treinos' : 'Ver Completo'}</span>
                {isFullHistoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}

            {onNavigateToFullHistory && isFullHistoryOpen && (
              <button
                onClick={onNavigateToFullHistory}
                className="py-1.5 px-3 bg-[#222222] hover:bg-[#2c2c2c] text-[#00D1C1] text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1 transition-colors"
                title="Ir para página completa de histórico"
              >
                Aba Histórico
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {history.length === 0 ? (
          <div className="bg-[#161616] border border-dashed border-white/10 rounded-2xl p-5 text-center animate-in fade-in">
            <Clock className="mx-auto text-neutral-600 mb-2" size={24} />
            <p className="text-xs font-bold text-neutral-300">Nenhum treino concluído ainda</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Ao finalizar uma sessão de treino, ela aparecerá automaticamente aqui no histórico.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            {/* List to display: either only the last workout (history.slice(0, 1)) or expanded list (history.slice(0, 8)) */}
            {(isFullHistoryOpen ? history.slice(0, 8) : history.slice(0, 1)).map((workout, wIdx) => {
              const isItemExpanded = expandedHistoryId === workout.id;
              const isLatest = wIdx === 0;

              return (
                <div
                  key={workout.id}
                  className={`bg-[#161616] border rounded-2xl p-3.5 shadow-lg transition-all ${
                    isLatest && !isFullHistoryOpen
                      ? 'border-[#00D1C1]/40 shadow-[#00D1C1]/5'
                      : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {isLatest && !isFullHistoryOpen && (
                          <span className="text-[9px] font-black tracking-wider text-black bg-[#00D1C1] px-2 py-0.5 rounded-md uppercase font-mono">
                            Último Treino Realizado
                          </span>
                        )}
                        <span className="text-[10px] font-black font-mono-numbers text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                          {formatDatePT(workout.completedAt || workout.startedAt)}
                        </span>
                        {workout.personalRecords && workout.personalRecords.length > 0 && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                            <Star size={10} className="fill-amber-400" />
                            {workout.personalRecords.length} PR(s)
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-sm">{workout.routineName}</h4>

                      {/* Quick metrics */}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-400 font-mono-numbers flex-wrap">
                        <span className="bg-[#222222] px-2 py-0.5 rounded-lg border border-white/5 text-neutral-300">
                          ⏱️ {formatWorkoutDuration(workout.durationSeconds)}
                        </span>
                        <span className="bg-[#222222] px-2 py-0.5 rounded-lg border border-white/5 text-neutral-300">
                          ⚡ {workout.totalSets} séries
                        </span>
                        <span className="bg-[#222222] px-2 py-0.5 rounded-lg border border-white/5 text-neutral-300">
                          ⚖️ {Math.round(workout.totalVolumeKg).toLocaleString()} kg
                        </span>
                      </div>
                    </div>

                    {/* Repeat & Expand */}
                    <div className="flex items-center gap-1 pt-1">
                      {onRepeatWorkout && (
                        <button
                          onClick={() => onRepeatWorkout(workout)}
                          className="p-2 bg-[#00D1C1]/15 hover:bg-[#00D1C1]/25 text-[#00D1C1] border border-[#00D1C1]/30 rounded-xl transition-all"
                          title="Repetir este treino"
                        >
                          <Repeat size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedHistoryId(isItemExpanded ? null : workout.id)}
                        className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
                        title="Detalhes do treino"
                      >
                        {isItemExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      {onDeleteHistoryItem && (
                        <button
                          onClick={() => {
                            if (confirm('Deseja excluir este treino do histórico?')) {
                              onDeleteHistoryItem(workout.id);
                            }
                          }}
                          className="p-2 text-neutral-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                          title="Excluir treino"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detailed Exercises Preview */}
                  {isItemExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-in fade-in">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        Exercícios Realizados:
                      </span>
                      {workout.exercises.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-2 bg-[#222222] rounded-xl border border-white/5 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-white">
                            <span>{ex.exerciseName}</span>
                            <span className="text-[10px] text-neutral-400 font-mono-numbers">
                              {ex.sets.filter((s) => s.completed).length} séries
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {ex.sets.filter((s) => s.completed).map((set, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] bg-[#161616] px-1.5 py-0.5 rounded text-neutral-300 font-mono-numbers border border-white/5"
                              >
                                {set.weight}kg × {set.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* If minimized and there are more workouts, show a button to expand */}
            {!isFullHistoryOpen && history.length > 1 && (
              <button
                onClick={() => {
                  setIsFullHistoryOpen(true);
                  soundFx.playTick();
                }}
                className="w-full py-2 px-3 bg-[#161616] hover:bg-[#202020] text-[#00D1C1] hover:text-[#15e8d7] border border-white/10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Ver Histórico Completo ({history.length} treinos)</span>
                <ChevronDown size={14} />
              </button>
            )}

            {/* If fully open and navigation exists */}
            {isFullHistoryOpen && onNavigateToFullHistory && (
              <button
                onClick={onNavigateToFullHistory}
                className="w-full py-2.5 bg-[#161616] hover:bg-[#202020] text-neutral-300 hover:text-white border border-white/10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                Ver todos os {history.length} treinos na aba Histórico →
              </button>
            )}
          </div>
        )}
      </div>

      {/* CSV Data Management & Transfer Section (Destaque no final da página) */}
      <div
        id="routines-csv-transfer-section"
        className="bg-gradient-to-b from-[#18181b] to-[#121214] border-2 border-[#00D1C1]/30 rounded-3xl p-5 space-y-4 shadow-xl shadow-[#00D1C1]/5 relative overflow-hidden"
      >
        {/* Decorative subtle ambient glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#00D1C1]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00D1C1]/15 text-[#00D1C1] flex items-center justify-center border border-[#00D1C1]/30 shrink-0 shadow-inner">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#00D1C1] bg-[#00D1C1]/15 px-2 py-0.5 rounded-md border border-[#00D1C1]/30">
                  Gerenciamento CSV
                </span>
                <span className="text-[10px] font-semibold text-neutral-400">
                  Compatível com Excel & Sheets
                </span>
              </div>
              <h3 className="font-black text-white text-base mt-1">
                Importar & Exportar Rotinas
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Faça backup das suas rotinas ou envie uma planilha personalizada com exercícios, séries e cargas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadSampleCSV}
            className="text-[11px] font-bold text-neutral-400 hover:text-[#00D1C1] flex items-center gap-1.5 self-start sm:self-center transition-colors underline-offset-2 hover:underline shrink-0"
            title="Baixar planilha de exemplo para preenchimento"
          >
            <FileText size={13} />
            <span>Baixar Modelo CSV</span>
          </button>
        </div>

        {/* Big Prominent Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 relative z-10">
          {/* Export Button - Highlighted Dark/Cyan */}
          <button
            type="button"
            id="export-routines-btn"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#1f1f23] hover:bg-[#27272c] text-white hover:text-[#00D1C1] border border-white/10 hover:border-[#00D1C1]/50 rounded-2xl font-black text-xs transition-all shadow-md active:scale-[0.98] cursor-pointer group"
            title="Exportar todas as rotinas para planilha CSV (Excel)"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#00D1C1]/20 text-[#00D1C1] flex items-center justify-center transition-colors">
              <Download size={18} />
            </div>
            <div className="text-left">
              <span className="block leading-tight font-black tracking-wide text-xs">EXPORTAR ROTINAS (CSV)</span>
              <span className="block text-[10px] text-neutral-400 font-normal">Baixar planilha das rotinas atuais</span>
            </div>
          </button>

          {/* Import Button - Super Highlighted in Cyan */}
          <button
            type="button"
            id="import-routines-btn"
            onClick={() => {
              setImportFileName('');
              setParsedRoutines([]);
              setDetectedNewExercises([]);
              setImportError(null);
              setImportSuccessMsg(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black rounded-2xl font-black text-xs transition-all shadow-lg shadow-[#00D1C1]/25 active:scale-[0.98] cursor-pointer group"
            title="Importar novas rotinas via arquivo CSV"
          >
            <div className="w-8 h-8 rounded-xl bg-black/10 group-hover:bg-black/20 text-black flex items-center justify-center transition-colors">
              <Upload size={18} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <span className="block leading-tight font-black tracking-wide text-xs">IMPORTAR ROTINAS (CSV)</span>
              <span className="block text-[10px] text-black/75 font-semibold">Carregar rotinas da planilha</span>
            </div>
          </button>
        </div>
      </div>

      {/* Routine Creator/Editor Modal */}
      {isEditingModalOpen && editingRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-3xl p-5 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-black text-lg text-white">
                {editingRoutine.id.startsWith('routine-') ? 'Editar Rotina' : 'Nova Rotina'}
              </h3>
              <button
                onClick={() => setIsEditingModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Fields Scrollable */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
              {/* Routine Name */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Nome da Rotina *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Push A — Peitoral e Tríceps"
                  value={editingRoutine.name}
                  onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
                  className="w-full bg-[#222222] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D1C1]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Foco em supino e sobrecarga progressiva"
                  value={editingRoutine.description || ''}
                  onChange={(e) => setEditingRoutine({ ...editingRoutine, description: e.target.value })}
                  className="w-full bg-[#222222] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00D1C1]"
                />
              </div>

              {/* Target Muscles Checkbox Pills */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5">
                  Grupos Musculares Alvo:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {MUSCLE_GROUPS.map((m) => {
                    const isSelected = editingRoutine.targetMuscles.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? editingRoutine.targetMuscles.filter((item) => item !== m)
                            : [...editingRoutine.targetMuscles, m];
                          setEditingRoutine({ ...editingRoutine, targetMuscles: updated });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#00D1C1] text-black font-black'
                            : 'bg-[#222222] text-neutral-300 border border-white/5'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day of Week Selector */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1">
                  Dias da Semana Agendados:
                  <span className="text-[11px] text-neutral-400 font-normal ml-1.5">
                    (aparece automaticamente como Treino de Hoje)
                  </span>
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((wDay) => {
                    const currentDays = editingRoutine.daysOfWeek || [];
                    const isSelected = currentDays.includes(wDay.index);
                    return (
                      <button
                        key={wDay.index}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? currentDays.filter((d) => d !== wDay.index)
                            : [...currentDays, wDay.index];
                          setEditingRoutine({ ...editingRoutine, daysOfWeek: updated });
                        }}
                        className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-400/20'
                            : 'bg-[#222222] text-neutral-400 hover:text-white border border-white/5'
                        }`}
                      >
                        <span className="text-[10px] font-black">{wDay.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exercises in Routine */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-neutral-300">
                    Exercícios ({editingRoutine.exercises.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => handleOpenExercisePicker(null)}
                    className="py-1 px-3 bg-[#00D1C1]/15 hover:bg-[#00D1C1]/25 text-[#00D1C1] border border-[#00D1C1]/30 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> Adicionar Exercício
                  </button>
                </div>

                <div className="space-y-2">
                  {editingRoutine.exercises.map((template, idx) => {
                    const displayName = getExerciseDisplayName(template, exercises);
                    const isIso = template.isIsometric || isIsometricExercise(template) || isIsometricExercise(exercises.find(e => e.id === template.exerciseId));

                    return (
                      <div
                        key={idx}
                        className={`bg-[#222222] border rounded-2xl p-3 space-y-2.5 ${
                          isIso ? 'border-amber-500/30' : 'border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="w-5 h-5 rounded-md bg-[#161616] text-[#00D1C1] font-mono-numbers font-black flex items-center justify-center text-[10px] flex-shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={template.exerciseName || displayName}
                              onChange={(e) => {
                                const updated = [...editingRoutine.exercises];
                                updated[idx].exerciseName = e.target.value;
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="font-bold text-white text-xs bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#00D1C1] focus:bg-[#161616] px-1 py-0.5 rounded focus:outline-none w-full truncate"
                              placeholder="Nome do exercício"
                            />
                            {isIso && (
                              <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30 flex-shrink-0">
                                ⏱️ ISOMETRIA
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenExercisePicker(idx)}
                              title="Trocar por exercício do catálogo"
                              className="px-2 py-1 text-[10px] font-bold text-[#00D1C1] bg-[#00D1C1]/10 hover:bg-[#00D1C1]/20 rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Repeat size={11} /> Trocar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveTemplate(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                            >
                              <ChevronUp size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveTemplate(idx, 'down')}
                              disabled={idx === editingRoutine.exercises.length - 1}
                              className="p-1 text-neutral-400 hover:text-white disabled:opacity-20"
                            >
                              <ChevronDown size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExerciseFromRoutine(idx)}
                              className="p-1 text-neutral-500 hover:text-rose-400"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Config: Sets, Reps, Weight, Rest */}
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-[#161616] p-1.5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-neutral-400 uppercase block">Séries</span>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={template.setsCount}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                const updated = [...editingRoutine.exercises];
                                updated[idx].setsCount = val;
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="w-full bg-transparent text-center font-bold text-white font-mono-numbers focus:outline-none"
                            />
                          </div>

                          <div className="bg-[#161616] p-1.5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-neutral-400 uppercase block">{isIso ? 'Tempo (s)' : 'Reps'}</span>
                            <input
                              type="number"
                              min="1"
                              max={isIso ? 600 : 100}
                              value={template.targetReps}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 1;
                                const updated = [...editingRoutine.exercises];
                                updated[idx].targetReps = val;
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="w-full bg-transparent text-center font-bold text-white font-mono-numbers focus:outline-none"
                            />
                          </div>

                          <div className="bg-[#161616] p-1.5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-neutral-400 uppercase block">{isIso ? 'Carga (kg)' : 'Carga (kg)'}</span>
                            <input
                              type="number"
                              step="0.5"
                              value={template.initialWeight === 0 ? '' : template.initialWeight}
                              placeholder="0"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                const updated = [...editingRoutine.exercises];
                                updated[idx].initialWeight = val;
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="w-full bg-transparent text-center font-bold text-white font-mono-numbers focus:outline-none"
                            />
                          </div>

                          <div className="bg-[#161616] p-1.5 rounded-xl border border-white/5">
                            <span className="text-[10px] text-neutral-400 uppercase block">Descanso</span>
                            <input
                              type="number"
                              step="15"
                              value={template.restSeconds}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 120;
                                const updated = [...editingRoutine.exercises];
                                updated[idx].restSeconds = val;
                                setEditingRoutine({ ...editingRoutine, exercises: updated });
                              }}
                              className="w-full bg-transparent text-center font-bold text-[#00D1C1] font-mono-numbers focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Notes / Description */}
                        <div>
                          <input
                            type="text"
                            placeholder="Descrição / Notas do exercício (ex: dropset, banco a 30°, execução controlada)"
                            value={template.notes || ''}
                            onChange={(e) => {
                              const updated = [...editingRoutine.exercises];
                              updated[idx].notes = e.target.value;
                              setEditingRoutine({ ...editingRoutine, exercises: updated });
                            }}
                            className="w-full bg-[#161616] border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#00D1C1]/50"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingModalOpen(false)}
                className="py-3 px-4 bg-[#222222] text-neutral-300 font-bold text-xs rounded-2xl border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRoutineChanges}
                className="flex-1 py-3 px-4 bg-[#00D1C1] hover:bg-[#15e8d7] text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center justify-center gap-1.5"
              >
                <Check size={16} strokeWidth={3} />
                SALVAR ROTINA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Routines Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#161616] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00D1C1]/10 border border-[#00D1C1]/20 flex items-center justify-center text-[#00D1C1]">
                  <Upload size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Importar Treinos (CSV)</h3>
                  <p className="text-[11px] text-neutral-400">Importe suas rotinas via planilha CSV (Excel / Google Planilhas)</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportError(null);
                  setImportSuccessMsg(null);
                }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* File upload zone */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv, text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="routine-file-input"
              />
              <label
                htmlFor="routine-file-input"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 hover:border-[#00D1C1]/50 bg-[#1c1c1c] hover:bg-[#202020] rounded-2xl cursor-pointer transition-all text-center group"
              >
                <FileSpreadsheet className="text-neutral-500 group-hover:text-[#00D1C1] mb-2 transition-colors" size={32} />
                <span className="text-xs font-bold text-white mb-0.5">
                  {importFileName ? importFileName : 'Clique para selecionar sua planilha CSV'}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Suporta arquivos de planilha <strong className="text-neutral-300">.CSV</strong> (separados por ponto e vírgula ou vírgula)
                </span>
              </label>
            </div>

            {/* Download CSV Model Template Helper */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#202020] border border-white/5 text-xs">
              <div className="flex items-center gap-2 text-neutral-300">
                <HelpCircle size={15} className="text-[#00D1C1] shrink-0" />
                <span className="text-[11px]">Deseja ver a estrutura das colunas?</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleCSV}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[#00D1C1] text-[11px] font-bold rounded-lg border border-[#00D1C1]/20 flex items-center gap-1 transition-colors"
              >
                <Download size={11} />
                Baixar Modelo CSV
              </button>
            </div>

            {/* Error Message */}
            {importError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Erro na importação</p>
                  <p className="text-[11px] text-rose-200/80 mt-0.5">{importError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {importSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="font-bold">{importSuccessMsg}</span>
              </div>
            )}

            {/* Parsed Preview */}
            {parsedRoutines.length > 0 && (
              <div className="space-y-3 pt-1 border-t border-white/10 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-300">
                    Treinos encontrados ({parsedRoutines.length}):
                  </span>
                  <div className="flex items-center gap-1.5">
                    {importStats.matchedLibraryCount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                        <Check size={10} />
                        {importStats.matchedLibraryCount} na biblioteca
                      </span>
                    )}
                    {detectedNewExercises.length > 0 && (
                      <span className="text-[10px] font-bold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                        +{detectedNewExercises.length} novos
                      </span>
                    )}
                  </div>
                </div>

                {/* Library sync status banner */}
                <div className="p-2.5 bg-[#00D1C1]/10 border border-[#00D1C1]/20 rounded-xl flex items-center gap-2 text-[11px] text-[#00D1C1]">
                  <Sparkles size={14} className="shrink-0" />
                  <span className="leading-tight">
                    Exercícios associados à biblioteca oficial com <strong>notas técnicas</strong> e descansos padronizados.
                  </span>
                </div>

                {/* List of parsed routines */}
                <div className="max-h-56 overflow-y-auto space-y-2 p-1">
                  {parsedRoutines.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#222222] rounded-xl border border-white/5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-xs">{r.name}</p>
                          <p className="text-[10px] text-neutral-400">
                            {r.targetMuscles.join(', ')} • {r.exercises.length} exercício(s)
                          </p>
                        </div>
                        <span className="text-[10px] font-mono-numbers text-neutral-400 bg-black/40 px-2 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                      
                      {/* Exercise list with notes & standard badges */}
                      <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                        {r.exercises.map((exItem, exIdx) => {
                          const isCustom = exItem.exerciseId.startsWith('custom-ex-');
                          const displayName = getExerciseDisplayName(exItem, [...exercises, ...detectedNewExercises]);
                          const isIso = exItem.isIsometric || isIsometricExercise(exItem);
                          return (
                            <div key={exIdx} className="bg-black/30 p-2 rounded-lg space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCustom ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                                  <span className="font-bold text-neutral-200 truncate">{displayName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono-numbers">
                                  <span className="text-neutral-400">
                                    {exItem.setsCount}x{exItem.targetReps}{isIso ? 's' : ''} {exItem.initialWeight > 0 ? `(${exItem.initialWeight}kg)` : ''}
                                  </span>
                                  <span className="text-neutral-500">⏱ {exItem.restSeconds}s</span>
                                </div>
                              </div>
                              {exItem.notes && (
                                <p className="text-[10px] text-[#00D1C1]/90 pl-3 italic line-clamp-2">
                                  "{exItem.notes}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mode Selector */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Modo de Importação:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setImportMode('append')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        importMode === 'append'
                          ? 'bg-[#00D1C1]/15 border-[#00D1C1] text-white'
                          : 'bg-[#222222] border-white/5 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <p className="text-xs font-black flex items-center gap-1.5">
                        {importMode === 'append' && <Check size={12} className="text-[#00D1C1]" />}
                        Adicionar
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                        Mantém os treinos atuais e adiciona estes no fim
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setImportMode('replace')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        importMode === 'replace'
                          ? 'bg-rose-500/15 border-rose-400 text-white'
                          : 'bg-[#222222] border-white/5 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <p className="text-xs font-black flex items-center gap-1.5 text-rose-300">
                        {importMode === 'replace' && <Check size={12} className="text-rose-400" />}
                        Substituir
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                        Apaga os treinos atuais e mantém só os novos
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportError(null);
                  setImportSuccessMsg(null);
                }}
                className="py-3 px-4 bg-[#222222] text-neutral-300 font-bold text-xs rounded-2xl border border-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={parsedRoutines.length === 0}
                onClick={handleConfirmImport}
                className="flex-1 py-3 px-4 bg-[#00D1C1] hover:bg-[#15e8d7] disabled:bg-neutral-800 disabled:text-neutral-600 text-black font-black text-xs rounded-2xl shadow-lg shadow-[#00D1C1]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Upload size={15} strokeWidth={2.5} />
                CONFIRMAR IMPORTAÇÃO ({parsedRoutines.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal for Routine Builder */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3">
          <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-3xl p-4 max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              {swappingExerciseIndex !== null && editingRoutine && editingRoutine.exercises[swappingExerciseIndex] ? (
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00D1C1] uppercase tracking-wider">
                    <Repeat size={12} />
                    <span>Trocar Exercício</span>
                  </div>
                  <h3 className="font-black text-white text-sm truncate">
                    Substituir:{' '}
                    <span className="text-neutral-200">
                      {editingRoutine.exercises[swappingExerciseIndex].exerciseName ||
                        getExerciseDisplayName(editingRoutine.exercises[swappingExerciseIndex], exercises)}
                    </span>
                  </h3>
                </div>
              ) : (
                <div>
                  <h3 className="font-bold text-white text-base">Selecionar Exercício</h3>
                  <p className="text-[11px] text-neutral-400">Escolha um exercício do catálogo ({exercises.length}+ disponíveis)</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative pt-3 pb-2">
              <Search size={16} className="absolute left-3.5 top-[23px] text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                placeholder="Buscar por nome, músculo ou equipamento..."
                autoFocus
                className="w-full bg-[#222222] border border-white/10 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00D1C1] focus:ring-1 focus:ring-[#00D1C1] transition-all"
              />
              {pickerSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPickerSearchQuery('')}
                  className="absolute right-3.5 top-[23px] p-0.5 text-neutral-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Muscle Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
              {['Todos', ...MUSCLE_GROUPS, 'Funcional'].map((group) => {
                const isSelected = pickerMuscleFilter === group;
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setPickerMuscleFilter(group)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-bold transition-all ${
                      isSelected
                        ? 'bg-[#00D1C1] text-black font-black shadow-md shadow-[#00D1C1]/20'
                        : 'bg-[#222222] text-neutral-300 hover:bg-[#2c2c2c] border border-white/5'
                    }`}
                  >
                    {group}
                  </button>
                );
              })}
            </div>

            {/* Results Count & Clear Filter */}
            <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 py-1.5 border-t border-white/5">
              <span>
                {filteredPickerExercises.length}{' '}
                {filteredPickerExercises.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
              </span>
              {(pickerSearchQuery.trim() !== '' || pickerMuscleFilter !== 'Todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setPickerSearchQuery('');
                    setPickerMuscleFilter('Todos');
                  }}
                  className="text-[#00D1C1] hover:underline font-bold"
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto py-1 space-y-1.5 pr-0.5">
              {filteredPickerExercises.length > 0 ? (
                filteredPickerExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExerciseToRoutine(ex)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#222222] hover:bg-[#2c2c2c] active:scale-[0.99] cursor-pointer border border-white/5 hover:border-[#00D1C1]/30 transition-all group"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="font-bold text-white text-xs group-hover:text-[#00D1C1] transition-colors truncate">
                        {ex.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold text-[#00D1C1] bg-[#00D1C1]/10 px-2 py-0.5 rounded-md border border-[#00D1C1]/20">
                          {ex.muscleGroup}
                        </span>
                        {ex.equipment && (
                          <span className="text-[10px] text-neutral-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                            {ex.equipment}
                          </span>
                        )}
                        {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                          <span className="text-[10px] text-neutral-400">
                            +{ex.secondaryMuscles.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#00D1C1]/10 text-[#00D1C1] font-bold text-[11px] shrink-0 group-hover:bg-[#00D1C1] group-hover:text-black transition-colors">
                      {swappingExerciseIndex !== null ? (
                        <>
                          <Repeat size={13} />
                          <span>Trocar</span>
                        </>
                      ) : (
                        <>
                          <Plus size={13} />
                          <span>Adicionar</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4 bg-[#222222]/50 rounded-2xl border border-white/5 space-y-2">
                  <Dumbbell size={28} className="mx-auto text-neutral-500" />
                  <p className="text-xs font-bold text-neutral-300">Nenhum exercício encontrado</p>
                  <p className="text-[11px] text-neutral-500">
                    Tente buscar com outro termo ou selecionar outra categoria muscular.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerSearchQuery('');
                      setPickerMuscleFilter('Todos');
                    }}
                    className="mt-2 px-3 py-1.5 bg-[#00D1C1]/15 text-[#00D1C1] border border-[#00D1C1]/30 rounded-xl text-xs font-bold hover:bg-[#00D1C1]/25 transition-colors"
                  >
                    Ver todos os exercícios
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
