import { CompletedWorkout, Exercise, MuscleGroup, Routine, RoutineExerciseTemplate, CardioSession } from '../types';
import { INITIAL_EXERCISES } from '../data/exercisesData';
import { calculateEstimatedCalories, isIsometricExercise } from './calc';

/**
 * Normalizes text for robust comparisons: removes accents, lowercase, trims spaces
 */
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/g, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ') // collapse spaces
    .trim();
}

/**
 * Stopwords to ignore during token-based matching
 */
const STOPWORDS = new Set([
  'de', 'com', 'no', 'na', 'nos', 'nas', 'em', 'para', 'do', 'da', 'dos', 'das',
  'e', 'ou', 'ao', 'aos', 'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'pela', 'pelo', 'pelos', 'pelas', 'por', 'sobre'
]);

/**
 * Tokenize and remove stopwords
 */
function getMeaningfulTokens(str: string): string[] {
  const norm = normalizeText(str);
  return norm
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Curated technical biomechanical notes/cues standard in the app
 */
export const CURATED_EXERCISE_NOTES: Record<string, string> = {
  // Peito
  'supino-reto-barra': 'Aquecer bem manguito. Controlar a descida em 2s com escápulas aduzidas.',
  'supino-halteres-reto': 'Manter trajetória estável, descida profunda sem bater os halteres no topo.',
  'supino-inclinado-halteres': 'Inclinação de 30º-45º com foco no peitoral superior (clavicular).',
  'supino-inclinado-barra': 'Descer a barra na linha da clavícula, cotovelos a ~60° do tronco.',
  'supino-declinado-barra': 'Foco na porção inferior do peitoral, amplitude controlada.',
  'supino-articulado-maquina': 'Manter o peito aberto e empurrar até quase a extensão total dos braços.',
  'peck-deck-voador': 'Pico de contração de 1-2s no meio com cotovelos levemente flexionados.',
  'crucifixo-reto-halteres': 'Alongamento máximo na descida sem hiperestender os ombros.',
  'crucifixo-inclinado-halteres': 'Banco a 30°, movimento em arco focando no peitoral superior.',
  'crossover-polia': 'Pico de contração de 1s no meio com tronco estável.',
  'crossover-polia-alta': 'Trajetória diagonal para baixo, focando no peitoral inferior e médio.',
  'crossover-polia-baixa': 'Trajetória ascendente para focar na porção clavicular do peitoral.',
  'flexao-solo': 'Corpo em linha reta, abdômen contraído e peito próximo ao solo.',
  'pullover-halteres': 'Alongamento profundo da caixa torácica e serrátil anterior.',

  // Costas
  'puxada-alta-aberta': 'Puxar direcionando os cotovelos para baixo e para o chão.',
  'puxada-alta-triangulo': 'Puxada fechada até o peito alto, alongando dorsais na subida.',
  'puxada-alta-supinada': 'Pegada supinada na largura dos ombros, foco na dorsal inferior e bíceps.',
  'barra-fixa-pronada': 'Subir até o queixo passar da barra sem balançar as pernas.',
  'remada-curvada-barra': 'Tronco a 45º, coluna neutra e retração escapular no topo.',
  'remada-baixa-triangulo': 'Tronco ereto, puxar o triângulo na linha do umbigo.',
  'remada-serrote-halteres': 'Alongar bem a dorsal na descida e puxar com o cotovelo colado ao corpo.',
  'remada-cavalinho': 'Peito aberto e lombar estabilizada, puxada concentrada.',
  'face-pull-polia': 'Rotação externa dos ombros no topo, corda na altura dos olhos.',
  'pullover-polia': 'Braços semiestendidos, puxar com a força das dorsais até a coxa.',
  'encolhimento-trapezio-halteres': 'Elevação vertical dos ombros com 1s de isometria no topo, sem girar.',

  // Ombros
  'desenvolvimento-halteres': 'Travar o core e não arquear excessivamente a lombar.',
  'desenvolvimento-militar-barra': 'Corpo firme em pé, barra subindo rente ao rosto com glúteos travados.',
  'desenvolvimento-maquina': 'Escápulas apoiadas no encosto e empurrar até extensão controlada.',
  'desenvolvimento-arnold': 'Giro fluído de pegada supinada para pronada durante a subida.',
  'elevacao-lateral-halteres': 'Movimento estrito até a linha dos ombros, sem impulso corporal.',
  'elevacao-lateral-polia': 'Tensão contínua, puxar na diagonal sem elevar os trapézios.',
  'elevacao-frontal-halteres': 'Elevar até a linha dos olhos com controle na fase excêntrica.',
  'crucifixo-invertido-halteres': 'Tronco inclinado, foco no deltóide posterior e rombóides.',
  'remada-alta-barra': 'Puxar até o peito médio, cotovelos sempre acima da linha dos punhos.',

  // Bíceps
  'rosca-direta-barra-w': 'Cotovelos alinhados ao tronco, sem balançar a coluna.',
  'rosca-direta-barra-reta': 'Pegada firme, controlar a descida em 2s.',
  'rosca-direta-halteres': 'Giro de punho (supinação) no topo para pico de contração.',
  'rosca-martelo-halteres': 'Pegada neutra contínua, foco no braquial e braquiorradial.',
  'rosca-martelo-corda-polia': 'Tensão constante na polia com abertura sutil no topo.',
  'rosca-banco-inclinado-45': 'Alongamento máximo da cabeça longa do bíceps no banco inclinado.',
  'rosca-scott-maquina': 'Braços bem apoiados, evitar hiperestensão do cotovelo na descida.',
  'rosca-concentrada-halteres': 'Cotovelo apoiado na coxa interna, contração isolada no topo.',

  // Tríceps
  'triceps-pulley-corda': 'Abrir a corda no final para pico lateral de contração.',
  'triceps-pulley-barra-reta': 'Cotovelos colados ao corpo, extensão total para baixo.',
  'triceps-testa-barra-w': 'Cotovelos firmes e apontando para trás, descida até a testa.',
  'triceps-testa-halteres': 'Pegada neutra, controle na descida bilateral.',
  'triceps-frances-halteres': 'Cotovelos apontados para o teto, alongamento completo.',
  'triceps-frances-polia': 'Tensão contínua em toda a amplitude acima da cabeça.',
  'triceps-coice-halteres': 'Braço paralelo ao solo, estender completamente o cotovelo.',
  'triceps-paralelas': 'Corpo reto para focar em tríceps (mergulho profundo controlado).',
  'triceps-supinado-fechado': 'Pegada na largura dos ombros, cotovelos rentes ao tronco.',

  // Quadríceps
  'agachamento-livre-barra': 'Profundidade paralela ou além. Travar abdômen e manter pés firmes.',
  'agachamento-smith': 'Pés ligeiramente à frente da linha da barra, coluna estabilizada.',
  'agachamento-bulgaro-halteres': 'Tronco levemente inclinado à frente para conforto e ativação pura.',
  'leg-press-45': 'Pés na largura dos ombros, não descolar a lombar do encosto.',
  'cadeira-extensora': '1s de isometria no topo e descida em 2-3s controlados.',
  'hack-squat-maquina': 'Costas totalmente apoiadas no encosto, descida até 90º.',
  'passada-afundo-halteres': 'Passos firmes com joelho de trás descendo quase ao chão.',

  // Posteriores & Glúteos
  'mesa-flexora': 'Manter o quadril colado no banco, puxando o calcanhar até o glúteo.',
  'cadeira-flexora': 'Ajuste do apoio na canela e tronco ereto durante a flexão.',
  'stiff-barra': 'Empurrar o quadril para trás sentindo os posteriores, coluna neutra.',
  'stiff-halteres': 'Halteres deslizando rente às pernas com quadril alto.',
  'elevacao-pelvica-barra': 'Pausa de 2s no topo com contração máxima nos glúteos.',
  'cadeira-abdutora': 'Tronco firme no encosto, abertura máxima com controle na volta.',
  'gluteo-cabo-polia': 'Perna estendida chutando para trás com o calcanhar.',

  // Panturrilhas
  'gemeos-em-pe-smith': 'Máxima amplitude de tornozelo, alongar embaixo e subir na ponta dos pés.',
  'gemeos-sentado-maquina': 'Foco no músculo sóleo, descida lenta e subida explosiva.',
  'panturrilha-leg-press': 'Movimento exclusivo dos tornozelos sem dobrar os joelhos.',

  // Abdômen
  'abdominal-supra-solo': 'Expirar todo o ar no topo da flexão sem puxar o pescoço.',
  'abdominal-corda-polia': 'Enrolar o tronco para baixo aproximando as costelas do quadril.',
  'elevacao-pernas-barra': 'Elevar as pernas ou joelhos usando o abdômen sem impulso.',
  'prancha-isometrica': 'Corpo alinhado em prancha, glúteos e abdômen 100% ativados.'
};

/**
 * Standard fallback cues based on muscle group
 */
const MUSCLE_GROUP_DEFAULT_NOTES: Record<MuscleGroup, string> = {
  'Peito': 'Manter escápulas aduzidas e fase excêntrica controlada em 2s.',
  'Costas': 'Puxar direcionando os cotovelos e contrair as dorsais no pico.',
  'Ombros': 'Execução estrita sem impulso, mantendo ombros encaixados.',
  'Bíceps': 'Cotovelos fixos ao lado do corpo com pico de contração.',
  'Tríceps': 'Extensão completa do cotovelo com controle na volta.',
  'Quadríceps': 'Joelhos alinhados com a ponta dos pés e core travado.',
  'Posteriores': 'Empurrar o quadril e focar no alongamento sob carga.',
  'Glúteos': 'Pico de contração de 1-2s no topo do movimento.',
  'Panturrilhas': 'Máxima amplitude de tornozelo com pausa de 1s no pico.',
  'Abdômen': 'Expirar todo o ar na contração sem tensionar a cervical.'
};

/**
 * Generates or retrieves the standard app technical note for an exercise
 */
export function getStandardExerciseNote(
  matchedEx: Exercise,
  userProvidedNote?: string
): string {
  // 1. If explicit user note was provided, keep it
  if (userProvidedNote && userProvidedNote.trim().length > 0) {
    return userProvidedNote.trim();
  }

  // 2. Check curated standard dictionary by ID
  if (CURATED_EXERCISE_NOTES[matchedEx.id]) {
    return CURATED_EXERCISE_NOTES[matchedEx.id];
  }

  // 3. Check exercise tips field
  if (matchedEx.tips && matchedEx.tips.trim().length > 0) {
    return matchedEx.tips.trim();
  }

  // 4. Check exercise instructions (first concise step)
  if (matchedEx.instructions && matchedEx.instructions.length > 0) {
    const firstInst = matchedEx.instructions[0];
    if (firstInst && firstInst.length <= 100) {
      return firstInst;
    }
  }

  // 5. Fallback to muscle group standard biomechanical cue
  return MUSCLE_GROUP_DEFAULT_NOTES[matchedEx.muscleGroup] || 'Execução técnica controlada com cadência constante.';
}

/**
 * Comprehensive Brazilian Portuguese and English gym exercise synonyms dictionary
 */
const EXERCISE_SYNONYMS: Record<string, string[]> = {
  // Peito
  'supino-reto-barra': [
    'supino reto', 'supino reto barra', 'supino com barra', 'bench press', 'flat bench press', 'supino plano', 'supino reto na barra'
  ],
  'supino-halteres-reto': [
    'supino reto halteres', 'supino halteres', 'supino reto halter', 'dumbbell bench press', 'supino com halteres', 'supino halter reto'
  ],
  'supino-inclinado-halteres': [
    'supino inclinado halteres', 'supino inclinado halter', 'incline dumbbell press', 'supino 30', 'supino 45', 'supino inclinado com halteres', 'incline db press'
  ],
  'supino-inclinado-barra': [
    'supino inclinado barra', 'incline bench press', 'supino inclinado', 'supino inclinado com barra', 'incline barbell press'
  ],
  'supino-declinado-barra': [
    'supino declinado', 'decline bench press', 'supino declinado barra', 'supino declinado com barra'
  ],
  'supino-articulado-maquina': [
    'supino maquina', 'supino articulado', 'chest press machine', 'supino vertical', 'supino sentado maquina', 'chest press'
  ],
  'peck-deck-voador': [
    'peck deck', 'voador', 'peckdeck', 'voador peitoral', 'butterfly', 'voador maquina', 'fly maquina', 'pec deck'
  ],
  'crucifixo-reto-halteres': [
    'crucifixo reto', 'crucifixo halteres', 'crucifixo reto halter', 'dumbbell fly', 'fly reto', 'crucifixo com halteres'
  ],
  'crucifixo-inclinado-halteres': [
    'crucifixo inclinado', 'crucifixo inclinado halter', 'incline fly', 'crucifixo 30', 'crucifixo 45', 'incline dumbbell fly'
  ],
  'crossover-polia': [
    'crossover', 'cross over', 'crossover polia media', 'cabo peitoral', 'cross polia media', 'crossover meio'
  ],
  'crossover-polia-alta': [
    'crossover polia alta', 'crossover alto', 'cross over alto', 'high cable crossover', 'cross alto', 'cabo alto peitoral'
  ],
  'crossover-polia-baixa': [
    'crossover polia baixa', 'crossover baixo', 'cross over baixo', 'low cable crossover', 'cross baixo', 'cabo baixo peitoral'
  ],
  'flexao-solo': [
    'flexao', 'flexao de braco', 'push up', 'flexao no solo', 'pushups', 'marinheiro'
  ],
  'pullover-halteres': [
    'pullover', 'pullover halteres', 'pullover halter', 'dumbbell pullover'
  ],

  // Costas
  'puxada-alta-aberta': [
    'puxada alta', 'puxada aberta', 'lat pulldown', 'puxador frente', 'puxada frontal', 'puxador aberto', 'puxada alta frontal', 'puxador costas'
  ],
  'puxada-alta-triangulo': [
    'puxada triangulo', 'puxada fechada', 'puxador triangulo', 'close grip lat pulldown', 'puxada neutra'
  ],
  'puxada-alta-supinada': [
    'puxada supinada', 'puxador supinado', 'underhand pulldown', 'puxada pegada inversa'
  ],
  'barra-fixa-pronada': [
    'barra fixa', 'pull up', 'pullup', 'chin up', 'barra fixa pronada', 'barra fixa aberta', 'pullups'
  ],
  'remada-curvada-barra': [
    'remada curvada', 'remada barra', 'barbell row', 'bent over row', 'remada curvada barra pronada', 'remada pronada'
  ],
  'remada-baixa-triangulo': [
    'remada baixa', 'remada triangulo', 'seated cable row', 'remada polia', 'remada baixa cabo', 'remada sentado'
  ],
  'remada-serrote-halteres': [
    'remada serrote', 'serrote', 'remada unilateral', 'one arm row', 'remada com halter', 'remada unilateral halter'
  ],
  'remada-cavalinho': [
    'remada cavalinho', 'cavalinho', 't bar row', 'remada barra t', 'cavalinho com anilhas'
  ],
  'remada-articulada-maquina': [
    'remada articulada', 'remada maquina', 'machine row', 'remada sentado maquina'
  ],
  'face-pull-polia': [
    'face pull', 'facepull', 'face pull corda', 'face pull polia', 'facepulls'
  ],
  'pullover-polia': [
    'pullover polia', 'pullover corda', 'straight arm pulldown', 'pulldown bracos estendidos', 'pulldown cabo'
  ],
  'encolhimento-trapezio-halteres': [
    'encolhimento', 'encolhimento trapezio', 'shrug', 'trapezio halteres', 'shrugs', 'encolhimento com halteres'
  ],

  // Ombros
  'desenvolvimento-halteres': [
    'desenvolvimento halteres', 'desenvolvimento halter', 'shoulder press', 'desenvolvimento ombros', 'db shoulder press', 'desenvolvimento sentado'
  ],
  'desenvolvimento-militar-barra': [
    'desenvolvimento militar', 'desenvolvimento barra', 'ohp', 'overhead press', 'militar', 'military press', 'desenvolvimento em pe'
  ],
  'desenvolvimento-maquina': [
    'desenvolvimento maquina', 'desenvolvimento smith', 'shoulder press machine', 'desenvolvimento articulado'
  ],
  'desenvolvimento-arnold': [
    'desenvolvimento arnold', 'arnold press', 'desenvolvimento arnold halteres'
  ],
  'elevacao-lateral-halteres': [
    'elevacao lateral', 'elevacao lateral halteres', 'elevacao lateral halter', 'lateral raise', 'side lateral raise', 'elevacao lateral em pe'
  ],
  'elevacao-lateral-polia': [
    'elevacao lateral polia', 'elevacao lateral cabo', 'cable lateral raise', 'elevacao lateral cross', 'elevacao lateral unilateral'
  ],
  'elevacao-frontal-halteres': [
    'elevacao frontal', 'elevacao frontal halteres', 'front raise', 'elevacao frontal halter', 'elevacao frontal barra'
  ],
  'crucifixo-invertido-halteres': [
    'crucifixo invertido', 'voador invertido', 'rear delt fly', 'deltoide posterior', 'crucifixo invertido halter', 'rear delt raise'
  ],
  'remada-alta-barra': [
    'remada alta', 'remada alta barra', 'upright row', 'remada alta polia', 'remada alta w'
  ],

  // Bíceps
  'rosca-direta-barra-w': [
    'rosca direta', 'rosca direta barra w', 'rosca barra w', 'biceps curl', 'rosca w', 'rosca direta w'
  ],
  'rosca-direta-barra-reta': [
    'rosca barra reta', 'rosca direta barra', 'barbell curl', 'rosca direta na barra reta'
  ],
  'rosca-direta-halteres': [
    'rosca direta halteres', 'rosca alternada', 'rosca halteres', 'dumbbell curl', 'rosca alternada halteres'
  ],
  'rosca-martelo-halteres': [
    'rosca martelo', 'rosca martelo halteres', 'hammer curl', 'martelo', 'rosca martelo halter'
  ],
  'rosca-martelo-corda-polia': [
    'rosca martelo corda', 'rosca martelo polia', 'cable hammer curl', 'martelo corda'
  ],
  'rosca-banco-inclinado-45': [
    'rosca 45', 'rosca banco inclinado', 'incline curl', 'rosca inclinada', 'incline dumbbell curl'
  ],
  'rosca-scott-maquina': [
    'rosca scott', 'banco scott', 'preacher curl', 'scott maquina', 'rosca scott barra w', 'rosca scott halteres'
  ],
  'rosca-concentrada-halteres': [
    'rosca concentrada', 'concentration curl', 'concentrada halter', 'rosca concentrada halteres'
  ],
  'rosca-21': [
    'rosca 21', '21 barra', 'biceps 21', 'rosca 21 barra w'
  ],

  // Tríceps
  'triceps-pulley-corda': [
    'triceps corda', 'triceps corda pulley', 'triceps corda cross', 'triceps corda polia', 'rope pushdown', 'triceps corda cabo'
  ],
  'triceps-pulley-barra-reta': [
    'triceps pulley', 'triceps barra reta', 'triceps barra v', 'triceps polia', 'pushdown', 'triceps barra'
  ],
  'triceps-testa-barra-w': [
    'triceps testa', 'triceps testa barra', 'skull crusher', 'testa barra w', 'triceps testa com barra w', 'skullcrushers'
  ],
  'triceps-testa-halteres': [
    'triceps testa halteres', 'triceps testa halter', 'dumbbell skull crusher'
  ],
  'triceps-frances-halteres': [
    'triceps frances', 'triceps frances halter', 'french press', 'triceps sobre a cabeca', 'frances halteres'
  ],
  'triceps-frances-polia': [
    'triceps frances polia', 'triceps frances cabo', 'overhead cable tricep extension'
  ],
  'triceps-coice-halteres': [
    'triceps coice', 'kickback', 'triceps coice halter', 'triceps kickback'
  ],
  'triceps-paralelas': [
    'mergulho paralelas', 'triceps paralelas', 'dips', 'mergulho banco', 'paralelas triceps', 'dips triceps'
  ],
  'triceps-supinado-fechado': [
    'supino fechado', 'close grip bench press', 'supino pegada fechada'
  ],

  // Quadríceps
  'agachamento-livre-barra': [
    'agachamento livre', 'agachamento barra', 'squat', 'agachamento', 'back squat', 'barbell squat', 'agachamento livre com barra'
  ],
  'agachamento-smith': [
    'agachamento smith', 'smith squat', 'agachamento no smith', 'agachamento guiado'
  ],
  'agachamento-frontal-barra': [
    'agachamento frontal', 'front squat', 'agachamento frente'
  ],
  'leg-press-45': [
    'leg press', 'leg press 45', 'leg 45', 'leg horizontal', 'leg press 45 graus', 'leg press inclinado'
  ],
  'cadeira-extensora': [
    'cadeira extensora', 'extensora', 'leg extension', 'extensora maquina'
  ],
  'agachamento-bulgaro-halteres': [
    'agachamento bulgaro', 'bulgarian split squat', 'bulgaro', 'bulgaro com halteres', 'split squat'
  ],
  'hack-squat-maquina': [
    'hack squat', 'hack', 'agachamento hack', 'hack machine'
  ],
  'passada-afundo-halteres': [
    'passada', 'afundo', 'lunges', 'walking lunge', 'passada com halteres', 'afundo halteres'
  ],

  // Posteriores & Glúteos
  'mesa-flexora': [
    'mesa flexora', 'flexora', 'lying leg curl', 'flexora deitada', 'mesa flexora maquina'
  ],
  'cadeira-flexora': [
    'cadeira flexora', 'seated leg curl', 'flexora sentada', 'cadeira flexora maquina'
  ],
  'stiff-barra': [
    'stiff', 'stiff barra', 'stiff halteres', 'romanian deadlift', 'rdl', 'stiff com barra', 'levantamento terra romeno'
  ],
  'stiff-halteres': [
    'stiff halteres', 'stiff halter', 'dumbbell rdl', 'stiff com halteres'
  ],
  'elevacao-pelvica-barra': [
    'elevacao pelvica', 'hip thrust', 'elevacao pelvica barra', 'elevacao de quadril', 'hip thrust barra'
  ],
  'cadeira-abdutora': [
    'cadeira abdutora', 'abdutora', 'abductor machine', 'abdutora maquina'
  ],
  'gluteo-cabo-polia': [
    'gluteo cabo', 'gluteo polia', 'gluteo coice polia', 'cable kickback', 'gluteo na polia'
  ],
  'agachamento-sumo-halteres': [
    'agachamento sumo', 'sumo squat', 'sumo halteres', 'agachamento sumo com halter'
  ],

  // Panturrilhas
  'gemeos-em-pe-smith': [
    'gemeos em pe', 'panturrilha em pe', 'panturrilha smith', 'panturrilha degrau', 'standing calf raise', 'panturrilha em pe no smith'
  ],
  'gemeos-sentado-maquina': [
    'gemeos sentado', 'panturrilha sentado', 'solear', 'seated calf raise', 'panturrilha sentada'
  ],
  'panturrilha-leg-press': [
    'panturrilha leg press', 'gemeos leg 45', 'calf raise on leg press'
  ],

  // Abdômen
  'abdominal-supra-solo': [
    'abdominal supra', 'abdominal solo', 'crunch', 'abdominal', 'crunches', 'abdominal tradicional'
  ],
  'abdominal-corda-polia': [
    'abdominal corda', 'cable crunch', 'abdominal polia', 'abdominal no cross'
  ],
  'elevacao-pernas-barra': [
    'elevacao de pernas', 'hanging leg raise', 'infra barra', 'abdominal infra', 'elevacao pernas'
  ],
  'prancha-isometrica': [
    'prancha', 'prancha isometrica', 'plank', 'prancha abdominal'
  ],
  'abdominal-obliquo-solo': [
    'abdominal obliquo', 'bicicleta abdominal', 'russian twist', 'obliquos'
  ],

  // Funcional & Peso Livre
  'levantamento-terra-convencional': [
    'levantamento terra', 'deadlift', 'terra', 'deadlifts', 'terra convencional'
  ],
  'kettlebell-swing': [
    'kettlebell swing', 'swing kettlebell', 'kb swing'
  ]
};

/**
 * Escapes a cell for standard CSV output
 */
function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  if (str.includes(';') || str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Gets a clean display name for an exercise from a template
 */
export function getExerciseDisplayName(
  item: { exerciseId: string; exerciseName?: string },
  exercises: Exercise[]
): string {
  // 1. If explicit exerciseName is provided and is not a placeholder/raw ID
  if (
    item.exerciseName &&
    item.exerciseName.trim().length > 0 &&
    !item.exerciseName.startsWith('custom-ex-') &&
    item.exerciseName !== 'Exercício Personalizado'
  ) {
    return item.exerciseName;
  }

  // 2. Look up in exercises catalog
  const matched = exercises.find((e) => e.id === item.exerciseId);
  if (matched?.name) return matched.name;

  // 3. Check initial catalog fallback
  const inInitial = INITIAL_EXERCISES.find((e) => e.id === item.exerciseId);
  if (inInitial?.name) return inInitial.name;

  // 4. Check synonym mapping if exerciseId matches a known slug
  const matchedBySlug = exercises.find((e) => normalizeText(e.id) === normalizeText(item.exerciseId));
  if (matchedBySlug?.name) return matchedBySlug.name;

  // 5. If exerciseId is an orphan custom ID with no name, provide a clean label
  if (item.exerciseId.startsWith('custom-ex-')) {
    return 'Exercício Personalizado';
  }

  return item.exerciseId;
}

/**
 * Auto-heals routines that contain orphan custom-ex IDs, missing exercise names or empty notes
 */
export function autoHealRoutines(
  routines: Routine[],
  exercises: Exercise[],
  workoutsHistory?: any[]
): Routine[] {
  const masterCatalog = combineMasterCatalog(INITIAL_EXERCISES, exercises);

  return routines.map((routine) => {
    let hasChanges = false;
    const healedExercises = routine.exercises.map((template, idx) => {
      // 1. If exerciseId matches a known exercise, ensure proper name & standard note if empty
      const matched = masterCatalog.find((e) => e.id === template.exerciseId);
      if (matched) {
        let updatedTemplate = { ...template };
        if (template.exerciseName !== matched.name) {
          hasChanges = true;
          updatedTemplate.exerciseName = matched.name;
        }
        if (!template.notes || template.notes.trim() === '') {
          hasChanges = true;
          updatedTemplate.notes = getStandardExerciseNote(matched);
        }
        return updatedTemplate;
      }

      // 2. If it's a custom-ex ID without a clean name, try to match by name or context
      if (
        template.exerciseId.startsWith('custom-ex-') &&
        (!template.exerciseName ||
          template.exerciseName.startsWith('custom-ex-') ||
          template.exerciseName === 'Exercício Personalizado')
      ) {
        hasChanges = true;
        const matchedByName = findBestExerciseMatch(template.exerciseName || '', masterCatalog);
        if (matchedByName) {
          return {
            ...template,
            exerciseId: matchedByName.id,
            exerciseName: matchedByName.name,
            notes: template.notes || getStandardExerciseNote(matchedByName)
          };
        }

        // Try to deduce based on routine name / target muscles & index
        const rName = routine.name.toLowerCase();
        let healedName = 'Exercício Personalizado';

        if (rName.includes('push') || routine.targetMuscles.includes('Peito')) {
          const pushNames = [
            'Supino Reto com Barra',
            'Supino Inclinado com Halteres',
            'Crossover na Polia',
            'Desenvolvimento com Halteres',
            'Elevação Lateral com Halteres',
            'Tríceps Corda no Pulley',
            'Tríceps Testa com Barra W'
          ];
          healedName = pushNames[idx] || `Exercício de Peito/Ombros #${idx + 1}`;
        } else if (rName.includes('pull') || routine.targetMuscles.includes('Costas')) {
          const pullNames = [
            'Puxada Alta Aberta (Lat Pulldown)',
            'Remada Curvada com Barra',
            'Remada Baixa no Triângulo',
            'Remada Unilateral (Serrote)',
            'Face Pull na Polia',
            'Rosca Direta com Barra W',
            'Rosca Martelo com Halteres'
          ];
          healedName = pullNames[idx] || `Exercício de Costas/Bíceps #${idx + 1}`;
        } else if (rName.includes('leg') || routine.targetMuscles.includes('Quadríceps')) {
          const legNames = [
            'Agachamento Livre com Barra',
            'Leg Press 45º',
            'Cadeira Extensora',
            'Mesa Flexora',
            'Stiff com Barra',
            'Elevação Pélvica com Barra',
            'Gêmeos em Pé no Smith'
          ];
          healedName = legNames[idx] || `Exercício de Pernas #${idx + 1}`;
        }

        const fallbackMatch = findBestExerciseMatch(healedName, masterCatalog);

        return {
          ...template,
          exerciseId: fallbackMatch ? fallbackMatch.id : template.exerciseId,
          exerciseName: fallbackMatch ? fallbackMatch.name : healedName,
          notes: template.notes || (fallbackMatch ? getStandardExerciseNote(fallbackMatch) : '')
        };
      }

      return template;
    });

    if (hasChanges) {
      return { ...routine, exercises: healedExercises };
    }
    return routine;
  });
}

/**
 * Combines INITIAL_EXERCISES and custom/local exercises into a single deduplicated array
 */
function combineMasterCatalog(baseList: Exercise[], customList: Exercise[]): Exercise[] {
  const map = new Map<string, Exercise>();
  baseList.forEach((e) => map.set(e.id, e));
  customList.forEach((e) => map.set(e.id, e));
  return Array.from(map.values());
}

/**
 * Finds the best matching exercise from the available list using advanced fuzzy logic and synonym dictionary
 */
export function findBestExerciseMatch(
  targetName: string,
  exercises: Exercise[]
): Exercise | undefined {
  if (!targetName || !targetName.trim()) return undefined;

  // Master catalog includes all 340+ default exercises + provided list
  const catalog = combineMasterCatalog(INITIAL_EXERCISES, exercises);

  const rawTarget = targetName.trim();
  const normTarget = normalizeText(rawTarget);
  const targetTokens = getMeaningfulTokens(rawTarget);

  // 1. Direct ID match
  const byId = catalog.find((e) => e.id === rawTarget || normalizeText(e.id) === normTarget);
  if (byId) return byId;

  // 2. Exact name match (case-insensitive)
  const byExactName = catalog.find((e) => e.name.trim().toLowerCase() === rawTarget.toLowerCase());
  if (byExactName) return byExactName;

  // 3. Exact normalized name match
  const byNormName = catalog.find((e) => normalizeText(e.name) === normTarget);
  if (byNormName) return byNormName;

  // 4. Match via Comprehensive Synonym Dictionary
  for (const [exId, synonyms] of Object.entries(EXERCISE_SYNONYMS)) {
    const matchedSynonym = synonyms.some((syn) => {
      const normSyn = normalizeText(syn);
      if (normTarget === normSyn) return true;
      if (normTarget.length >= 4 && normSyn.length >= 4) {
        if (normTarget.includes(normSyn) || normSyn.includes(normTarget)) return true;
      }
      return false;
    });

    if (matchedSynonym) {
      const found = catalog.find((e) => e.id === exId);
      if (found) return found;
    }
  }

  // 5. Token-based matching with stopword removal & weighted relevance
  let bestCandidate: Exercise | undefined = undefined;
  let highestScore = 0;

  for (const ex of catalog) {
    const normEx = normalizeText(ex.name);
    const exTokens = getMeaningfulTokens(ex.name);

    // Exact containment with meaningful length (e.g. "Supino Inclinado" in "Supino Inclinado com Halteres")
    if (normTarget.length >= 5 && (normEx.includes(normTarget) || normTarget.includes(normEx))) {
      const diff = Math.abs(normEx.length - normTarget.length);
      const score = 100 - diff;
      if (score > highestScore) {
        highestScore = score;
        bestCandidate = ex;
      }
      continue;
    }

    // Token intersection score
    if (targetTokens.length > 0 && exTokens.length > 0) {
      const matchingTokens = targetTokens.filter((t) =>
        exTokens.some((et) => et === t || (t.length >= 4 && (et.startsWith(t) || t.startsWith(et))))
      );

      if (matchingTokens.length > 0) {
        const precision = matchingTokens.length / targetTokens.length;
        const recall = matchingTokens.length / exTokens.length;
        const score = (precision * 0.7 + recall * 0.3) * 85;

        // Prefer higher matching token counts
        if (matchingTokens.length >= 2 && score > highestScore && score >= 40) {
          highestScore = score;
          bestCandidate = ex;
        } else if (matchingTokens.length === 1 && targetTokens.length === 1 && score > highestScore && score >= 45) {
          highestScore = score;
          bestCandidate = ex;
        }
      }
    }
  }

  return bestCandidate;
}

/**
 * Generates a standard UTF-8 CSV string with BOM for full Excel/Google Sheets compatibility
 */
export function exportRoutinesToCSV(routines: Routine[], exercises: Exercise[]): string {
  const masterCatalog = combineMasterCatalog(INITIAL_EXERCISES, exercises);
  const exMap = new Map(masterCatalog.map((e) => [e.id, e.name]));

  const headers = [
    'Rotina',
    'Descricao',
    'Grupos_Musculares',
    'Exercicio',
    'Series',
    'Repeticoes',
    'Carga_Kg',
    'Descanso_Seg',
    'Notas'
  ];

  const rows: string[] = [headers.join(';')];

  routines.forEach((routine) => {
    const routineName = routine.name;
    const routineDesc = routine.description || '';
    const muscles = routine.targetMuscles.join(', ');

    if (!routine.exercises || routine.exercises.length === 0) {
      rows.push(
        [
          escapeCsvCell(routineName),
          escapeCsvCell(routineDesc),
          escapeCsvCell(muscles),
          '',
          '',
          '',
          '',
          '',
          ''
        ].join(';')
      );
    } else {
      routine.exercises.forEach((item) => {
        const exName = item.exerciseName || exMap.get(item.exerciseId) || item.exerciseId;
        rows.push(
          [
            escapeCsvCell(routineName),
            escapeCsvCell(routineDesc),
            escapeCsvCell(muscles),
            escapeCsvCell(exName),
            escapeCsvCell(item.setsCount),
            escapeCsvCell(item.targetReps),
            escapeCsvCell(item.initialWeight),
            escapeCsvCell(item.restSeconds),
            escapeCsvCell(item.notes || '')
          ].join(';')
        );
      });
    }
  });

  // Prepend UTF-8 BOM so Excel opens accents cleanly
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Helper to format ISO dates into standard Brazilian DD/MM/YYYY representation for CSV/Excel
 */
function formatCsvDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr || '';
  }
}

/**
 * Helper to format duration into clear human-readable minutes/hours/seconds for CSV/Excel
 */
function formatCsvDuration(durationSeconds?: number, startedAt?: string, completedAt?: string): string {
  let secs = durationSeconds || 0;
  if (!secs && startedAt && completedAt) {
    const diff = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 1000);
    if (diff > 0) secs = diff;
  }
  if (!secs || secs <= 0) return '0 min';
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  }
  if (minutes > 0) {
    return remainingSecs > 0 ? `${minutes}min ${remainingSecs}s` : `${minutes} min`;
  }
  return `${secs}s`;
}

