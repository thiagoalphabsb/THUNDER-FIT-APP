import { Exercise } from '../../types';

export const SHOULDER_EXERCISES: Exercise[] = [
  {
    id: 'desenvolvimento-halteres',
    name: 'Desenvolvimento com Halteres (Sentado)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Peito'],
    equipment: 'Halteres',
    defaultRestSeconds: 120,
    instructions: [
      'Sente-se no banco com o encosto vertical a 75°-85°.',
      'Erga os halteres na altura das orelhas com palmas para a frente.',
      'Empurre os halteres para cima até estender quase totalmente os braços.',
      'Desça com controle até a altura dos ombros.'
    ],
    tips: 'Não encoste os halteres com força no topo para manter a tensão mecânica constante.'
  },
  {
    id: 'desenvolvimento-halteres-em-pe',
    name: 'Desenvolvimento com Halteres em Pé',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Abdômen'],
    equipment: 'Halteres',
    defaultRestSeconds: 120,
    instructions: [
      'Em pé com pés na largura dos ombros e glúteos contraídos.',
      'Empurre os halteres acima da cabeça mantendo o core rígido.'
    ]
  },
  {
    id: 'desenvolvimento-militar-barra',
    name: 'Desenvolvimento Militar com Barra (OHP)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Abdômen'],
    equipment: 'Barra',
    defaultRestSeconds: 150,
    instructions: [
      'Em pé, segure a barra na linha da clavícula com pegada na largura dos ombros.',
      'Contraia glúteos e abdômen para proteger a lombar.',
      'Empurre a barra verticalmente passando rente ao rosto.',
      'Trave a barra acima da cabeça com a cabeça levemente projetada à frente.'
    ],
    tips: 'Exercício rei para força e massa no deltóide anterior e medial.'
  },
  {
    id: 'desenvolvimento-barra-sentado',
    name: 'Desenvolvimento com Barra Sentado',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Sente-se no banco com encosto firme e segure a barra à frente do peito.',
      'Pressione a barra para cima até a extensão completa dos braços.'
    ]
  },
  {
    id: 'desenvolvimento-maquina',
    name: 'Desenvolvimento na Máquina / Articulado',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se no aparelho e ajuste a altura do banco.',
      'Empurre para cima estendendo os braços com estabilidade.'
    ]
  },
  {
    id: 'desenvolvimento-smith',
    name: 'Desenvolvimento no Smith Machine (Frente)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione o banco a 80° sob a barra do Smith.',
      'Desça a barra até a altura do queixo/clavícula e empurre com força.'
    ]
  },
  {
    id: 'desenvolvimento-smith-nuca',
    name: 'Desenvolvimento no Smith Machine (Atrás da Nuca)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Trapézio'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Desça a barra controladamente até a altura da parte superior da cabeça/nuca.',
      'Empurre de volta mantendo a postura firme.'
    ]
  },
  {
    id: 'desenvolvimento-arnold-press',
    name: 'Desenvolvimento Arnold Press com Halteres',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Inicie com os halteres na frente do peito e palmas viradas para você.',
      'Enquanto empurra para cima, gire os punhos para fora até as palmas ficarem para a frente no topo.',
      'Inverta o movimento na descida.'
    ],
    tips: 'Trabalha as cabeças anterior e lateral do deltóide em um movimento contínuo fluido.'
  },
  {
    id: 'desenvolvimento-unilateral-halter-kettlebell',
    name: 'Desenvolvimento Unilateral com Halter / Kettlebell',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Abdômen'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Empurre o peso para cima com um braço de cada vez.',
      'Excelente para ativar estabilizadores do tronco e oblíquos.'
    ]
  },
  {
    id: 'desenvolvimento-landmine-press',
    name: 'Landmine Press (Desenvolvimento na Barra Landmine)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Peito', 'Tríceps'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a ponta da barra landmine na altura do ombro.',
      'Empurre para cima e para frente em ângulo diagonal.',
      'Maneira muito amigável para quem possui impacto no ombro.'
    ]
  },
  {
    id: 'desenvolvimento-bradford-press',
    name: 'Bradford Press com Barra (Frente e Nuca)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Tríceps', 'Trapézio'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Passe a barra da clavícula por cima da cabeça até a nuca sem travar os cotovelos.',
      'Retorne imediatamente para a frente. Mantém tensão mecânica extrema constante.'
    ]
  },
  {
    id: 'elevacao-lateral-halteres',
    name: 'Elevação Lateral com Halteres (Em Pé)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Em pé, segure os halteres ao lado do corpo com cotovelos levemente flexionados.',
      'Eleve os braços lateralmente no plano escapular até a altura dos ombros.',
      'Desça com controle resistindo à gravidade.'
    ],
    tips: 'Não balance o tronco. Mantenha os ombros deprimidos para não recrutar apenas o trapézio.'
  },
  {
    id: 'elevacao-lateral-sentado-halteres',
    name: 'Elevação Lateral Sentado com Halteres',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se na ponta do banco com halteres ao lado das coxas.',
      'Eleve os braços lateralmente sem qualquer impulso das pernas.'
    ]
  },
  {
    id: 'elevacao-lateral-banco-inclinado-leaning',
    name: 'Elevação Lateral Inclinado no Banco / Poste (Leaning Raise)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Segure em um poste ou apoie-se de lado em um banco inclinado a 60°.',
      'Eleve o braço lateralmente contra a gravidade.',
      'Aumenta a tensão na fase inicial do movimento.'
    ]
  },
  {
    id: 'elevacao-lateral-polia',
    name: 'Elevação Lateral na Polia Baixa',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Posicione a polia na altura do tornozelo/joelho.',
      'Puxe a manopla lateralmente até a linha do ombro.',
      'A polia oferece tensão constante perfeita em toda a amplitude de movimento.'
    ]
  },
  {
    id: 'elevacao-lateral-polia-por-tras',
    name: 'Elevação Lateral na Polia por Trás do Corpo',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Passe o cabo da polia por trás das costas segurando a manopla.',
      'Eleve o braço para o lado e sinta a tensão contínua no deltóide medial.'
    ]
  },
  {
    id: 'elevacao-lateral-maquina',
    name: 'Elevação Lateral na Máquina',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste a altura do assento e apoie os braços nas almofadas laterais.',
      'Eleve os cotovelos lateralmente até a altura dos ombros e segure no topo por 1s.'
    ]
  },
  {
    id: 'elevacao-lateral-crossover-dupla-polia',
    name: 'Elevação Lateral Dupla na Polia Cruzada (Crossover Raises)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Fique no meio do crossover com as polias na altura do quadril.',
      'Cruze as mãos para segurar os cabos opostos e abra ambos os braços lateralmente.'
    ]
  },
  {
    id: 'elevacao-y-raise-banco-inclinado',
    name: 'Y-Raise no Banco Inclinado (Deltóide Lateral e Trapézio Inferior)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Deite de bruços no banco inclinado a 30° segurando halteres leves.',
      'Eleve os braços em formato de "Y" (45° entre a frente e o lado) com polegares apontando para cima.'
    ]
  },
  {
    id: 'elevacao-frontal-halteres',
    name: 'Elevação Frontal Alternada com Halteres',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Peito'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Em pé, eleve um haltere à frente até a altura dos olhos com controle.',
      'Desça lentamente e alterne com o outro braço.'
    ]
  },
  {
    id: 'elevacao-frontal-barra',
    name: 'Elevação Frontal com Barra Reta / W',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Peito'],
    equipment: 'Barra',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a barra com pegada pronada na largura dos ombros.',
      'Eleve a barra à frente até a linha do queixo/olhos sem balançar o corpo.'
    ]
  },
  {
    id: 'elevacao-frontal-polia-corda',
    name: 'Elevação Frontal na Polia com Corda',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Peito'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Passe a corda da polia baixa por entre as pernas.',
      'Eleve os braços à frente até a altura dos ombros.'
    ]
  },
  {
    id: 'elevacao-frontal-anilha',
    name: 'Elevação Frontal com Anilha (Pega Volante)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Peito'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Segure uma anilha com as duas mãos nas laterais (posição 9 e 3 do relógio).',
      'Eleve a anilha acima dos olhos e faça uma leve rotação de volante no topo.'
    ]
  },
  {
    id: 'elevacao-frontal-banco-inclinado',
    name: 'Elevação Frontal no Banco Inclinado',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Peito'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Deite de costas no banco inclinado a 45° com halteres nas mãos.',
      'Eleve os halteres estendendo à frente para máximo isolamento anterior.'
    ]
  },
  {
    id: 'crucifixo-invertido-halteres',
    name: 'Crucifixo Invertido com Halteres (Curvado)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Costas', 'Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Incline o tronco à frente com costas retas.',
      'Abra os braços para trás e para cima com cotovelos levemente flexionados contraindo o deltóide posterior.',
      'Desça com controle.'
    ]
  },
  {
    id: 'crucifixo-invertido-banco-inclinado',
    name: 'Crucifixo Invertido no Banco Inclinado (Peito Apoiado)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Costas', 'Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite de bruços no banco inclinado a 30° com halteres.',
      'Abra os braços para fora focando no deltóide posterior sem usar impulso.'
    ]
  },
  {
    id: 'crucifixo-invertido-peck-deck',
    name: 'Crucifixo Invertido no Peck Deck (Voador Invertido)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Costas', 'Trapézio'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se de frente para o encosto do Peck Deck com braços estendidos nas manoplas.',
      'Abra os braços para trás até a contração máxima do deltóide posterior.',
      'Retorne de forma lenta.'
    ]
  },
  {
    id: 'crucifixo-invertido-crossover-polia-alta',
    name: 'Crucifixo Invertido no Crossover na Polia Alta (Rear Delt Cross)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Costas', 'Trapézio'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Fique no centro do crossover sem pegadores (segurando nas bolinhas dos cabos).',
      'Cruze os braços na frente e abra-os para trás na altura dos ombros.'
    ]
  },
  {
    id: 'face-pull-polia',
    name: 'Face Pull na Polia com Corda',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Costas', 'Trapézio'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste a polia na altura dos olhos.',
      'Segure a corda com polegares apontando para trás.',
      'Puxe em direção ao rosto separando as mãos e rodando externamente os ombros.',
      'Segure 1 segundo na contração e retorne com calma.'
    ],
    tips: 'Excelente para prevenir lesões nos ombros e corrigir postura curvada.'
  },
  {
    id: 'face-pull-com-elastico-band',
    name: 'Face Pull com Elástico / Miniband',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Outro',
    defaultRestSeconds: 45,
    instructions: [
      'Prenda o elástico em um suporte fixo na altura dos olhos.',
      'Puxe o elástico em direção às orelhas rodando os braços para fora.'
    ]
  },
  {
    id: 'remada-alta-barra',
    name: 'Remada Alta com Barra (Upright Row)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio', 'Bíceps'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a barra com pegada na largura dos ombros.',
      'Puxe a barra verticalmente até a altura do peito médio conduzindo o movimento com os cotovelos altos.',
      'Desça lentamente.'
    ]
  },
  {
    id: 'remada-alta-polia-corda',
    name: 'Remada Alta na Polia com Corda',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Prenda a corda na polia baixa.',
      'Puxe em direção ao queixo separando as mãos para aliviar os punhos.'
    ]
  },
  {
    id: 'remada-alta-halteres',
    name: 'Remada Alta com Halteres',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Segure os halteres à frente das coxas.',
      'Puxe para cima guiando pelos cotovelos permitindo rotação natural dos punhos.'
    ]
  },
  {
    id: 'encolhimento-trapezio-halteres',
    name: 'Encolhimento de Ombros com Halteres (Trapézio)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Segure halteres pesados ao lado do corpo.',
      'Eleve os ombros verticalmente em direção às orelhas o mais alto possível.',
      'Segure no topo por 1-2 segundos e desça sentindo o alongamento do trapézio.'
    ],
    tips: 'Não faça rotação dos ombros; o movimento correto é estritamente vertical para cima e para baixo.'
  },
  {
    id: 'encolhimento-trapezio-barra-frente',
    name: 'Encolhimento de Ombros com Barra pela Frente',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a barra à frente das coxas com pegada na largura dos ombros.',
      'Encolha os ombros para cima com força máxima.'
    ]
  },
  {
    id: 'encolhimento-trapezio-barra-tras-lee-haney',
    name: 'Encolhimento com Barra por Trás (Lee Haney Shrug)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a barra por trás das costas/glúteos.',
      'Eleve os ombros para cima e levemente para trás focando no trapézio médio e superior.'
    ]
  },
  {
    id: 'encolhimento-smith-machine',
    name: 'Encolhimento de Ombros no Smith Machine',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Trapézio'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Posicione a barra do Smith na altura das coxas.',
      'Execute o encolhimento estrito com estabilidade total.'
    ]
  },
  {
    id: 'manguito-rotador-polia-externa',
    name: 'Rotação Externa de Ombro na Polia (Manguito Rotador)',
    muscleGroup: 'Ombros',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 45,
    instructions: [
      'Ajuste a polia na altura do cotovelo a 90° colado ao corpo.',
      'Gire o antebraço para fora afastando da barriga.',
      'Fortalece os rotadores externos (infraespinhal e redondo menor).'
    ]
  }
];
