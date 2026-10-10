import { CompletedWorkout, CardioSession } from '../types';
import { formatWorkoutDuration, calculateEstimatedCalories } from './calc';

export interface MonthlyWrappedData {
  monthKey: string; // e.g. '2026-10'
  monthNamePT: string; // e.g. 'Outubro 2026'
  workoutsCount: number;
  totalVolumeKg: number;
  totalDurationSeconds: number;
  totalSets: number;
  totalReps: number;
  estimatedCalories: number;
  prsCount: number;
  topMuscleGroup: string;
  topMusclePercentage: number;
  comparisonText: string;
  comparisonIcon: string;
  cardioCount: number;
  cardioDistanceKm: number;
  cardioCalories: number;
  averageWeeklyFrequency: number;
}

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Computes the real-world weight equivalent comparison (beloved Spotify/Gym Wrapped trope)
 */
export function getWeightComparison(totalKg: number): { text: string; icon: string } {
  if (totalKg >= 200000) {
    const qty = (totalKg / 6000).toFixed(1);
    return { text: `Equivalente a levantar ${qty} Elefantes Africanos`, icon: '🐘' };
  }
  if (totalKg >= 100000) {
    const qty = Math.round(totalKg / 1200);
    return { text: `Equivalente a levantar ${qty} Carros Populares`, icon: '🚗' };
  }
  if (totalKg >= 50000) {
    const qty = (totalKg / 7000).toFixed(1);
    return { text: `Equivalente a levantar ${qty} Tiranossauros Rex`, icon: '🦖' };
  }
  if (totalKg >= 25000) {
    const qty = (totalKg / 5000).toFixed(1);
    return { text: `Equivalente a levantar ${qty} Caminhões Blindados`, icon: '🚛' };
  }
  if (totalKg >= 10000) {
    const qty = (totalKg / 2200).toFixed(1);
    return { text: `Equivalente a levantar ${qty} Rinocerontes Adultos`, icon: '🦏' };
  }
  if (totalKg >= 5000) {
    const qty = (totalKg / 1500).toFixed(1);
    return { text: `Equivalente a levantar ${qty} Hipopótamos`, icon: '🦛' };
  }
  if (totalKg > 0) {
    const qty = (totalKg / 400).toFixed(1);
    return { text: `Equivalente a levantar ${qty} Gorilas das Montanhas`, icon: '🦍' };
  }
  return { text: 'Início da jornada rumo ao topo', icon: '⚡' };
}

/**
 * Extracts distinct months present in the workout history (sorted from most recent to oldest)
 */