/**
 * Exports completed workout history to CSV format with UTF-8 BOM, maintaining all requested columns:
 * Data, Duração, Rotina, Descricao, Grupos_Musculares, Exercício, Series, Repetições, Carga_Kg, Descanso_Seg, Notas, Musculo_Principal
 */
export function exportWorkoutHistoryToCSV(
  history: CompletedWorkout[],
  routines: Routine[] = [],
  exercises: Exercise[] = [],
  cardioHistory?: CardioSession[]
): string {
  const masterCatalog = combineMasterCatalog(INITIAL_EXERCISES, exercises);
  const exCatalogMap = new Map(masterCatalog.map((e) => [e.id, e]));

  // Auto-load workout history from localStorage if not provided or empty
  let activeHistory: CompletedWorkout[] = history || [];
  if ((!activeHistory || activeHistory.length === 0) && typeof window !== 'undefined' && window.localStorage) {
    try {
      const storedHistory = localStorage.getItem('thunder_history_v1');
      if (storedHistory) {
        activeHistory = JSON.parse(storedHistory);
      }
    } catch {
      // Ignore
    }
  }

  // Auto-load and merge ALL cardio history from localStorage (including warm-up and HIIT)
  let activeCardio: CardioSession[] = cardioHistory || [];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('thunder_cardio_sessions_v1');
      if (stored) {
        const storedList: CardioSession[] = JSON.parse(stored);
        if (Array.isArray(storedList)) {
          const map = new Map<string, CardioSession>();
          // 1. Add all from localStorage
          storedList.forEach((s) => map.set(s.id, s));
          // 2. Overlay or add any passed in memory
          (activeCardio || []).forEach((s) => map.set(s.id, s));
          activeCardio = Array.from(map.values());
        }
      }
    } catch {
      // Ignore
    }
  }

  // Official columns including Data and Duração:
  const headers = [
    'Data',
    'Duração',
    'Rotina',
    'Descricao',
    'Grupos_Musculares',
    'Exercício',
    'Series',
    'Repetições',
    'Carga_Kg',
    'Descanso_Seg',
    'Notas',
    'Musculo_Principal'
  ];

  const rows: string[] = [headers.join(';')];

  interface ExportSessionRecord {
    timestamp: number;
    rows: string[];
  }
  const sessionRecords: ExportSessionRecord[] = [];

  // 1. Export Weight Training Workouts
  if (activeHistory && activeHistory.length > 0) {
    activeHistory.forEach((workout) => {
      const workoutRows: string[] = [];
      const workoutDate = formatCsvDate(workout.completedAt || workout.startedAt);
      const workoutDuration = formatCsvDuration(
        workout.durationSeconds,
        workout.startedAt,
        workout.completedAt
      );
      const matchedRoutine = routines.find(
        (r) => (workout.routineId && r.id === workout.routineId) || r.name === workout.routineName
      );

      const workoutCalories = workout.estimatedCalories || calculateEstimatedCalories(workout.durationSeconds, workout.totalVolumeKg);
      const routineName = workout.routineName || matchedRoutine?.name || 'Treino Livre';
      const routineDesc = matchedRoutine?.description || workout.notes || `Sessão de musculação (~${workoutCalories} kcal | ${workout.totalVolumeKg.toLocaleString('pt-BR')} kg)`;

      const workoutMuscles = Array.from(
        new Set((workout.exercises || []).map((e) => e.muscleGroup).filter(Boolean))
      );
      const gruposMusculares =
        matchedRoutine?.targetMuscles && matchedRoutine.targetMuscles.length > 0
          ? matchedRoutine.targetMuscles.join(', ')
          : workoutMuscles.length > 0
          ? workoutMuscles.join(', ')
          : 'Geral';

      if (!workout.exercises || workout.exercises.length === 0) {
        return;
      }

      workout.exercises.forEach((item) => {
        const catalogEx = exCatalogMap.get(item.exerciseId);
        const exName = item.exerciseName || catalogEx?.name || item.exerciseId;
        const musculoPrincipal = item.muscleGroup || catalogEx?.muscleGroup || 'Geral';

        const completedSets = (item.sets || []).filter((s) => s.completed);
        const activeSets = completedSets.length > 0 ? completedSets : item.sets || [];
        const seriesCount = activeSets.length || 1;

        // Representative reps
        let repsVal: number = 10;
        if (activeSets.length > 0) {
          const repsList = activeSets.map((s) => s.reps);
          const allSame = repsList.every((r) => r === repsList[0]);
          repsVal = allSame
            ? repsList[0]
            : Math.round(repsList.reduce((a, b) => a + b, 0) / repsList.length);
        }

        // Top working load
        let weightVal: number = 0;
        if (activeSets.length > 0) {
          const weights = activeSets.map((s) => s.weight || 0);
          weightVal = Math.max(...weights);
        }

        const restSeconds = item.restSeconds || catalogEx?.defaultRestSeconds || 90;
        const isIso = isIsometricExercise(item) || isIsometricExercise(catalogEx);

        // Technical notes and set performance breakdown
        const notesParts: string[] = [];
        if (isIso) {
          notesParts.push(`Isometria (${seriesCount} séries de ${repsVal}s de sustentação)`);
        }
        if (item.notes && item.notes.trim()) {
          notesParts.push(item.notes.trim());
        } else if (catalogEx && CURATED_EXERCISE_NOTES[catalogEx.id]) {
          notesParts.push(CURATED_EXERCISE_NOTES[catalogEx.id]);
        }

        if (activeSets.length > 1) {
          const weights = activeSets.map((s) => s.weight);
          const reps = activeSets.map((s) => s.reps);
          const weightsVary = !weights.every((w) => w === weights[0]);
          const repsVary = !reps.every((r) => r === reps[0]);
          if (weightsVary || repsVary) {
            if (isIso) {
              notesParts.push(`Séries: ${activeSets.map((s) => (s.weight > 0 ? `+${s.weight}kg × ${s.reps}s` : `${s.reps}s`)).join(', ')}`);
            } else {
              notesParts.push(`Cargas: ${activeSets.map((s) => `${s.weight}kg×${s.reps}`).join(', ')}`);
            }
          }
        }

        const finalNotes = notesParts.join(' | ');

        workoutRows.push(
          [
            escapeCsvCell(workoutDate),
            escapeCsvCell(workoutDuration),
            escapeCsvCell(routineName),
            escapeCsvCell(routineDesc),
            escapeCsvCell(gruposMusculares),
            escapeCsvCell(exName),
            escapeCsvCell(seriesCount),
            escapeCsvCell(repsVal),
            escapeCsvCell(weightVal),
            escapeCsvCell(restSeconds),
            escapeCsvCell(finalNotes),
            escapeCsvCell(musculoPrincipal)
          ].join(';')
        );
      });

      if (workoutRows.length > 0) {
        sessionRecords.push({
          timestamp: new Date(workout.completedAt || workout.startedAt || 0).getTime(),
          rows: workoutRows
        });
      }
    });
  }

  // 2. Export ALL Cardio & Warm-up Sessions (Bicicleta Spinning)
  if (activeCardio && activeCardio.length > 0) {
    activeCardio.forEach((session) => {
      const cardioDate = formatCsvDate(session.completedAt);
      const cardioDuration = formatCsvDuration(
        session.durationSeconds,
        session.completedAt,
        session.completedAt
      );
      const isWarmup = session.type === 'warmup';
      const isHiit = session.type === 'hiit';

      const routineName = isWarmup
        ? 'Aquecimento — Bicicleta Spinning'
        : isHiit
        ? 'Cardio HIIT — Bicicleta Spinning'
        : 'Cardio Moderado — Bicicleta Spinning';

      const routineDesc = session.notes || (
        isWarmup
          ? 'Aquecimento de 5 min na Bicicleta Spinning'
          : isHiit
          ? `HIIT na Bicicleta Spinning (${session.hiitRounds || 1} rounds)`
          : `Pedalada aeróbica contínua (${session.targetMinutes || 30} min)`
      );

      const gruposMusculares = 'Cardiovascular, Pernas, Mobilidade';
      const exName = isWarmup
        ? 'Bicicleta Spinning (Aquecimento 5 min)'
        : isHiit
        ? 'Bicicleta Spinning (HIIT)'
        : 'Bicicleta Spinning (Moderado LISS)';

      const seriesCount = session.hiitRounds || 1;
      const repsVal = session.cadenceRpm || (isHiit ? 100 : isWarmup ? 75 : 80);
      const weightVal = 0;
      const restSeconds = session.restSeconds || 0;

      const notesParts: string[] = [];
      if (session.estimatedCalories) {
        notesParts.push(`~${session.estimatedCalories} kcal`);
      }
      if (session.estimatedDistanceKm) {
        notesParts.push(`${session.estimatedDistanceKm} km`);
      }
      if (session.cadenceRpm) {
        notesParts.push(`Cadência: ${session.cadenceRpm} RPM`);
      }
      if (session.resistanceLevel) {
        notesParts.push(`Carga: ${session.resistanceLevel}`);
      }
      if (session.notes && session.notes !== routineDesc) {
        notesParts.push(session.notes);
      }
      const finalNotes = notesParts.join(' | ') || (isWarmup ? 'Aquecimento pré-treino concluído' : 'Sessão de cardio concluída');
      const musculoPrincipal = 'Cardio';

      const cardioRow = [
        escapeCsvCell(cardioDate),
        escapeCsvCell(cardioDuration),
        escapeCsvCell(routineName),
        escapeCsvCell(routineDesc),
        escapeCsvCell(gruposMusculares),
        escapeCsvCell(exName),
        escapeCsvCell(seriesCount),
        escapeCsvCell(repsVal),
        escapeCsvCell(weightVal),
        escapeCsvCell(restSeconds),
        escapeCsvCell(finalNotes),
        escapeCsvCell(musculoPrincipal)
      ].join(';');

      sessionRecords.push({
        timestamp: new Date(session.completedAt || 0).getTime(),
        rows: [cardioRow]
      });
    });
  }

  // Sort all sessions chronologically (most recent first)
  if (sessionRecords.length > 0) {
    sessionRecords.sort((a, b) => b.timestamp - a.timestamp);
    sessionRecords.forEach((rec) => {
      rows.push(...rec.rows);
    });
  }

  // Fallback to routines only if both weight workouts and cardio history are completely empty
  if ((!activeHistory || activeHistory.length === 0) && (!activeCardio || activeCardio.length === 0) && routines && routines.length > 0) {
    const fallbackDate = formatCsvDate(new Date().toISOString());
    routines.forEach((routine) => {
      const routineName = routine.name;
      const routineDesc = routine.description || '';
      const muscles = routine.targetMuscles.join(', ');
      const totalSets = routine.exercises.reduce((acc, curr) => acc + curr.setsCount, 0);
      const estimatedDuration = `${Math.max(30, Math.round(totalSets * 2.5))} min`;

      routine.exercises.forEach((item) => {
        const catalogEx = exCatalogMap.get(item.exerciseId);
        const exName = item.exerciseName || catalogEx?.name || item.exerciseId;
        const musculoPrincipal = catalogEx?.muscleGroup || routine.targetMuscles[0] || 'Geral';
        const notes = item.notes || (catalogEx && CURATED_EXERCISE_NOTES[catalogEx.id]) || '';

        rows.push(
          [
            escapeCsvCell(fallbackDate),
            escapeCsvCell(estimatedDuration),
            escapeCsvCell(routineName),
            escapeCsvCell(routineDesc),
            escapeCsvCell(muscles),
            escapeCsvCell(exName),
            escapeCsvCell(item.setsCount),
            escapeCsvCell(item.targetReps),
            escapeCsvCell(item.initialWeight),
            escapeCsvCell(item.restSeconds),
            escapeCsvCell(notes),
            escapeCsvCell(musculoPrincipal)
          ].join(';')
        );
      });
    });
  }

  // Prepend UTF-8 BOM for Excel compatibility
  return '\uFEFF' + rows.join('\r\n');
}

