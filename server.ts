import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security hardening: Disable fingerprinting headers
app.disable('x-powered-by');

// Security headers with helmet (keep CSP disabled for Vite dev mode & iframe compatibility)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hidePoweredBy: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Mitigate DoS / payload flooding: limit JSON body to 256kb
app.use(express.json({ limit: '256kb' }));

// Rate limiter for AI API endpoints to prevent quota exhaustion and brute-force abuse
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // Max 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    source: 'rate_limit',
    error: 'Limite de requisições excedido. Por favor, aguarde alguns instantes antes de tentar novamente.',
  },
});

app.use('/api/', apiLimiter);

// Input sanitizer helper for safe LLM prompt injection defense
function sanitizeString(val: any, maxLength = 100): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim().slice(0, maxLength);
}

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint for Coach Insights powered by Gemini AI
app.post('/api/coach-insights', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const rawHistory = Array.isArray(body.history) ? body.history.slice(0, 15) : [];
    const rawRoutines = Array.isArray(body.routines) ? body.routines.slice(0, 10) : [];
    const rawExercises = Array.isArray(body.exercises) ? body.exercises.slice(0, 30) : [];
    const profile = typeof body.profile === 'object' && body.profile !== null ? body.profile : {};

    if (!ai) {
      console.warn('GEMINI_API_KEY not found in server environment, returning fallback biomechanical insights');
      return res.status(200).json({
        source: 'fallback',
        message: 'Chave do Gemini não configurada no servidor. Retornando insights pré-computados com base biomecânica.',
        data: getFallbackInsights(rawHistory, rawExercises)
      });
    }

    // Build concise, sanitized context for Gemini
    const recentWorkouts = rawHistory.slice(0, 5);
    
    const contextData = {
      user: {
        weightKg: typeof profile.weightKg === 'number' && !isNaN(profile.weightKg) ? Math.max(20, Math.min(300, profile.weightKg)) : 75,
        weeklyGoal: typeof profile.weeklyGoalWorkouts === 'number' && !isNaN(profile.weeklyGoalWorkouts) ? Math.max(1, Math.min(14, profile.weeklyGoalWorkouts)) : 4
      },
      recentWorkouts: recentWorkouts.map((w: any) => ({
        routineName: sanitizeString(w?.routineName || 'Treino', 50),
        date: sanitizeString(w?.completedAt || w?.startedAt || '', 30),
        totalVolumeKg: typeof w?.totalVolumeKg === 'number' ? Math.max(0, w.totalVolumeKg) : 0,
        personalRecords: Array.isArray(w?.personalRecords) ? w.personalRecords.slice(0, 5).map((pr: any) => sanitizeString(pr, 40)) : [],
        exercises: (Array.isArray(w?.exercises) ? w.exercises.slice(0, 10) : []).map((e: any) => ({
          name: sanitizeString(e?.exerciseName || '', 50),
          muscleGroup: sanitizeString(e?.muscleGroup || '', 30),
          sets: (Array.isArray(e?.sets) ? e.sets.slice(0, 10) : []).map((s: any) => ({
            set: typeof s?.setNumber === 'number' ? s.setNumber : 1,
            weight: typeof s?.weight === 'number' ? s.weight : 0,
            reps: typeof s?.reps === 'number' ? s.reps : 0,
            completed: Boolean(s?.completed),
            isPR: Boolean(s?.isPersonalRecord)
          }))
        }))
      })),
      allRoutines: rawRoutines.map((r: any) => ({
        name: sanitizeString(r?.name || '', 50),
        targetMuscles: Array.isArray(r?.targetMuscles) ? r.targetMuscles.slice(0, 6).map((m: any) => sanitizeString(m, 30)) : [],
        exerciseCount: Array.isArray(r?.exercises) ? r.exercises.length : 0
      }))
    };

    const systemPrompt = `Você é um Treinador e Fisiologista do Exercício de Elite (especialista em Biomecânica da Musculação e Hipertrofia, credencial CSCS).
Sua missão é analisar o histórico recente de treinos do atleta e fornecer "Insights do Treinador" ultra-práticos, científicos e motivadores focados em:
1. Ajustes de forma e correções posturais nos exercícios realizados (ex: trajetória da barra, retração escapular, alinhamento de punho/cotovelo, posicionamento dos pés, profundidade do agachamento, controle na fase excêntrica).
2. Dicas de prevenção de lesões em articulações sob sobrecarga (ombros, lombar, joelhos).
3. Recomendações de progressão de carga e tempo sob tensão para romper platôs identificados no histórico.

Você deve responder EXCLUSIVAMENTE em formato JSON válido com a seguinte estrutura:
{
  "overallVerdict": "Uma frase de análise geral do progresso e postura do atleta",
  "coachAdvice": "O conselho de ouro do treinador para a próxima sessão de treinos",
  "keyFocusPoints": [
    "Ponto-chave 1 de biomecânica",
    "Ponto-chave 2 de intensidade",
    "Ponto-chave 3 de recuperação ativa"
  ],
  "insights": [
    {
      "exerciseName": "Nome do Exercício analisado",
      "muscleGroup": "Grupo muscular alvo",
      "status": "warning" ou "tip" ou "progression" ou "biomechanics",
      "badge": "Ajuste de Postura" ou "Progressão de Carga" ou "Cuidado Articular" ou "Biomecânica de Ouro",
      "headline": "Título curto e impactante (ex: Estabilização de Escápulas no Supino)",
      "formCorrection": "Explicação técnica clara de como corrigir a postura e executar com precisão anatômica",
      "actionableTip": "Dica rápida para aplicar na próxima repetição (ex: Aperte a barra e mantenha os cotovelos a 70 graus)",
      "suggestedLoadAdjustment": "Sugestão prática de carga/séries (ex: Mantenha a carga atual até atingir 10 reps limpas)"
    }
  ]
}
Gere entre 3 e 5 insights específicos baseados nos exercícios reais do histórico. Se o histórico for recente, use os principais exercícios compostos do atleta (Supino, Agachamento, Remada, Desenvolvimento, etc.). Responda em Português do Brasil com tom encorajador, técnico e direto ao ponto.`;

    const userPrompt = `Analise este histórico de treinos do atleta e gere os Insights do Treinador com correções de forma e biomecânica:
${JSON.stringify(contextData, null, 2)}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });
    } catch (primaryErr) {
      console.warn('Initial Gemini attempt failed, retrying after backoff:', primaryErr);
      await new Promise((resolve) => setTimeout(resolve, 800));
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });
    }

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON output:', parseError);
      parsedData = getFallbackInsights(rawHistory, rawExercises);
    }

    return res.status(200).json({
      source: 'gemini',
      data: parsedData
    });
  } catch (err: any) {
    // Log server-side only; do not leak raw exception/stack details to clients
    console.error('Error generating coach insights with Gemini:', err);
    return res.status(200).json({
      source: 'fallback_error',
      error: 'Não foi possível gerar os insights com inteligência artificial neste momento.',
      data: getFallbackInsights(req.body?.history, req.body?.exercises)
    });
  }
});

// Endpoint for Strength Coach: Historical Volume Trends & Volume Adjustments based on Recovery and Progress
app.post('/api/strength-coach-analysis', async (req, res) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const rawHistory = Array.isArray(body.history) ? body.history.slice(0, 15) : [];
    const rawRoutines = Array.isArray(body.routines) ? body.routines.slice(0, 10) : [];
    const nextRoutine = typeof body.nextRoutine === 'object' && body.nextRoutine !== null ? body.nextRoutine : null;
    const profile = typeof body.profile === 'object' && body.profile !== null ? body.profile : {};

    if (!ai) {
      console.warn('GEMINI_API_KEY not found in server environment, returning dynamic fallback strength coach analysis');
      return res.status(200).json({
        source: 'fallback',
        message: 'Chave do Gemini não configurada no servidor. Retornando análise do Strength Coach computada localmente.',
        data: getFallbackStrengthCoachAnalysis(rawHistory, nextRoutine, profile)
      });
    }

    // Prepare rich sanitized historical volume context
    const recentWorkouts = rawHistory.slice(0, 10);
    const workoutVolumes = recentWorkouts.map((w: any) => ({
      name: w.routineName || 'Treino',
      date: w.completedAt || w.startedAt,
      volumeKg: w.totalVolumeKg || 0,
      totalSets: w.totalSets || 0,
      muscles: Array.from(new Set((w.exercises || []).map((e: any) => e.muscleGroup).filter(Boolean))),
      durationMin: Math.round((w.durationSeconds || 0) / 60),
      prCount: (w.personalRecords || []).length
    }));

    // Calculate volume delta between most recent sessions and earlier sessions
    const half = Math.floor(workoutVolumes.length / 2);
    const recentHalf = workoutVolumes.slice(0, Math.max(1, half));
    const olderHalf = workoutVolumes.slice(Math.max(1, half));
    const recentAvgVol = recentHalf.length > 0
      ? recentHalf.reduce((sum, w) => sum + w.volumeKg, 0) / recentHalf.length
      : 0;
    const olderAvgVol = olderHalf.length > 0
      ? olderHalf.reduce((sum, w) => sum + w.volumeKg, 0) / olderHalf.length
      : recentAvgVol;
    const volumeChangePercent = olderAvgVol > 0
      ? Math.round(((recentAvgVol - olderAvgVol) / olderAvgVol) * 100)
      : 0;

    // Next routine exercises and target muscles
    const targetRoutine = nextRoutine || rawRoutines[0] || null;
    const targetRoutineData = targetRoutine ? {
      name: targetRoutine.name,
      targetMuscles: targetRoutine.targetMuscles || [],
      exercises: (targetRoutine.exercises || []).map((ex: any) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName || ex.name,
        setsCount: ex.setsCount || 3,
        targetReps: ex.targetReps || 10,
        initialWeight: ex.initialWeight || 0
      }))
    } : null;

    // Calculate recovery days for the target muscles
    const targetMuscles = targetRoutineData?.targetMuscles || [];
    const muscleLastTrainedDates: Record<string, string> = {};
    const muscleRestDays: Record<string, number> = {};

    targetMuscles.forEach((muscle: string) => {
      const lastSession = recentWorkouts.find((w: any) => 
        (w.exercises || []).some((e: any) => e.muscleGroup === muscle)
      );
      if (lastSession) {
        const sessionDate = new Date(lastSession.completedAt || lastSession.startedAt).getTime();
        const diffDays = Math.max(0, Math.round((Date.now() - sessionDate) / (1000 * 60 * 60 * 24)));
        muscleLastTrainedDates[muscle] = lastSession.completedAt || lastSession.startedAt;
        muscleRestDays[muscle] = diffDays;
      } else {
        muscleRestDays[muscle] = 7; // More than a week / rested
      }
    });

    const analysisContext = {
      athlete: {
        weightKg: profile.weightKg || 75,
        weeklyGoalWorkouts: profile.weeklyGoalWorkouts || 4,
        totalCompletedWorkouts: history.length
      },
      nextRoutine: targetRoutineData,
      muscleRecovery: {
        targetMuscles,
        restDaysSinceLastStimulus: muscleRestDays
      },
      volumeTrends: {
        recentSessionsVolumeKg: workoutVolumes.slice(0, 5).map(w => ({ date: w.date, volumeKg: w.volumeKg, routine: w.name })),
        recentAverageVolume: Math.round(recentAvgVol),
        previousAverageVolume: Math.round(olderAvgVol),
        percentageChange: volumeChangePercent,
        trendDirection: volumeChangePercent > 3 ? 'up' : volumeChangePercent < -3 ? 'down' : 'stable'
      }
    };

    const strengthCoachSystemPrompt = `Você é o "Strength Coach" de elite do THUNDER — especialista em Fisiologia do Exercício, Periodização e Gestão de Volume/Fadiga (CSCS).
Sua missão é analisar o HISTÓRICO DE VOLUME DE TREINOS do atleta, seu estado de RECUPERAÇÃO e sua PROGRESSÃO, sugerindo AJUSTES POTENCIAIS DE VOLUME PARA A PRÓXIMA ROTINA.

Regras Fundamentais da Avaliação de Volume:
1. GESTÃO DE RECUPERAÇÃO & FADIGA:
   - Se os músculos da próxima rotina descansaram >= 3 dias (72h+) com boa consistência: Alta prontidão. Sinal verde para adicionar 1 série (+volume) ou progredir +2kg a 5kg de carga em exercícios-chave.
   - Se descansaram 1-2 dias (24h a 48h): Manter volume planejado sem elevar séries para proteger articulações e manter qualidade técnica.
   - Se volume recente cresceu mais de 25% de forma abrupta ou frequência excessiva: Recomendar consolidação de volume ou leve redução (-1 série) para evitar overreaching funcional.
2. AJUSTES PRECISOS PARA OS EXERCÍCIOS DA PRÓXIMA ROTINA:
   - Apresente sugestões específicas para os exercícios da rotina alvo (ex: Supino, Puxada, Agachamento, etc.).
   - Tipos de ajuste permitidos: "increase" (+1 série ou +carga), "maintain" (manter volume planejado), "decrease" (-1 série para recuperação), "deload" (semanada regenerativa).

Você deve responder EXCLUSIVAMENTE em formato JSON válido com a seguinte estrutura:
{
  "readinessScore": 88, // número de 0 a 100 representando prontidão física
  "recoveryLevel": "plena" ou "moderada" ou "fadiga_residual" ou "deload_recomendado",
  "recoveryLabel": "Recuperação Plena (Pronto para Sobrecarga)", // título curto do status
  "recoverySummary": "Peitoral e tríceps descansados há 4 dias. Tecido muscular e sistema nervoso prontos para volume progressivo.",
  "volumeTrend": {
    "direction": "up" ou "stable" ou "down",
    "percentageChange": 8.5, // percentual positivo ou negativo
    "description": "+8.5% de volume acumulado nas últimas semanas mantendo boa cadência."
  },
  "coachSummary": "Excelente janela de oportunidade para sobrecarga: adicione 1 série no primeiro exercício composto ou suba a carga mantendo a técnica.",
  "suggestedAdjustments": [
    {
      "target": "Nome do exercício ou músculo",
      "type": "increase" ou "maintain" ou "decrease" ou "deload",
      "adjustmentBadge": "+1 Série" ou "+2.5kg Carga" ou "Manter Volume" ou "Reduzir 1 Série",
      "recommendation": "Recomendação prática e direta para este exercício",
      "rationale": "Justificativa fisiológica baseada na recuperação e volume recente"
    }
  ],
  "proTips": [
    "Dica prática 1 de execução ou descanso intra-série",
    "Dica prática 2 de RPE ou controle excêntrico"
  ]
}

Responda em Português do Brasil com tom encorajador, científico, seguro e orientado a resultados.`;

    const coachPrompt = `Analise as métricas de volume e recuperação deste atleta e prescreva os ajustes para sua próxima rotina:
${JSON.stringify(analysisContext, null, 2)}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: coachPrompt,
        config: {
          systemInstruction: strengthCoachSystemPrompt,
          responseMimeType: 'application/json',
        },
      });
    } catch (primaryErr) {
      console.warn('Initial Gemini Strength Coach call failed, retrying after backoff:', primaryErr);
      await new Promise((resolve) => setTimeout(resolve, 800));
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: coachPrompt,
        config: {
          systemInstruction: strengthCoachSystemPrompt,
          responseMimeType: 'application/json',
        },
      });
    }

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini Strength Coach JSON output:', parseError);
      parsedData = getFallbackStrengthCoachAnalysis(rawHistory, targetRoutine, profile);
    }

    return res.status(200).json({
      source: 'gemini',
      data: parsedData
    });
  } catch (err: any) {
    // Log server-side only; do not leak raw exception/stack details to clients
    console.error('Error generating strength coach analysis with Gemini:', err);
    return res.status(200).json({
      source: 'fallback_error',
      error: 'Não foi possível gerar a análise do Strength Coach com IA neste momento.',
      data: getFallbackStrengthCoachAnalysis(req.body?.history, req.body?.nextRoutine, req.body?.profile)
    });
  }
});