export function getAvailableMonths(history: CompletedWorkout[]): { key: string; label: string }[] {
  const map = new Map<string, string>();
  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  map.set(currentKey, `${MONTH_NAMES_PT[now.getMonth()]} ${now.getFullYear()}`);

  history.forEach((w) => {
    const date = new Date(w.completedAt || w.startedAt);
    if (!isNaN(date.getTime())) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${MONTH_NAMES_PT[date.getMonth()]} ${date.getFullYear()}`;
      map.set(key, label);
    }
  });

  return Array.from(map.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => b.key.localeCompare(a.key));
}

/**
 * Computes monthly wrapped metrics for a specific monthKey (e.g. '2026-10')
 */
export function calculateMonthlyWrappedData(
  history: CompletedWorkout[],
  monthKey: string,
  cardioSessions: CardioSession[] = []
): MonthlyWrappedData {
  const [yearStr, monthStr] = monthKey.split('-');
  const targetYear = parseInt(yearStr, 10);
  const targetMonth = parseInt(monthStr, 10) - 1; // 0-indexed

  const monthNamePT = `${MONTH_NAMES_PT[targetMonth] || 'Mês'} ${targetYear}`;

  // Filter workouts belonging to this month
  const monthWorkouts = history.filter((w) => {
    const d = new Date(w.completedAt || w.startedAt);
    return !isNaN(d.getTime()) && d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  // Filter cardio belonging to this month
  const monthCardio = cardioSessions.filter((s) => {
    const d = new Date(s.completedAt);
    return !isNaN(d.getTime()) && d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  let totalVolumeKg = 0;
  let totalDurationSeconds = 0;
  let totalSets = 0;
  let totalReps = 0;
  let estimatedCalories = 0;
  let prsCount = 0;
  const muscleVolumeMap = new Map<string, number>();

  monthWorkouts.forEach((w) => {
    totalVolumeKg += w.totalVolumeKg || 0;
    totalDurationSeconds += w.durationSeconds || 0;
    totalSets += w.totalSets || 0;
    totalReps += w.totalReps || 0;
    prsCount += w.personalRecords?.length || 0;

    const cal = w.estimatedCalories || calculateEstimatedCalories(w.durationSeconds, w.totalVolumeKg);
    estimatedCalories += cal;

    (w.exercises || []).forEach((ex) => {
      const m = ex.muscleGroup || 'Geral';
      const exVol = (ex.sets || []).reduce((acc, s) => acc + (s.completed ? (s.weight || 0) * (s.reps || 0) : 0), 0);
      muscleVolumeMap.set(m, (muscleVolumeMap.get(m) || 0) + exVol);
    });
  });

  // Cardio aggregations
  let cardioCount = monthCardio.length;
  let cardioDistanceKm = 0;
  let cardioCalories = 0;
  monthCardio.forEach((s) => {
    cardioDistanceKm += s.estimatedDistanceKm || 0;
    cardioCalories += s.estimatedCalories || 0;
    totalDurationSeconds += s.durationSeconds || 0;
  });
  cardioDistanceKm = Math.round(cardioDistanceKm * 10) / 10;
  estimatedCalories += cardioCalories;

  // Determine Top Muscle Group
  let topMuscleGroup = 'Corpo Inteiro';
  let topMuscleVolume = 0;
  muscleVolumeMap.forEach((vol, muscle) => {
    if (vol > topMuscleVolume) {
      topMuscleVolume = vol;
      topMuscleGroup = muscle;
    }
  });

  const topMusclePercentage = totalVolumeKg > 0 
    ? Math.round((topMuscleVolume / totalVolumeKg) * 100) 
    : 0;

  const comparison = getWeightComparison(totalVolumeKg);

  // Approximate weekly frequency (month ~4.3 weeks)
  const averageWeeklyFrequency = monthWorkouts.length > 0 
    ? parseFloat((monthWorkouts.length / 4.3).toFixed(1)) 
    : 0;

  return {
    monthKey,
    monthNamePT,
    workoutsCount: monthWorkouts.length,
    totalVolumeKg,
    totalDurationSeconds,
    totalSets,
    totalReps,
    estimatedCalories,
    prsCount,
    topMuscleGroup,
    topMusclePercentage,
    comparisonText: comparison.text,
    comparisonIcon: comparison.icon,
    cardioCount,
    cardioDistanceKm,
    cardioCalories,
    averageWeeklyFrequency
  };
}

/**
 * Generates an engaging formatted text version for sharing on social media / WhatsApp
 */
export function generateMonthlyWrappedShareText(data: MonthlyWrappedData, athleteName?: string): string {
  const durationStr = formatWorkoutDuration(data.totalDurationSeconds);
  const volumeStr = data.totalVolumeKg.toLocaleString('pt-BR');

  const lines = [
    `🎵⚡ THUNDER WRAPPED · ${data.monthNamePT.toUpperCase()}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    athleteName ? `👤 Atleta: ${athleteName}` : '',
    `🏋️ ${data.workoutsCount} Treinos Concluídos`,
    `⚖️ ${volumeStr} kg Levantados no Mês!`,
    `${data.comparisonIcon} ${data.comparisonText}`,
    `⏱️ ${durationStr} dedicados ao progresso`,
    `🔥 ~${data.estimatedCalories.toLocaleString('pt-BR')} kcal queimadas`,
    data.prsCount > 0 ? `🏆 ${data.prsCount} Recordes Pessoais (PRs) batidos!` : '',
    data.topMusclePercentage > 0 ? `🎯 Foco do Mês: ${data.topMuscleGroup} (${data.topMusclePercentage}% do volume)` : '',
    data.cardioCount > 0 ? `🚴 Cardio & Spinning: ${data.cardioCount} sessões (${data.cardioDistanceKm} km)` : '',
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💪 Consistência inabalável rumo à melhor versão!`,
    `#ThunderWrapped #GymWrapped #Fitness #Treino #Hipertrofia`
  ];

  return lines.filter(Boolean).join('\n');
}

/**
 * Helper to draw rounded rectangle on Canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Renders a high-resolution Spotify Wrapped style card to HTML5 Canvas (1080 x 1920, 9:16 vertical story format)
 */
export async function renderMonthlyWrappedCardToCanvas(
  data: MonthlyWrappedData,
  athleteName: string = 'Atleta Thunder',
  accentHex: string = '#00D1C1'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Deep Dark Obsidian Background
  ctx.fillStyle = '#07080B';
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. High-Energy Spotify Wrapped Organic Ambient Gradients
  const grad1 = ctx.createRadialGradient(200, 250, 50, 200, 250, 600);
  grad1.addColorStop(0, `${accentHex}40`);
  grad1.addColorStop(0.5, `${accentHex}15`);
  grad1.addColorStop(1, 'transparent');
  ctx.fillStyle = grad1;
  ctx.fillRect(0, 0, 1080, 800);

  const grad2 = ctx.createRadialGradient(900, 800, 60, 900, 800, 650);
  grad2.addColorStop(0, '#8B5CF635');
  grad2.addColorStop(0.6, '#8B5CF60F');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(400, 400, 680, 900);

  const grad3 = ctx.createRadialGradient(250, 1500, 60, 250, 1500, 700);
  grad3.addColorStop(0, '#F59E0B25');
  grad3.addColorStop(1, 'transparent');
  ctx.fillStyle = grad3;
  ctx.fillRect(0, 1100, 1080, 820);

  // 3. Subtle Geometric Tech Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let y = 100; y < 1920; y += 120) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(1000, y);
    ctx.stroke();
  }

  // 4. Header Badge / Top Bar
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px system-ui, -apple-system, sans-serif';
  ctx.fillText('⚡ THUNDER', 80, 140);

  // "WRAPPED" pill badge
  ctx.save();
  ctx.fillStyle = accentHex;
  roundRect(ctx, 330, 98, 240, 56, 28);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RETROSPECTIVA', 450, 136);
  ctx.restore();

  // Month Indicator Right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '700 24px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(data.monthNamePT.toUpperCase(), 1000, 138);
  ctx.textAlign = 'left';

  // 5. Athlete Callout & Headline
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '700 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(`ATLETA: ${athleteName.toUpperCase()}`, 80, 240);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 68px system-ui, -apple-system, sans-serif';
  ctx.fillText('Seu Mês no Ferro.', 80, 320);

  // 6. GIANT HERO CARD 1: Carga Total Acumulada (The Spotify Wrapped centerpiece)
  const heroCardY = 380;
  const heroCardW = 920;
  const heroCardH = 340;
  ctx.save();
  ctx.fillStyle = '#12131A';
  roundRect(ctx, 80, heroCardY, heroCardW, heroCardH, 36);
  ctx.fill();
  ctx.strokeStyle = `${accentHex}60`;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner subtle gradient
  const heroGrad = ctx.createLinearGradient(80, heroCardY, 1000, heroCardY + heroCardH);
  heroGrad.addColorStop(0, `${accentHex}18`);
  heroGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = heroGrad;
  roundRect(ctx, 80, heroCardY, heroCardW, heroCardH, 36);
  ctx.fill();

  // Hero Card Subtitle
  ctx.fillStyle = accentHex;
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('CARGA TOTAL ACUMULADA', 120, heroCardY + 65);

  // Giant Volume Number
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 96px system-ui, -apple-system, sans-serif';
  const volStr = data.totalVolumeKg.toLocaleString('pt-BR');
  ctx.fillText(`${volStr} kg`, 120, heroCardY + 175);

  // Real world comparison tag
  ctx.fillStyle = '#1A1C24';
  roundRect(ctx, 120, heroCardY + 220, 840, 75, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${data.comparisonIcon}  ${data.comparisonText}`, 145, heroCardY + 268);
  ctx.restore();

  // 7. GIANT HERO CARD 2: Número de Treinos no Mês
  const card2Y = 750;
  const card2H = 260;
  ctx.save();
  ctx.fillStyle = '#12131A';
  roundRect(ctx, 80, card2Y, heroCardW, card2H, 36);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Number & Label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('NÚMERO DE TREINOS NO MÊS', 120, card2Y + 65);

  ctx.fillStyle = accentHex;
  ctx.font = '900 88px system-ui, -apple-system, sans-serif';
  ctx.fillText(`${data.workoutsCount}`, 120, card2Y + 165);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 42px system-ui, -apple-system, sans-serif';
  ctx.fillText('sessões concluídas', 260, card2Y + 160);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '600 24px system-ui, -apple-system, sans-serif';
  const freqText = data.averageWeeklyFrequency > 0 
    ? `Média de ${data.averageWeeklyFrequency} treinos por semana · Consistência comprovada` 
    : 'Cada repetição conta no acumulado';
  ctx.fillText(`🔥 ${freqText}`, 120, card2Y + 220);
  ctx.restore();

  // 8. 4-STAT GRID of Key Monthly Insights
  const gridY = 1040;
  const cellW = 445;
  const cellH = 190;
  const col1X = 80;
  const col2X = 555;
  const row2Y = gridY + cellH + 25;

  const drawMiniCell = (
    x: number,
    y: number,
    label: string,
    val: string,
    sub: string,
    color: string,
    icon: string
  ) => {
    ctx.save();
    ctx.fillStyle = '#12131A';
    roundRect(ctx, x, y, cellW, cellH, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '800 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${icon}  ${label.toUpperCase()}`, x + 28, y + 46);

    ctx.fillStyle = color;
    ctx.font = '900 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(val, x + 28, y + 115);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '600 20px system-ui, -apple-system, sans-serif';
    ctx.fillText(sub, x + 28, y + 155);
    ctx.restore();
  };

  // Cell 1: Tempo Dedicado
  const durStr = formatWorkoutDuration(data.totalDurationSeconds);
  drawMiniCell(col1X, gridY, 'Tempo Total', durStr, 'Horas dedicadas ao ferro', '#60A5FA', '⏱️');

  // Cell 2: Gasto Calórico
  drawMiniCell(col2X, gridY, 'Gasto Estimado', `~${data.estimatedCalories.toLocaleString('pt-BR')} kcal`, 'Energia total despendida', '#F59E0B', '🔥');

  // Cell 3: Foco Muscular
  drawMiniCell(col1X, row2Y, 'Foco Principal', data.topMuscleGroup, `${data.topMusclePercentage}% do volume total`, '#A78BFA', '🎯');

  // Cell 4: Recordes Batidos (PRs)
  const prsLabel = data.prsCount > 0 ? `${data.prsCount} Superados` : `${data.totalSets} Séries`;
  const prsSub = data.prsCount > 0 ? 'Novas marcas pessoais (PRs)' : `${data.totalReps} repetições totais`;
  drawMiniCell(col2X, row2Y, 'Recordes / Séries', prsLabel, prsSub, accentHex, '🏆');

  // 9. Highlight Quote Banner (Spotify Wrapped style bottom statement)
  const quoteY = 1480;
  ctx.save();
  ctx.fillStyle = '#14151E';
  roundRect(ctx, 80, quoteY, heroCardW, 170, 30);
  ctx.fill();
  ctx.strokeStyle = `${accentHex}40`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('“A consistência vence o talento quando o talento não treina.”', 120, quoteY + 68);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '600 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(`Você finalizou ${data.workoutsCount} treinos em ${data.monthNamePT}. O trabalho duro nunca mente.`, 120, quoteY + 118);
  ctx.restore();

  // 10. Footer / Watermark
  const footerY = 1720;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(80, footerY, heroCardW, 1);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px system-ui, -apple-system, sans-serif';
  ctx.fillText('THUNDER', 80, footerY + 60);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '600 20px system-ui, -apple-system, sans-serif';
  ctx.fillText('TREINE. REGISTRE. DESCANSE. EVOLUA.', 240, footerY + 58);

  ctx.fillStyle = accentHex;
  ctx.font = '800 22px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('#ThunderWrapped', 1000, footerY + 58);
  ctx.textAlign = 'left';

  return canvas;
}
