import { Exercise } from '../../types';

export const GLUTE_EXERCISES: Exercise[] = [
  {
    id: 'elevacao-pelvica-barra',
    name: 'Elevação Pélvica com Barra (Hip Thrust)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores', 'Quadríceps'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie a parte superior das costas na borda de um banco resistente.',
      'Posicione a barra acolchoada sobre a dobra do quadril.',
      'Pés no chão na largura dos ombros com joelhos alinhados com os calcanhares no topo.',
      'Eleve o quadril estendendo até formar linha reta do joelho aos ombros.',
      'Aperte os glúteos fortemente no topo por 1 segundo antes de descer.'
    ],
    tips: 'Mantenha o queixo apontando para o peito durante a subida para proteger a coluna.'
  },
  {
    id: 'elevacao-pelvica-maquina-hip-thrust',
    name: 'Elevação Pélvica na Máquina (Hip Thrust Machine)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste o cinto acolchoado ou almofada sobre o quadril.',
      'Apoie os pés na plataforma e empurre para cima contraindo os glúteos no ponto máximo.'
    ]
  },
  {
    id: 'elevacao-pelvica-smith-machine',
    name: 'Elevação Pélvica no Smith Machine',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione o banco em frente à barra do Smith com protetor acolchoado na barra.',
      'Destrave a barra com a bacia e execute as elevações pélvicas.'
    ]
  },
  {
    id: 'elevacao-pelvica-unilateral-solo',
    name: 'Elevação Pélvica Unilateral no Solo (Ponte de Glúteo)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Deite de costas no chão com joelhos dobrados.',
      'Estenda uma perna para o alto ou cruze o tornozelo sobre o joelho oposto.',
      'Eleve o quadril com a força de um único glúteo e segure por 1s no topo.'
    ]
  },
  {
    id: 'elevacao-pelvica-unilateral-banco',
    name: 'Elevação Pélvica Unilateral no Banco com Halter',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Costas apoiadas no banco, segure um haltere sobre o quadril de um lado e eleve a bacia com uma perna só.'
    ]
  },
  {
    id: 'elevacao-pelvica-com-elastico-miniband',
    name: 'Elevação Pélvica com Miniband nos Joelhos',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Coloque o elástico miniband logo acima dos joelhos.',
      'Ao subir a bacia, empurre os joelhos para fora contra o elástico para ativar o glúteo médio e máximo simultaneamente.'
    ]
  },
  {
    id: 'cadeira-abdutora',
    name: 'Cadeira Abdutora Sentada (Tradicional)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se com as costas apoiadas e as almofadas na parte externa dos joelhos.',
      'Abra as pernas empurrando para fora contra a resistência.',
      'Segure no ponto máximo de abertura por 1 segundo e retorne lentamente.'
    ]
  },
  {
    id: 'cadeira-abdutora-tronco-inclinado',
    name: 'Cadeira Abdutora com Tronco Inclinado à Frente',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Incline o tronco para a frente a 45° segurando na estrutura da máquina.',
      'Abra as pernas sentindo a queimação direta no glúteo médio e superior.'
    ],
    tips: 'A flexão de quadril muda o alinhamento das fibras, focando nos glúteos superiores.'
  },
  {
    id: 'cadeira-abdutora-em-pe',
    name: 'Cadeira Abdutora em Pé (Fora do Assento)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Levante-se ligeiramente do banco em semi-agachamento e afaste as almofadas para fora.'
    ]
  },
  {
    id: 'gluteo-cabo-polia',
    name: 'Glúteo Coice na Polia Baixa (Kickback)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Prenda a tornozeleira na polia baixa e fique de frente para o aparelho.',
      'Segure o apoio e incline o tronco.',
      'Chute a perna para trás e ligeiramente para fora estendendo o quadril.',
      'Aperte o glúteo no pico de contração e retorne com calma.'
    ],
    tips: 'Evite hiperestender a lombar durante o chute.'
  },
  {
    id: 'gluteo-polia-abducao-quadril-lateral',
    name: 'Abdução de Quadril na Polia Baixa (Glúteo Médio no Cabo)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Fique de lado para a polia baixa com a tornozeleira na perna externa.',
      'Eleve a perna lateralmente para fora em linha reta sem inclinar o tronco.'
    ]
  },
  {
    id: 'gluteo-quatro-apoios-caneleira-perna-estendida',
    name: 'Glúteo 4 Apoios no Solo com Perna Estendida (Caneleira)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie antebraços e joelhos no colchonete com caneleira nos tornozelos.',
      'Estenda uma perna para trás e eleve o calcanhar acima da linha do quadril apertando o glúteo.'
    ]
  },
  {
    id: 'gluteo-quatro-apoios-joelho-flexionado-90',
    name: 'Glúteo 4 Apoios com Joelho a 90° (Coice com Caneleira)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Com o joelho dobrado em 90°, empurre a sola do pé em direção ao teto.',
      'Desça o joelho até a linha do outro sem encostar no chão e repita.'
    ]
  },
  {
    id: 'gluteo-maquina-quatro-apoios',
    name: 'Glúteo na Máquina (Aparelho de Glúteo / Glute Drive)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie o peito na almofada e o pé na alavanca da máquina.',
      'Empurre a alavanca para trás e para cima contraindo os glúteos.'
    ]
  },
  {
    id: 'abducao-quadril-deitado-clam-shell-ostra',
    name: 'Clam Shell no Solo (Exercício da Ostra com Miniband)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 45,
    instructions: [
      'Deite-se de lado com joelhos flexionados a 90° e pés juntos.',
      'Abra o joelho de cima para o alto mantendo os calcanhares colados.',
      'Excelente ativação do glúteo médio e rotadores profundos do quadril.'
    ]
  },
  {
    id: 'abducao-lateral-solo-com-caneleira',
    name: 'Abdução de Quadril Deitado de Lado com Caneleira',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 45,
    instructions: [
      'Deite de lado com pernas estendidas e caneleira no tornozelo.',
      'Eleve a perna superior a 45° mantendo a ponta do pé ligeiramente apontada para baixo.'
    ]
  },
  {
    id: 'monster-walk-passos-laterais-miniband',
    name: 'Monster Walk com Miniband (Caminhada Lateral com Elástico)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Coloque o miniband nos tornozelos ou joelhos.',
      'Fique em semi-agachamento e dê passos laterais controlados mantendo a tensão do elástico.'
    ]
  },
  {
    id: 'frog-pumps-solo',
    name: 'Frog Pumps no Solo (Ponte Sapo para Glúteos)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Deite de costas no chão com as solas dos pés unidas e joelhos caídos para fora (posição de borboleta).',
      'Eleve a bacia para o teto esmagando os glúteos no topo.',
      'Pode apoiar um haltere no quadril para carga extra.'
    ]
  },
  {
    id: 'hiperextensao-45-com-rotacao-externa-gluteos',
    name: 'Hiperextensão 45° com Pés em Rotação Externa (Foco Glúteo)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'No banco romano, aponte as pontas dos pés para fora a 45° e arredonde a parte superior das costas.',
      'Suba estendendo o quadril exclusivamente através da contração máxima dos glúteos.'
    ]
  },
  {
    id: 'agachamento-sumo-com-barra-livre',
    name: 'Agachamento Sumô com Barra Livre',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Quadríceps', 'Posteriores'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Pés bem afastados com pontas viradas para fora a 45°.',
      'Agache descendo o quadril na vertical e empurre o chão com os calcanhares subindo com os glúteos.'
    ]
  },
  {
    id: 'agachamento-sumo-com-kettlebell',
    name: 'Agachamento Sumô com Kettlebell',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Quadríceps'],
    equipment: 'Kettlebell',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a alça do kettlebell com ambas as mãos em postura sumô e agache profundo.'
    ]
  },
  {
    id: 'passada-cruzada-curtsy-lunge-halteres',
    name: 'Passada Cruzada Atrás com Halteres (Curtsy Lunge)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Quadríceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Em pé, dê um passo para trás cruzando a perna por trás do corpo na diagonal como uma reverência.',
      'Desça o joelho e empurre a perna da frente ativando o glúteo médio e lateral do quadril.'
    ]
  },
  {
    id: 'fire-hydrant-hidrante-quatro-apoios',
    name: 'Fire Hydrant no Solo (Abdução 4 Apoios / Hidrante)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Na posição de quatro apoios, abra o joelho para a lateral mantendo o ângulo de 90° sem girar a bacia.'
    ]
  },
  {
    id: 'step-up-cruzado-no-banco',
    name: 'Step-up Cruzado no Banco (Cross-Over Step-up)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Quadríceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Fique de lado para o banco e cruze a perna externa por cima subindo no banco com o glúteo.'
    ]
  },
  {
    id: 'ponte-de-gluteos-com-pes-elevados-no-banco',
    name: 'Ponte de Glúteo com Pés Elevados no Banco',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite no chão e apoie os pés no banco.',
      'Eleve o quadril ampliando o curso do movimento e a contração muscular.'
    ]
  },
  {
    id: 'agachamento-bulgaro-com-inclinacao-para-gluteo',
    name: 'Agachamento Búlgaro com Tronco Inclinado (Glute-Focused BSS)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: ['Posteriores', 'Quadríceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'No agachamento búlgaro, projete o quadril mais para trás e incline o tronco para a frente a 45° mantendo a canela vertical.',
      'Aumenta o braço de momento sobre os glúteos em até 40%.'
    ]
  },
  {
    id: 'cabo-gluteo-em-diagonal-polia-baixa',
    name: 'Glúteo na Polia em Diagonal (45° Extension)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Chute o cabo em um ângulo de 45° para trás e para fora, recrutando tanto o glúteo máximo quanto o glúteo médio na mesma repetição.'
    ]
  },
  {
    id: 'donkey-kicks-com-smith-machine',
    name: 'Donkey Kick no Smith Machine (Chute no Smith)',
    muscleGroup: 'Glúteos',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Ajoelhe-se sob a barra do Smith e apoie a sola do pé no centro da barra.',
      'Empurre a barra para cima estendendo a perna até a contração máxima do glúteo.'
    ]
  }
];
