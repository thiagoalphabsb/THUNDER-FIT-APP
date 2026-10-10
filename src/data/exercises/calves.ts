import { Exercise } from '../../types';

export const CALVES_EXERCISES: Exercise[] = [
  {
    id: 'gemeos-em-pe-smith',
    name: 'Gêmeos em Pé no Smith / Degrau',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie a ponta dos pés na borda de um degrau com a barra do Smith sobre os ombros.',
      'Desça os calcanhares o máximo possível para alongar a panturrilha.',
      'Suba na ponta dos pés o mais alto que puder.',
      'Segure no topo por 1 segundo e pause 1 segundo no alongamento embaixo.'
    ],
    tips: 'Trabalha o gastrocnêmio com joelhos totalmente estendidos.'
  },
  {
    id: 'gemeos-em-pe-maquina-calf-machine',
    name: 'Gêmeos em Pé na Máquina Própria (Standing Calf Raise)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Posicione os ombros sob as almofadas acolchoadas da máquina de panturrilha em pé.',
      'Desça até a amplitude máxima e suba na ponta dos pés contraindo ao máximo.'
    ]
  },
  {
    id: 'gemeos-sentado-maquina',
    name: 'Gêmeos Sentado na Máquina (Solear)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se no aparelho e ajuste a almofada sobre as coxas logo acima dos joelhos.',
      'Apoie a ponta dos pés na plataforma.',
      'Desça os calcanhares em amplitude máxima de alongamento.',
      'Empurre para cima com a ponta dos pés até a contração total.'
    ],
    tips: 'Com os joelhos flexionados a 90°, o músculo sóleo assume quase todo o trabalho de flexão plantar.'
  },
  {
    id: 'gemeos-sentado-com-barra-nos-joelhos',
    name: 'Gêmeos Sentado com Barra nos Joelhos (Banco Plano)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Barra',
    defaultRestSeconds: 60,
    instructions: [
      'Sente-se no banco com a ponta dos pés no step e uma barra com almofada sobre os joelhos.',
      'Execute as elevações plantares com cadência controlada.'
    ]
  },
  {
    id: 'gemeos-sentado-com-halteres-nos-joelhos',
    name: 'Gêmeos Sentado com Halteres nos Joelhos',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie um haltere pesado verticalmente sobre cada joelho e eleve os calcanhares.'
    ]
  },
  {
    id: 'gemeos-no-leg-press-45',
    name: 'Panturrilha no Leg Press 45º (Calf Press on Leg Press)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se no Leg Press com as pernas estendidas e pontas dos pés na borda inferior da plataforma.',
      'Deixe a plataforma descer empurrando os calcanhares para trás (dorsiflexão).',
      'Empurre a plataforma para a frente na ponta dos pés estendendo os tornozelos.',
      'Mantenha as travas de segurança ativadas em nível acessível.'
    ],
    tips: 'Permite sobrecarga pesada com excelente estabilização de tronco.'
  },
  {
    id: 'gemeos-no-leg-press-horizontal',
    name: 'Panturrilha no Leg Press Horizontal',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie as pontas dos pés na base do Leg Press horizontal e execute a flexão plantar.'
    ]
  },
  {
    id: 'gemeos-no-hack-squat-machine',
    name: 'Panturrilha no Hack Machine',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Posicione os ombros nas almofadas do Hack e ponta dos pés na borda do tablado.',
      'Eleve o corpo estendendo os tornozelos.'
    ]
  },
  {
    id: 'gemeos-unilateral-em-pe-com-halter',
    name: 'Gêmeos Unilateral em Pé com Halter no Step',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Segure um haltere na mão do lado da perna que trabalha e apoie a outra mão na parede.',
      'Apoie apenas um pé no step e desça o calcanhar ao limite.',
      'Suba na ponta do pé contraindo intensamente a panturrilha.',
      'Excelente para equilíbrio e força simétrica.'
    ]
  },
  {
    id: 'gemeos-unilateral-peso-corporal-step',
    name: 'Gêmeos Unilateral com Peso Corporal no Step',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Equilibre-se em uma perna só na ponta do degrau.',
      'Execute repetições lentas (3s na descida, 2s de pausa no topo).'
    ]
  },
  {
    id: 'gemeos-burrinho-donkey-calf-raise',
    name: 'Gêmeos Estilo Burrinho (Donkey Calf Raise)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Incline o tronco a 90° apoiando os braços em um suporte ou máquina de Donkey.',
      'Com o quadril flexionado a 90° e joelhos retos, eleve os calcanhares.',
      'Coloca o gastrocnêmio em máximo estiramento biomecânico.'
    ]
  },
  {
    id: 'gemeos-em-pe-com-barra-livre',
    name: 'Gêmeos em Pé com Barra Livre nos Ombros',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: ['Abdômen'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Barra nos trapézios, ponta dos pés em uma anilha grossa ou step.',
      'Eleve o corpo mantendo o equilíbrio postural.'
    ]
  },
  {
    id: 'elevacao-tibial-anterior-parede-tibialis-raise',
    name: 'Elevação Tibial Anterior na Parede (Tibialis Raise)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Encoste as costas e glúteos na parede com pés afastados cerca de 40cm da parede.',
      'Com pernas estendidas e calcanhares no chão, eleve as pontas dos pés para o alto o mais alto que puder.',
      'Desça lentamente sem encostar os dedos no chão.',
      'Fundamental para proteger os joelhos contra dores e canelite.'
    ],
    tips: 'Fortalece o músculo tibial anterior, equilibrando a força da panturrilha posterior.'
  },
  {
    id: 'elevacao-tibial-com-halter-ou-caneleira',
    name: 'Elevação Tibial com Halter / Caneleira no Banco',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 45,
    instructions: [
      'Sente-se no banco alto com as pernas penduradas e um haltere ou peso preso aos pés.',
      'Puxe a ponta dos pés para cima flexionando os tornozelos (dorsiflexão).'
    ]
  },
  {
    id: 'elevacao-tibial-na-polia-com-tornozeleira',
    name: 'Elevação Tibial Anterior na Polia Baixa',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 45,
    instructions: [
      'Prenda a tornozeleira na ponta do pé conectada à polia baixa.',
      'Puxe os dedos do pé em direção à canela contra a carga.'
    ]
  },
  {
    id: 'pulos-de-corda-jump-rope',
    name: 'Pulos de Corda (Jump Rope para Panturrilhas)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: ['Ombros'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Pule corda na ponta dos pés mantendo os calcanhares elevados durante todo o tempo por séries de 1 a 3 minutos.',
      'Excelente para reatividade do tendão de Aquiles e resistência muscular.'
    ]
  },
  {
    id: 'panturrilha-isometria-topo-degrau',
    name: 'Panturrilha Isométrica no Step (Hold de 45 Segundos)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    isIsometric: true,
    instructions: [
      'Suba na ponta máxima dos pés no degrau e sustente a posição estática sem descer por 45 segundos seguidos.'
    ]
  },
  {
    id: 'caminhada-na-ponta-dos-pes-tip-toe-walk',
    name: 'Caminhada na Ponta dos Pés (Tip-Toe Walk)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Segure dois halteres pesados nas mãos e caminhe apoiando estritamente a ponta dos pés pelo salão da academia por 60 segundos.'
    ]
  }
];
