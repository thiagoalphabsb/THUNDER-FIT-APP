import { Exercise } from '../../types';

export const ABS_EXERCISES: Exercise[] = [
  {
    id: 'abdominal-supra-solo',
    name: 'Abdominal Supra no Solo',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite-se de costas com joelhos flexionados e pés apoiados no chão.',
      'Mãos atrás da cabeça ou cruzadas no peito.',
      'Enrole o tronco para a frente tirando as escápulas do chão.',
      'Expire todo o ar no topo contraindo o abdômen e retorne lentamente.'
    ],
    tips: 'Pense em aproximar as costelas do quadril, e não apenas levantar o pescoço.'
  },
  {
    id: 'abdominal-supra-banco-declinado',
    name: 'Abdominal no Banco Declinado (Decline Crunch)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Trave as pernas no topo do banco declinado.',
      'Deite-se e flexione o tronco enrolando o abdômen contra a gravidade ampliada.',
      'Pode segurar uma anilha no peito para progressão de carga.'
    ]
  },
  {
    id: 'abdominal-supra-com-anilha-no-peito',
    name: 'Abdominal Supra com Carga (Anilha no Peito)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Segure uma anilha de 5kg a 20kg contra o peito e execute o crunch estrito.'
    ]
  },
  {
    id: 'abdominal-corda-polia',
    name: 'Abdominal na Polia Alta com Corda (Cable Crunch)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Ajoelhe-se de frente para a polia alta segurando as pontas da corda junto à cabeça.',
      'Flexione a coluna arredondando as costas e trazendo os cotovelos em direção aos joelhos.',
      'Mantenha o quadril fixo e flexione apenas a coluna abdominal.',
      'Retorne controlando o peso.'
    ],
    tips: 'Permite sobrecarga progressiva ideal para hipertrofia dos gomos abdominais.'
  },
  {
    id: 'abdominal-polia-em-pe-standing-cable-crunch',
    name: 'Abdominal na Polia em Pé (Standing Cable Crunch)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Fique em pé de costas para a polia alta segurando a corda nos ombros.',
      'Enrole o tronco para a frente levando as costelas em direção à bacia.'
    ]
  },
  {
    id: 'elevacao-pernas-barra',
    name: 'Elevação de Pernas Suspenso na Barra (Hanging Leg Raise)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 90,
    instructions: [
      'Segure-se na barra fixa com os braços estendidos e corpo suspenso.',
      'Eleve as pernas retas ou joelhos flexionados em direção ao peito.',
      'Curve o quadril para cima no final do movimento para contrair o reto abdominal inferior.',
      'Desça lentamente sem balançar o corpo.'
    ],
    tips: 'Evite usar o impulso de pêndulo.'
  },
  {
    id: 'elevacao-pernas-capitao-paralela',
    name: 'Elevação de Pernas na Cadeira do Capitão (Paralela Abdominal)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie os antebraços nas almofadas da cadeira do capitão e costas no encosto.',
      'Eleve os joelhos ou pernas estendidas até a altura do abdômen, arredondando a pelve para cima.'
    ]
  },
  {
    id: 'elevacao-pernas-solo-infra-leg-raise',
    name: 'Abdominal Infra no Solo (Leg Raise no Chão)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite de costas no chão com as mãos sob os glúteos para suporte lombar.',
      'Eleve as pernas retas até 90° e desça controladamente até quase tocarem o chão sem arquear a lombar.'
    ]
  },
  {
    id: 'elevacao-pernas-banco-inclinado',
    name: 'Abdominal Infra no Banco Inclinado (Incline Leg Raise)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite-se com a cabeça no topo do banco inclinado segurando no apoio superior.',
      'Eleve as pernas e a bacia do banco para cima na vertical.'
    ]
  },
  {
    id: 'abdominal-remador-militar-situp',
    name: 'Abdominal Remador Militar (Sit-up Completo)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Quadríceps'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite totalmente estendido no chão com braços acima da cabeça.',
      'Suba o tronco completamente enquanto abraça os joelhos flexionados junto ao peito.',
      'Retorne estendendo o corpo todo.'
    ]
  },
  {
    id: 'abdominal-canivete-v-ups',
    name: 'Abdominal Canivete no Solo (V-Ups)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite de costas estendido.',
      'Eleve simultaneamente o tronco e as pernas estendidas tocando as mãos nas pontas dos pés no topo em formato de "V".'
    ]
  },
  {
    id: 'prancha-isometrica',
    name: 'Prancha Isométrica Frontal (Plank)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros', 'Glúteos'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    isIsometric: true,
    instructions: [
      'Apoie os antebraços e as pontas dos pés no chão.',
      'Mantenha o corpo em linha reta dos calcanhares à cabeça.',
      'Contraia fortemente o abdômen, glúteos e quadríceps.',
      'Mantenha a posição respirando de forma controlada por 30 a 90 segundos.'
    ],
    tips: 'Não deixe o quadril cair ou empinar para cima.'
  },
  {
    id: 'prancha-lateral-solo-side-plank',
    name: 'Prancha Lateral no Solo (Side Plank)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros', 'Glúteos'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    isIsometric: true,
    instructions: [
      'Apoie um antebraço no chão e fique de lado com os pés empilhados.',
      'Eleve a bacia formando uma linha reta e sustente a posição contraindo os oblíquos.'
    ]
  },
  {
    id: 'prancha-com-toque-no-ombro-shoulder-taps',
    name: 'Prancha com Toque no Ombro (Plank Shoulder Taps)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Em posição de prancha alta (mãos no chão), tire uma mão e toque o ombro oposto sem girar o quadril.',
      'Alterne os lados mantendo o core estabilizado anti-rotacional.'
    ]
  },
  {
    id: 'prancha-dinamica-sobe-desce-commandos',
    name: 'Prancha Dinâmica Sobe e Desce (Commandos)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Alterne da prancha baixa de antebraços para a prancha alta de mãos e retorne de forma contínua.'
    ]
  },
  {
    id: 'roda-abdominal-de-joelhos-ab-wheel',
    name: 'Roda Abdominal de Joelhos (Ab Wheel Rollout)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Costas', 'Ombros', 'Tríceps'],
    equipment: 'Outro',
    defaultRestSeconds: 90,
    instructions: [
      'Ajoelhe-se no colchonete segurando as manoplas da rodinha.',
      'Role a roda para a frente estendendo o corpo o mais longe possível mantendo a coluna em leve flexão (sem arquear a lombar).',
      'Puxe a rodinha de volta contraindo o abdômen com força total.'
    ],
    tips: 'Um dos exercícios de maior ativação eletromiográfica do reto abdominal.'
  },
  {
    id: 'roda-abdominal-em-pe-ab-wheel-standing',
    name: 'Roda Abdominal em Pé (Standing Ab Wheel Rollout)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Costas', 'Ombros'],
    equipment: 'Outro',
    defaultRestSeconds: 120,
    instructions: [
      'Em pé, curve-se e apoie a roda no chão.',
      'Role até ficar completamente estendido no chão e puxe de volta até os pés.'
    ]
  },
  {
    id: 'abdominal-bicicleta-solo-bicycle-crunch',
    name: 'Abdominal Bicicleta no Solo (Bicycle Crunch)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite no chão e coloque as mãos atrás da cabeça.',
      'Pedale com as pernas trazendo o cotovelo direito em direção ao joelho esquerdo e vice-versa, girando o tronco com fluidez.'
    ]
  },
  {
    id: 'russian-twist-giro-russo-solo',
    name: 'Russian Twist no Solo (Giro Russo)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Sente-se no chão com joelhos dobrados e pés suspensos.',
      'Incline o tronco para trás a 45° e gire o tronco de um lado para o outro tocando o chão em cada lado.'
    ]
  },
  {
    id: 'russian-twist-com-anilha-ou-halter',
    name: 'Russian Twist com Anilha / Halter',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Segure um peso com as duas mãos e gire de um lado para o outro contraindo os oblíquos.'
    ]
  },
  {
    id: 'woodchopper-lenhador-polia-alta-para-baixa',
    name: 'Lenhador na Polia Alta para Baixa (High-to-Low Cable Woodchopper)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a manopla da polia alta com ambas as mãos de lado para o aparelho.',
      'Gire o tronco puxando o cabo na diagonal para baixo em direção ao quadril oposto.',
      'Retorne com controle.'
    ]
  },
  {
    id: 'woodchopper-lenhador-polia-baixa-para-alta',
    name: 'Lenhador na Polia Baixa para Alta (Low-to-High Cable Woodchopper)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a manopla da polia baixa e gire o tronco na diagonal para cima com rotação de core.'
    ]
  },
  {
    id: 'pallof-press-polia-anti-rotacional',
    name: 'Pallof Press na Polia (Anti-Rotação de Core)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Fique em pé de lado para a polia na altura do peito segurando a manopla junto ao esterno.',
      'Estenda os braços à frente do corpo resistindo à rotação do cabo.',
      'Sustente por 2 segundos e retorne ao peito.',
      'Excelente para força funcional do core e estabilização lombar.'
    ]
  },
  {
    id: 'pallof-press-com-elastico-band',
    name: 'Pallof Press com Elástico / Superband',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 45,
    instructions: [
      'Prenda o elástico em um pilar e execute a extensão dos braços sustentando a tensão isométrica lateral.'
    ]
  },
  {
    id: 'dragon-flag-banco-plano-bruce-lee',
    name: 'Dragon Flag no Banco Plano (Estilo Bruce Lee)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Costas', 'Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco segurando firmemente na borda atrás da cabeça.',
      'Eleve o corpo inteiro em linha reta apoiando apenas as escápulas superiores.',
      'Desça o corpo reto lentamente sem dobrar o quadril até quase tocar o banco e suba novamente.',
      'O teste definitivo de força abdominal pura.'
    ]
  },
  {
    id: 'abdominal-na-bola-suica-swiss-ball-crunch',
    name: 'Abdominal na Bola Suíça (Swiss Ball Crunch)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie a lombar e meio das costas na curvatura da bola suíça.',
      'Alongue o abdômen sobre a bola e flexione o tronco para a frente.',
      'Proporciona maior amplitude de alongamento que o chão plano.'
    ]
  },
  {
    id: 'abdominal-escalador-mountain-climbers',
    name: 'Abdominal Escalador no Solo (Mountain Climbers)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros', 'Quadríceps'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Em prancha alta, puxe alternadamente os joelhos em direção ao peito em ritmo acelerado e constante.'
    ]
  },
  {
    id: 'stomach-vacuum-vacuo-abdominal',
    name: 'Stomach Vacuum (Vácuo Abdominal / Transverso)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Em pé ou de quatro apoios, expire todo o ar dos pulmões.',
      'Sem respirar, chupe a barriga para dentro e para cima o máximo possível, colando o umbigo na coluna.',
      'Sustente a contração do transverso abdominal por 15 a 30 segundos antes de relaxar.',
      'Afina a cintura e melhora a postura visceral.'
    ]
  },
  {
    id: 'inclinacao-lateral-tronco-halteres-obliquos',
    name: 'Flexão Lateral de Tronco com Halter (Oblíquos)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 45,
    instructions: [
      'Segure um haltere em apenas uma mão ao lado do corpo.',
      'Incline o tronco para o lado do haltere e volte ereto puxando com o oblíquo oposto.'
    ]
  },
  {
    id: 'hiperextensao-lateral-banco-romano-obliquos',
    name: 'Flexão Lateral no Banco Romano (Oblíquos)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Posicione-se de lado no banco romano com o quadril apoiado.',
      'Desça o tronco lateralmente e suba flexionando a cintura lateral.'
    ]
  },
  {
    id: 'abdominal-parafuso-windshield-wipers-barra',
    name: 'Windshield Wipers Suspenso na Barra (Limpador de Pára-brisa)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Antebraço', 'Costas'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 90,
    instructions: [
      'Pendure-se na barra e eleve as pernas retas até a barra em posição invertida.',
      'Gire as pernas unidas para o lado direito e depois para o esquerdo em arco contínuo.'
    ]
  },
  {
    id: 'abdominal-tesoura-solo-flutter-kicks',
    name: 'Abdominal Tesoura no Solo (Flutter Kicks)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Deite de costas e eleve as pernas cerca de 15cm do chão.',
      'Faça movimentos rápidos de tesoura para cima e para baixo mantendo o abdômen travado.'
    ]
  },
  {
    id: 'abdominal-maquina-crunch-machine',
    name: 'Abdominal na Máquina (Ab Crunch Machine)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Sente-se na máquina com as manoplas seguras e pés travados.',
      'Flexione o tronco para a frente empurrando a carga com os músculos abdominais.'
    ]
  },
  {
    id: 'abdominal-sit-up-com-bola-medicinal-wall-ball',
    name: 'Sit-up com Lançamento de Medicine Ball',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Ombros'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Deite de costas segurando uma medicine ball.',
      'Suba o tronco explosivamente e lance a bola na parede ou para um parceiro, pegue de volta e deite.'
    ]
  },
  {
    id: 'hollow-body-hold-canoa-isometrica',
    name: 'Hollow Body Hold (Posição da Canoa Isométrica da Ginástica)',
    muscleGroup: 'Abdômen',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    isIsometric: true,
    instructions: [
      'Deite no chão e pressione 100% da lombar contra o solo.',
      'Eleve braços estendidos atrás da cabeça e pernas estendidas à frente formando uma curva de canoa.',
      'Sustente a posição estática por 30 a 60 segundos com tensão total no core.'
    ]
  }
];