/**
 * Triggers browser download of text/file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse a CSV line taking into account quoted strings
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Parses CSV text into an array of Routine objects, linking exercises to the standard library with technical notes
 */
export function parseRoutinesFromCSV(
  csvText: string,
  existingExercises: Exercise[]
): {
  routines: Routine[];
  newExercisesCreated: Exercise[];
  matchedLibraryCount: number;
  customCreatedCount: number;
} {
  // Strip BOM if present
  const cleanText = csvText.startsWith('\uFEFF') ? csvText.slice(1) : csvText;
  const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('O arquivo CSV está vazio ou não possui linhas de dados.');
  }

  // Detect delimiter (; or , or \t)
  const firstLine = lines[0];
  const countSemi = (firstLine.match(/;/g) || []).length;
  const countComma = (firstLine.match(/,/g) || []).length;
  const countTab = (firstLine.match(/\t/g) || []).length;
  const delimiter = countSemi >= countComma && countSemi >= countTab ? ';' : countTab > countComma ? '\t' : ',';

  const rawHeaders = parseCsvLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')
  );

  // Map header columns
  const getColIdx = (keywords: string[]) => {
    for (let i = 0; i < rawHeaders.length; i++) {
      for (const kw of keywords) {
        if (rawHeaders[i].includes(kw)) return i;
      }
    }
    return -1;
  };

  const colRoutine = getColIdx(['rotina', 'treino', 'nome']);
  const colDesc = getColIdx(['desc', 'detalhe', 'info']);
  const colMuscles = getColIdx(['grupo', 'muscul', 'alvo']);
  const colExercise = getColIdx(['exerc', 'movimento', 'item']);
  const colSets = getColIdx(['serie', 'set', 'qtd']);
  const colReps = getColIdx(['rep', 'repet']);
  const colWeight = getColIdx(['carga', 'peso', 'kg']);
  const colRest = getColIdx(['descanso', 'rest', 'pausa', 'tempo']);
  const colNotes = getColIdx(['nota', 'obs', 'coment', 'dica', 'observacao']);

  if (colRoutine === -1 && colExercise === -1) {
    throw new Error('Não foi possível identificar as colunas de Rotina/Treino ou Exercício no cabeçalho.');
  }

  const routinesMap = new Map<string, {
    name: string;
    description: string;
    targetMuscles: Set<MuscleGroup>;
    exercises: RoutineExerciseTemplate[];
  }>();

  const newExercises: Exercise[] = [];
  const masterCatalog = combineMasterCatalog(INITIAL_EXERCISES, existingExercises);
  let matchedLibraryCount = 0;
  let customCreatedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i], delimiter);
    if (cols.length === 0 || cols.every((c) => c === '')) continue;

    const routineName = (colRoutine !== -1 ? cols[colRoutine] : '') || 'Treino Importado';
    const routineDesc = (colDesc !== -1 ? cols[colDesc] : '') || 'Rotina importada via CSV';
    const rawMuscles = colMuscles !== -1 ? cols[colMuscles] : '';
    const exName = (colExercise !== -1 ? cols[colExercise] : '').trim();
    const setsCount = Math.max(1, parseInt(colSets !== -1 ? cols[colSets] : '3', 10) || 3);
    const targetReps = Math.max(1, parseInt(colReps !== -1 ? cols[colReps] : '10', 10) || 10);
    const initialWeight = Math.max(0, parseFloat((colWeight !== -1 ? cols[colWeight] : '0').replace(',', '.')) || 0);
    const rawRest = colRest !== -1 ? cols[colRest] : '';
    const userNotes = colNotes !== -1 ? cols[colNotes] : '';

    // Extract muscles
    const musclesList: MuscleGroup[] = [];
    if (rawMuscles) {
      const parts = rawMuscles.split(/[,/|;]/).map((p) => p.trim());
      const validMuscles: MuscleGroup[] = [
        'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 
        'Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Abdômen'
      ];
      parts.forEach((p) => {
        const match = validMuscles.find(
          (vm) => vm.toLowerCase() === p.toLowerCase()
        );
        if (match) musclesList.push(match);
      });
    }

    if (!routinesMap.has(routineName)) {
      routinesMap.set(routineName, {
        name: routineName,
        description: routineDesc,
        targetMuscles: new Set(musclesList.length > 0 ? musclesList : ['Peito']),
        exercises: []
      });
    }

    const currentRoutine = routinesMap.get(routineName)!;
    musclesList.forEach((m) => currentRoutine.targetMuscles.add(m));

    if (exName) {
      // 1. Search library of 340+ exercises
      let matchedEx = findBestExerciseMatch(exName, masterCatalog);
      
      if (matchedEx) {
        matchedLibraryCount++;
        // If routine targetMuscles hasn't registered this muscle yet, add it
        currentRoutine.targetMuscles.add(matchedEx.muscleGroup);
      } else {
        // Create custom exercise if completely unknown
        customCreatedCount++;
        const defaultGroup = musclesList[0] || 'Peito';
        matchedEx = {
          id: `custom-ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: exName,
          muscleGroup: defaultGroup,
          equipment: 'Outro',
          instructions: ['Executar o movimento com técnica e controle de carga.'],
          isCustom: true,
          defaultRestSeconds: rawRest ? Math.max(15, parseInt(rawRest, 10) || 90) : 90
        };
        newExercises.push(matchedEx);
        masterCatalog.push(matchedEx);
      }

      // 2. Determine standard app note
      const finalNote = getStandardExerciseNote(matchedEx, userNotes);

      // 3. Determine rest seconds (use CSV value or defaultRestSeconds from catalog)
      const restSeconds = rawRest
        ? Math.max(15, parseInt(rawRest, 10) || matchedEx.defaultRestSeconds || 90)
        : (matchedEx.defaultRestSeconds || 90);

      currentRoutine.exercises.push({
        exerciseId: matchedEx.id,
        exerciseName: matchedEx.name || exName, // Always record standardized name
        setsCount,
        targetReps,
        initialWeight,
        restSeconds,
        notes: finalNote
      });
    }
  }

  const finalRoutines: Routine[] = Array.from(routinesMap.values()).map((r, idx) => ({
    id: `routine-imp-${Date.now()}-${idx}`,
    name: r.name,
    description: r.description,
    targetMuscles: Array.from(r.targetMuscles),
    exercises: r.exercises,
    order: idx,
    createdAt: new Date().toISOString()
  }));

  return {
    routines: finalRoutines,
    newExercisesCreated: newExercises,
    matchedLibraryCount,
    customCreatedCount
  };
}