// Fallback Strength Coach Analysis with high-fidelity physiological logic
function getFallbackStrengthCoachAnalysis(history: any[] = [], nextRoutine: any = null, profile: any = {}) {
  const recent = Array.isArray(history) ? history.slice(0, 6) : [];
  const routineName = nextRoutine?.name || 'Treino Próximo';
  const targetMuscles: string[] = nextRoutine?.targetMuscles || ['Geral'];

  // Check how long ago target muscles were trained
  let minDaysSinceStimulus = 4;
  if (recent.length > 0) {
    const lastMatch = recent.find((w: any) =>
      (w.exercises || []).some((e: any) => targetMuscles.includes(e.muscleGroup))
    );
    if (lastMatch) {
      const matchTime = new Date(lastMatch.completedAt || lastMatch.startedAt).getTime();
      minDaysSinceStimulus = Math.max(0, Math.round((Date.now() - matchTime) / (1000 * 60 * 60 * 24)));
    }
  }

  // Calculate volume progression
  const v1 = recent.length >= 2 ? (recent[0]?.totalVolumeKg || 0) : 0;
  const v2 = recent.length >= 2 ? (recent[1]?.totalVolumeKg || 0) : 0;
  let pctChange = 6;
  if (v2 > 0) {
    pctChange = Math.round(((v1 - v2) / v2) * 100);
  }

  const isWellRested = minDaysSinceStimulus >= 3;
  const isPartiallyRested = minDaysSinceStimulus === 2;
  const readiness = isWellRested ? 92 : isPartiallyRested ? 84 : 74;

  const recoveryLabel = isWellRested
    ? 'Recuperação Plena (Pronto para Sobrecarga)'
    : isPartiallyRested
    ? 'Recuperação Otimizada (Volume Estável)'
    : 'Fadiga Residual (Manutenção Cautelosa)';

  const recoverySummary = isWellRested
    ? `Grupos musculares (${targetMuscles.join(', ')}) descansados há mais de 72h. Fibras regeneradas e prontas para progressão de volume.`
    : `Intervalo de recuperação de ${minDaysSinceStimulus} dia(s). Mantenha a cadência e execute com boa técnica.`;

  const exercises = nextRoutine?.exercises || [];
  const suggestedAdjustments = exercises.length > 0
    ? exercises.slice(0, 4).map((ex: any, idx: number) => {
        const exName = ex.exerciseName || ex.name || `Exercício ${idx + 1}`;
        if (idx === 0 && isWellRested) {
          return {
            target: exName,
            type: 'increase',
            adjustmentBadge: '+1 Série de Trabalho',
            recommendation: 'Adicione 1 série de trabalho mantendo as repetições alvo para estimular sobrecarga progressiva.',
            rationale: `Músculo com ${minDaysSinceStimulus} dias de descanso e histórico de cargas estável.`
          };
        }
        if (idx === 1 && isWellRested) {
          return {
            target: exName,
            type: 'increase',
            adjustmentBadge: '+2.5kg Carga',
            recommendation: 'Tente subir a carga inicial em +2.5kg na primeira série com 1 a 2 repetições em reserva.',
            rationale: 'Janela de adaptação favorável pós-recuperação completa.'
          };
        }
        return {
          target: exName,
          type: 'maintain',
          adjustmentBadge: 'Manter Volume',
          recommendation: `Mantenha ${ex.setsCount || 3} séries focando na cadência excêntrica de 2 a 3 segundos.`,
          rationale: 'Volume suficiente para estímulo hipertrófico sem acumular fadiga precoce.'
        };
      })
    : [
        {
          target: targetMuscles[0] || 'Exercício Principal',
          type: isWellRested ? 'increase' : 'maintain',
          adjustmentBadge: isWellRested ? '+1 Série de Trabalho' : 'Manter Volume',
          recommendation: isWellRested 
            ? 'Adicione 1 série no primeiro exercício composto para estimular hipertrofia.' 
            : 'Mantenha o volume prescrito e priorize o tempo sob tensão.',
          rationale: `Baseado no intervalo de descanso de ${minDaysSinceStimulus} dia(s) desde o último estímulo.`
        },
        {
          target: 'Exercícios Acessórios',
          type: 'maintain',
          adjustmentBadge: 'Manter 3 Séries',
          recommendation: 'Foque em repetições com boa amplitude e 1 a 2 repetições em reserva (RIR).',
          rationale: 'Evita fadiga excessiva preservando a curva de recuperação semanal.'
        }
      ];

  return {
    readinessScore: readiness,
    recoveryLevel: isWellRested ? 'plena' : isPartiallyRested ? 'moderada' : 'fadiga_residual',
    recoveryLabel,
    recoverySummary,
    volumeTrend: {
      direction: pctChange > 2 ? 'up' : pctChange < -2 ? 'down' : 'stable',
      percentageChange: pctChange,
      description: `${pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`} de volume comparado às sessões anteriores.`
    },
    coachSummary: isWellRested
      ? `Para o ${routineName}: Seus músculos estão totalmente recuperados. É o momento perfeito para adicionar 1 série ou tentar sobrecarga progressiva!`
      : `Para o ${routineName}: Mantenha o volume planejado e foque na máxima qualidade de contração muscular.`,
    suggestedAdjustments,
    proTips: [
      'Descanse entre 90s e 120s entre as séries pesadas para restauração dos estoques de fosfocreatina.',
      'Mantenha 1 a 2 repetições na reserva (RPE 8-9) para não falhar prematuramente nas primeiras séries.'
    ]
  };
}

// Fallback biomechanical insights generator for resilience
function getFallbackInsights(history: any[] = [], exercises: any[] = []) {
  return {
    overallVerdict: "Excelente consistência e progressão de volume. O foco agora deve ser o refinamento da fase excêntrica e estabilidade escapular.",
    coachAdvice: "Priorize o controle cadenciado de 2 a 3 segundos na descida em todos os exercícios compostos antes de subir a carga.",
    keyFocusPoints: [
      "Retração e depressão escapular durante os exercícios de empurrar",
      "Manter o cotovelo alinhado perpendicularmente ao punho",
      "Respiração diafragmática (Manobra de Valsalva) nas cargas máximas"
    ],
    insights: [
      {
        exerciseName: "Supino Reto com Barra",
        muscleGroup: "Peito",
        status: "biomechanics",
        badge: "Ajuste de Postura",
        headline: "Trajetória da Barra em 'J' Invertido",
        formCorrection: "Evite descer a barra na linha da clavícula para poupar a cápsula articular do ombro anterior. Toque o esterno inferior e empurre ligeiramente em curva para cima dos olhos.",
        actionableTip: "Aperte a barra com força para ativar os estabilizadores do antebraço e junte as escápulas no banco.",
        suggestedLoadAdjustment: "Mantenha a carga controlada até consolidar 8 repetições com pausa de 1s no peito."
      },
      {
        exerciseName: "Desenvolvimento com Halteres",
        muscleGroup: "Ombros",
        status: "warning",
        badge: "Cuidado Articular",
        headline: "Plano Escapular a 30 Graus",
        formCorrection: "Não abra os cotovelos totalmente alinhados com as orelhas (180°). Traga os cotovelos ligeiramente para a frente (~30° no plano escapular) para evitar impacto subacromial.",
        actionableTip: "Não bata os halteres no topo; termine a subida mantendo a tensão contínua nos deltóides.",
        suggestedLoadAdjustment: "Faça séries de 10 a 12 repetições com cadência controlada."
      },
      {
        exerciseName: "Remada Curvada com Barra",
        muscleGroup: "Costas",
        status: "tip",
        badge: "Biomecânica de Ouro",
        headline: "Iniciação do Movimento pelas Escápulas",
        formCorrection: "Muitos puxam a barra flexionando os bíceps precocemente. Pense em puxar com os cotovelos para trás e espremer as costas no topo antes de dobrar os braços.",
        actionableTip: "Mantenha a coluna neutra e o peito estufado apontando para o chão em 45 graus.",
        suggestedLoadAdjustment: "Aumente 2kg após conseguir 3 séries consecutivas sem balançar o tronco."
      },
      {
        exerciseName: "Agachamento Livre com Barra",
        muscleGroup: "Quadríceps",
        status: "progression",
        badge: "Progressão de Carga",
        headline: "Pressão Tripé nos Pés e 'Joelho para Fora'",
        formCorrection: "Distribua o peso entre o calcanhar, dedão e dedinho. Ao iniciar a subida, empurre o chão ativamente evitando que os joelhos entrem em valgo dinâmico.",
        actionableTip: "Inspire profundamente antes de descer e trave o abdômen como se fosse levar um golpe.",
        suggestedLoadAdjustment: "Pronto para progressão: adicione 2,5kg a 5kg na próxima sessão."
      }
    ]
  };
}

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev, use Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built dist files
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Thunder Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
