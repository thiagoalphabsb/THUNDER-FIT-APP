import { CompletedWorkout } from '../types';
import { formatDatePT, formatWorkoutDuration, calculateEstimatedCalories } from './calc';

/**
 * Generates an engaging, formatted text summary with emojis ready to be shared
 * on WhatsApp, Instagram captions, Twitter/X, Telegram or copied to clipboard.
 */
export function generateWorkoutShareText(workout: CompletedWorkout, athleteName?: string): string {
  const dateStr = formatDatePT(workout.completedAt || workout.startedAt);
  const durationStr = formatWorkoutDuration(workout.durationSeconds);
  const volumeStr = workout.totalVolumeKg.toLocaleString('pt-BR');
  const setsCount = workout.totalSets;
  const repsCount = workout.totalReps;
  const caloriesBurned = workout.estimatedCalories || calculateEstimatedCalories(workout.durationSeconds, workout.totalVolumeKg);

  const header = `⚡ RESUMO DO TREINO — THUNDER\n━━━━━━━━━━━━━━━━━━━━━━━`;
  const athleteLine = athleteName ? `👤 Atleta: ${athleteName}\n` : '';
  const routineLine = `🏋️ Treino: ${workout.routineName || 'Treino Concluído'}`;
  const metaLine = `📅 Data: ${dateStr} | ⏱ Duração: ${durationStr} | 🔥 Gasto: ~${caloriesBurned} kcal`;
  const statsLine = `📊 Volume Total: ${volumeStr} kg | 🔁 Séries: ${setsCount} | Repetições: ${repsCount}`;

  // PR Section
  let prSection = '';
  if (workout.personalRecords && workout.personalRecords.length > 0) {
    const prCount = workout.personalRecords.length;
    const prList = workout.personalRecords
      .map((pr) => `   ⭐ ${pr.exerciseName}: ${pr.weight} kg × ${pr.reps} reps!`)
      .join('\n');
    prSection = `\n🏆 Recordes Superados (${prCount} PR${prCount > 1 ? 's' : ''}):\n${prList}\n`;
  }

  // Top exercises list (up to 4 key exercises)
  const exercisesSummary = (workout.exercises || [])
    .slice(0, 5)
    .map((ex) => {
      const completed = ex.sets.filter((s) => s.completed);
      const active = completed.length > 0 ? completed : ex.sets || [];
      if (active.length === 0) return null;

      const topSet = active.reduce((best, s) => {
        if (!best) return s;
        if ((s.weight || 0) > (best.weight || 0)) return s;
        if ((s.weight || 0) === (best.weight || 0) && (s.reps || 0) > (best.reps || 0)) return s;
        return best;
      }, active[0]);

      return `• ${ex.exerciseName}: ${topSet ? `${topSet.weight} kg × ${topSet.reps} reps` : `${active.length} séries`}`;
    })
    .filter(Boolean)
    .join('\n');

  const exerciseSection = exercisesSummary
    ? `\n🔥 Principais Cargas:\n${exercisesSummary}\n`
    : '';

  const notesSection = workout.notes ? `\n💬 Observações: "${workout.notes}"\n` : '';

  const footer = `━━━━━━━━━━━━━━━━━━━━━━━\n💪 Superando limites a cada treino!\n#ThunderWorkout #Treino #Hipertrofia #Musculacao #Foco`;

  return [
    header,
    athleteLine + routineLine,
    metaLine,
    statsLine,
    prSection,
    exerciseSection,
    notesSection,
    footer
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Renders a high-resolution, social-media ready image card (1080x1350, 4:5 Instagram ratio)
 * into an HTML5 Canvas, completely client-side without external dependencies.
 */
export function renderWorkoutShareCanvas(
  workout: CompletedWorkout,
  athleteName?: string
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');

  if (!ctx) return canvas;

  // 1. Background with deep gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
  bgGrad.addColorStop(0, '#0E0E12');
  bgGrad.addColorStop(0.5, '#121217');
  bgGrad.addColorStop(1, '#09090C');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1350);

  // 2. Ambient neon glows
  // Top-left Tiffany glow
  const glow1 = ctx.createRadialGradient(150, 150, 10, 150, 150, 400);
  glow1.addColorStop(0, 'rgba(0, 209, 193, 0.22)');
  glow1.addColorStop(1, 'rgba(0, 209, 193, 0)');
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, 800, 800);

  // Bottom-right amber glow
  const glow2 = ctx.createRadialGradient(930, 1200, 10, 930, 1200, 450);
  glow2.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
  glow2.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = glow2;
  ctx.fillRect(400, 700, 680, 650);

  // 3. Card Outer Frame with subtle border
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 3;
  roundRect(ctx, 40, 40, 1000, 1270, 36);
  ctx.stroke();
  ctx.restore();

  // 4. Header Badge: "THUNDER WORKOUT TRACKER"
  ctx.save();
  ctx.fillStyle = 'rgba(0, 209, 193, 0.12)';
  roundRect(ctx, 80, 80, 420, 52, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 209, 193, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#00D1C1';
  ctx.font = '900 20px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('⚡ THUNDER WORKOUT PRO', 104, 114);
  ctx.restore();

  // Athlete Name tag on top right if available
  if (athleteName) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '700 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(athleteName, 1000, 114);
    ctx.textAlign = 'left';
  }

  // 5. Workout Title
  const title = workout.routineName || 'Treino Concluído';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 52px system-ui, -apple-system, sans-serif';
  
  // Wrap title if too long
  const maxTitleWidth = 920;
  if (ctx.measureText(title).width > maxTitleWidth) {
    ctx.font = '900 42px system-ui, -apple-system, sans-serif';
  }
  ctx.fillText(title, 80, 195);

  // 6. Subtitle: Date, Duration & Estimated Calories
  const dateStr = formatDatePT(workout.completedAt || workout.startedAt);
  const durStr = formatWorkoutDuration(workout.durationSeconds);
  const caloriesBurned = workout.estimatedCalories || calculateEstimatedCalories(workout.durationSeconds, workout.totalVolumeKg);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '600 24px system-ui, -apple-system, sans-serif';
  ctx.fillText(`📅 ${dateStr}  ·  ⏱ Duração: ${durStr}  ·  🔥 ~${caloriesBurned} kcal`, 80, 245);

  // 7. Four KPI Stat Cards (2x2 Grid)
  const cardY = 295;
  const cardW = 445;
  const cardH = 150;
  const col1X = 80;
  const col2X = 555;
  const row2Y = cardY + cardH + 20;

  // Helper for KPI boxes
  const drawKpiCard = (
    x: number,
    y: number,
    label: string,
    value: string,
    subValue: string,
    accentColor: string,
    icon: string
  ) => {
    ctx.save();
    // Background
    ctx.fillStyle = '#18181E';
    roundRect(ctx, x, y, cardW, cardH, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top label with icon
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${icon}  ${label.toUpperCase()}`, x + 24, y + 42);

    // Big Value
    ctx.fillStyle = accentColor;
    ctx.font = '900 44px system-ui, -apple-system, sans-serif';
    ctx.fillText(value, x + 24, y + 96);

    // Subvalue
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText(subValue, x + 24, y + 128);

    ctx.restore();
  };

  // Card 1: Volume Total
  drawKpiCard(
    col1X,
    cardY,
    'Volume Total',
    `${workout.totalVolumeKg.toLocaleString('pt-BR')} kg`,
    'Carga total levantada',
    '#00D1C1',
    '🏋️'
  );

  // Card 2: Duração & Gasto Calórico
  drawKpiCard(
    col2X,
    cardY,
    'Tempo & Gasto',
    durStr,
    `~${caloriesBurned} kcal estimadas`,
    '#F59E0B',
    '🔥'
  );

  // Card 3: Séries e Reps
  drawKpiCard(
    col1X,
    row2Y,
    'Volume de Séries',
    `${workout.totalSets} séries`,
    `${workout.totalReps} repetições concluídas`,
    '#A78BFA',
    '🔁'
  );

  // Card 4: Recordes Batidos (PRs)
  const prsCount = workout.personalRecords?.length || 0;
  drawKpiCard(
    col2X,
    row2Y,
    'Recordes Pessoais',
    prsCount > 0 ? `${prsCount} Superado${prsCount > 1 ? 's' : ''}` : '100% Executado',
    prsCount > 0 ? 'Novas marcas históricas (PR)' : 'Consistência impecável',
    prsCount > 0 ? '#F59E0B' : '#34D399',
    prsCount > 0 ? '⭐' : '🎯'
  );

  // 8. Exercises Highlights Section
  const exBoxY = row2Y + cardH + 28;
  const exBoxH = 430;

  ctx.save();
  ctx.fillStyle = '#16161B';
  roundRect(ctx, 80, exBoxY, 920, exBoxH, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Section Header
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('🔥 DESTAQUES DOS EXERCÍCIOS', 114, exBoxY + 48);

  ctx.fillStyle = '#00D1C1';
  ctx.font = '700 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${workout.exercises?.length || 0} exercícios`, 966, exBoxY + 48);
  ctx.textAlign = 'left';

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(114, exBoxY + 68);
  ctx.lineTo(966, exBoxY + 68);
  ctx.stroke();

  // Draw exercise rows (up to 4 exercises)
  const exercises = (workout.exercises || []).slice(0, 4);
  const rowStartY = exBoxY + 115;
  const rowSpacing = 82;

  exercises.forEach((ex, idx) => {
    const curY = rowStartY + idx * rowSpacing;

    const completed = ex.sets.filter((s) => s.completed);
    const active = completed.length > 0 ? completed : ex.sets || [];

    const topSet = active.reduce((best, s) => {
      if (!best) return s;
      if ((s.weight || 0) > (best.weight || 0)) return s;
      if ((s.weight || 0) === (best.weight || 0) && (s.reps || 0) > (best.reps || 0)) return s;
      return best;
    }, active[0]);

    const exVolume = active.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);

    // Number badge
    ctx.fillStyle = 'rgba(0, 209, 193, 0.15)';
    roundRect(ctx, 114, curY - 26, 36, 36, 10);
    ctx.fill();
    ctx.fillStyle = '#00D1C1';
    ctx.font = '900 18px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(idx + 1), 132, curY - 2);
    ctx.textAlign = 'left';

    // Exercise Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 22px system-ui, -apple-system, sans-serif';
    const truncatedName = ex.exerciseName.length > 28 ? ex.exerciseName.slice(0, 26) + '...' : ex.exerciseName;
    ctx.fillText(truncatedName, 166, curY - 3);

    // Muscle Group
    ctx.fillStyle = '#6B7280';
    ctx.font = '600 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(ex.muscleGroup || 'Geral', 166, curY + 20);

    // Top working load & sets on right
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00D1C1';
    ctx.font = '900 24px system-ui, -apple-system, sans-serif';
    const topLoadStr = topSet ? `${topSet.weight} kg × ${topSet.reps} r` : `${active.length} séries`;
    ctx.fillText(topLoadStr, 966, curY - 3);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.font = '600 16px system-ui, -apple-system, sans-serif';
    ctx.fillText(`${active.length} séries · ${exVolume.toLocaleString('pt-BR')} kg`, 966, curY + 20);
    ctx.textAlign = 'left';
  });

  ctx.restore();

  // 9. Footer Call-to-action
  const footerY = 1205;
  ctx.save();
  ctx.fillStyle = '#00D1C1';
  ctx.font = '900 22px system-ui, -apple-system, sans-serif';
  ctx.fillText('⚡ THUNDER WORKOUT', 80, footerY);

  ctx.fillStyle = '#6B7280';
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('Superando limites a cada repetição · #ThunderWorkout #SobrecargaProgressiva', 80, footerY + 28);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '700 18px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('thunder.build.app', 1000, footerY + 12);
  ctx.restore();

  return canvas;
}

/**
 * Helper to draw rounded rectangle paths on a 2D canvas
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
 * Downloads the rendered canvas card as a PNG image file
 */
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies the canvas image directly to the system clipboard as a PNG blob
 */
export async function copyCanvasImageToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        console.warn('Failed to copy image to clipboard:', err);
        resolve(false);
      }
    }, 'image/png');
  });
}

/**
 * Copies text string to clipboard with fallback
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}
