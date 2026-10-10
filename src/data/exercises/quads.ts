import { Exercise } from '../../types';

export const QUADS_EXERCISES: Exercise[] = [
  {
    id: 'agachamento-livre-barra',
    name: 'Agachamento Livre com Barra (Back Squat)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posteriores', 'Abdômen', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 180,
    instructions: [
      'Posicione a barra apoiada nos trapézios (high bar) ou deltóides posteriores (low bar).',
      'Pés na largura dos ombros com pontas ligeiramente apontadas para fora.',
      'Inspire, trave o abdômen e agache projetando o quadril para trás e joelhos para fora.',
      'Desça até as coxas ficarem no mínimo paralelas ao solo.',
      'Empurre o chão com os pés para subir com força explosiva.'
    ],
    tips: 'Nunca deixe os joelhos desabarem para dentro (valgo dinâmico).'
  },
  {
    id: 'agachamento-frontal-barra-front-squat',
    name: 'Agachamento Frontal com Barra (Front Squat)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Barra',
    defaultRestSeconds: 150,
    instructions: [
      'Apoie a barra sobre a clavícula e deltóides anteriores com cotovelos altos apontados para a frente.',
      'Mantenha o tronco estritamente vertical e agache profundo.',
      'Empurre o chão mantendo os cotovelos elevados durante toda a subida.'
    ],
    tips: 'Altíssima ativação isolada dos quadríceps com menor sobrecarga na lombar.'
  },
  {
    id: 'agachamento-smith-pes-a-frente',
    name: 'Agachamento no Smith Machine (Pés à Frente)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie a barra nos trapézios e posicione os pés cerca de 30-40cm à frente da barra.',
      'Agache com o tronco ereto permitindo foco total na extensão do joelho (quadríceps).',
      'Empurre a barra para cima.'
    ]
  },
  {
    id: 'agachamento-smith-tradicional',
    name: 'Agachamento Tradicional no Smith Machine',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posteriores'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Pés alinhados sob a barra na largura dos ombros.',
      'Destrave a barra e execute o agachamento guiado com segurança.'
    ]
  },
  {
    id: 'leg-press-45',
    name: 'Leg Press 45º (Padrão)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posteriores'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Sente-se no aparelho com a coluna e lombar totalmente apoiadas no encosto.',
      'Posicione os pés no meio da plataforma na largura dos ombros.',
      'Destrave a plataforma e desça até os joelhos formarem ângulo de 90°.',
      'Empurre a plataforma sem hiperestender ou travar bruscamente os joelhos no topo.'
    ],
    tips: 'Nunca deixe a lombar descolar do banco durante a descida (retroversão pélvica).'
  },
  {
    id: 'leg-press-45-pes-baixos',
    name: 'Leg Press 45º (Pés Baixos na Plataforma - Foco Quadríceps)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Panturrilhas'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione os pés na parte inferior da plataforma.',
      'Desça maximizando a flexão dos joelhos e dorsiflexão do tornozelo para sobrecarregar os vastos e reto femoral.'
    ]
  },
  {
    id: 'leg-press-45-pes-juntos',
    name: 'Leg Press 45º com Pés Juntos (Foco Vasto Lateral)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Coloque os pés unidos no centro da plataforma.',
      'Execute a flexão e extensão enfatizando a porção lateral das coxas.'
    ]
  },
  {
    id: 'leg-press-45-unilateral',
    name: 'Leg Press 45º Unilateral (Uma Perna)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie um pé no meio da plataforma e deixe a outra perna repousando fora.',
      'Desça o peso controlando o movimento com uma perna só e empurre até quase a extensão total.'
    ]
  },
  {
    id: 'leg-press-horizontal',
    name: 'Leg Press Horizontal / Sentado',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se com as costas apoiadas e empurre a plataforma na horizontal até estender as pernas.'
    ]
  },
  {
    id: 'leg-press-vertical',
    name: 'Leg Press Vertical (90°)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posteriores'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no aparelho sob a plataforma vertical com os pés apontados para cima.',
      'Desça a carga perpendicularmente ao tronco e empurre de volta.'
    ]
  },
  {
    id: 'hack-squat-maquina',
    name: 'Hack Squat na Máquina',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    defaultRestSeconds: 150,
    instructions: [
      'Posicione os ombros sob as almofadas e apoie a coluna no encosto.',
      'Pés na plataforma na largura dos ombros.',
      'Desça flexionando os joelhos em profundidade segura.',
      'Empurre com a sola dos pés para subir.'
    ],
    tips: 'Permite sobrecarregar o quadríceps com grande estabilidade e segurança.'
  },
  {
    id: 'hack-squat-reverso',
    name: 'Hack Squat Reverso na Máquina',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posteriores'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione-se de frente para o encosto da máquina Hack apoiando os ombros nas almofadas.',
      'Agache empurrando o quadril para trás e suba estendendo as pernas.'
    ]
  },
  {
    id: 'cadeira-extensora',
    name: 'Cadeira Extensora (Bilateral)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste o encosto para que a dobra do joelho fique alinhada com o eixo da máquina.',
      'Apoie a almofada na parte inferior das canelas, logo acima dos tornozelos.',
      'Estenda os joelhos até a contração máxima do quadríceps.',
      'Segure por 1 segundo no topo e desça controlando o peso.'
    ],
    tips: 'Excelente exercício de isolamento para hipertrofia do reto femoral e vastos.'
  },
  {
    id: 'cadeira-extensora-unilateral',
    name: 'Cadeira Extensora Unilateral',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Execute a extensão com uma perna por vez.',
      'Ideal para corrigir desequilíbrios de força e definição muscular entre as pernas.'
    ]
  },
  {
    id: 'cadeira-extensora-isometria-topo',
    name: 'Cadeira Extensora com Pausa Isométrica (3s no Topo)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Estenda as pernas e segure a contração estática por 3 segundos antes de descer lentamente.'
    ]
  },
  {
    id: 'agachamento-bulgaro-halteres',
    name: 'Agachamento Búlgaro com Halteres (Bulgarian Split Squat)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posteriores'],
    equipment: 'Halteres',
    defaultRestSeconds: 120,
    instructions: [
      'Fique em pé de costas para um banco e apoie a ponta de um pé no banco.',
      'Dê um passo à frente com a outra perna segurando um haltere em cada mão.',
      'Agache flexionando o joelho da frente até que a coxa fique paralela ao chão.',
      'Empurre o calcanhar da perna da frente para retornar.'
    ],
    tips: 'Mantenha o tronco ereto para foco no quadríceps ou incline levemente à frente para maior foco no glúteo.'
  },
  {
    id: 'agachamento-bulgaro-smith',
    name: 'Agachamento Búlgaro no Smith Machine',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie a barra do Smith nos ombros com o pé de trás elevado no banco.',
      'Execute o agachamento unilateral com a estabilidade guiada da máquina.'
    ]
  },
  {
    id: 'agachamento-bulgaro-com-barra',
    name: 'Agachamento Búlgaro com Barra Livre',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie a barra nos trapézios e o pé de trás no banco.',
      'Agache com equilíbrio e controle postural rígido.'
    ]
  },
  {
    id: 'passada-afundo-caminhando-halteres',
    name: 'Passada Caminhando com Halteres (Walking Lunges)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Posteriores'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Dê um passo largo à frente e desça o joelho de trás até quase encostar no chão.',
      'Empurre com a perna da frente e passe a perna de trás dando o próximo passo contínuo.',
      'Mantenha o peito aberto e tronco firme.'
    ]
  },
  {
    id: 'passada-afundo-barra',
    name: 'Passada Caminhando com Barra nos Ombros',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Com a barra sobre os trapézios, caminhe realizando passadas profundas controladas.'
    ]
  },
  {
    id: 'afundo-estatico-halteres',
    name: 'Afundo Estático no Lugar com Halteres (Lunge)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Com uma perna à frente e outra atrás, desça e suba no mesmo lugar repetidamente antes de trocar de perna.'
    ]
  },
  {
    id: 'afundo-reverso-halteres',
    name: 'Afundo Reverso com Halteres (Reverse Lunge)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Em pé, dê um passo para trás descendo o joelho.',
      'Empurre a perna da frente para voltar à posição inicial em pé.',
      'Muito mais suave para as articulações patelares do joelho.'
    ]
  },
  {
    id: 'afundo-no-smith',
    name: 'Afundo no Smith Machine',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Posicione-se em passada fixa sob a barra do Smith e execute as repetições.'
    ]
  },
  {
    id: 'agachamento-goblet-halter-kettlebell',
    name: 'Agachamento Goblet com Halter / Kettlebell',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Segure um haltere verticalmente junto ao peito com as duas mãos.',
      'Pés na largura dos ombros com pontas para fora.',
      'Agache profundo entre os joelhos mantendo o peito ereto.',
      'Empurre o chão para subir.'
    ]
  },
  {
    id: 'agachamento-sissy-squat-peso-corporal',
    name: 'Agachamento Sissy (Sissy Squat Peso Corporal)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 90,
    instructions: [
      'Segure em um suporte com uma mão.',
      'Fique na ponta dos pés, incline o tronco para trás em linha reta enquanto projeta os joelhos à frente.',
      'Desça até sentir alongamento absurdo nos quadríceps e empurre de volta.'
    ],
    tips: 'Isola o reto femoral em posição totalmente estendida.'
  },
  {
    id: 'agachamento-sissy-no-suporte-banco',
    name: 'Agachamento Sissy no Banco Especial (Sissy Machine)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Trave os pés e panturrilhas nas almofadas do banco Sissy.',
      'Agache flexionando os joelhos para trás com o tronco ereto e suba contraindo as coxas.'
    ]
  },
  {
    id: 'step-up-subida-no-banco-halteres',
    name: 'Subida no Banco com Halteres (Step-up)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie um pé no topo de uma caixa ou banco resistente.',
      'Empurre exclusivamente com a perna de cima para elevar o corpo até ficar em pé no banco.',
      'Desça de forma lenta e controlada.'
    ]
  },
  {
    id: 'step-up-com-barra',
    name: 'Subida no Banco com Barra (Step-up)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Com a barra nos trapézios, execute as subidas alternadas no banco com controle postural.'
    ]
  },
  {
    id: 'agachamento-zercher-barra',
    name: 'Agachamento Zercher (Barra na Dobra dos Braços)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Abdômen', 'Bíceps', 'Trapézio'],
    equipment: 'Barra',
    defaultRestSeconds: 150,
    instructions: [
      'Segure a barra apoiada nas dobras dos cotovelos com as mãos entrelaçadas junto ao peito.',
      'Agache profundo mantendo o tronco ereto e suba com força.',
      'Construtor brutal de força no quadríceps e rigidez de core.'
    ]
  },
  {
    id: 'agachamento-sumo-com-halter-step',
    name: 'Agachamento Sumô no Step com Halter Pesado',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Fique sobre dois steps com pés bem afastados e pontas viradas para fora a 45°.',
      'Segure um haltere pesado pendurado entre os pés.',
      'Agache profundo permitindo que o haltere desça abaixo da linha dos steps.'
    ]
  },
  {
    id: 'agachamento-pistol-squat-solo',
    name: 'Pistol Squat (Agachamento Unilateral Livre)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 90,
    instructions: [
      'Equilibre-se em uma perna com a outra estendida para a frente.',
      'Agache completamente em uma perna até a coxa encostar na panturrilha.',
      'Empurre o calcanhar com força para levantar.'
    ]
  },
  {
    id: 'agachamento-com-salto-jump-squat',
    name: 'Agachamento com Salto (Jump Squat)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Panturrilhas', 'Glúteos'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Agache a 90° e salte verticalmente com potência máxima.',
      'Aterrisse suavemente amortecendo a queda e emende a próxima repetição.'
    ]
  },
  {
    id: 'agachamento-parede-wall-sit-isometrico',
    name: 'Agachamento Isométrico na Parede (Wall Sit)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    isIsometric: true,
    instructions: [
      'Apoie as costas na parede com as coxas a 90° paralelas ao chão.',
      'Mantenha a posição estática por 45 a 90 segundos respirando normalmente.',
      'Gera grande fadiga metabólica e queimação nos quadríceps.'
    ]
  },
  {
    id: 'extensao-de-pernas-com-elastico-band',
    name: 'Extensão de Joelho com Elástico (Terminal Knee Extension - TKE)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: [],
    equipment: 'Outro',
    defaultRestSeconds: 45,
    instructions: [
      'Prenda o elástico na altura do joelho atrás da perna.',
      'Estenda o joelho contra a resistência do elástico contraindo o vasto medial (VMO).'
    ]
  },
  {
    id: 'agachamento-com-pes-elevados-calcanhar-cunha',
    name: 'Agachamento com Calcanhares Elevados (Squat Wedge / Anilha)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie os calcanhares em anilhas pequenas ou cunha de agachamento.',
      'A elevação do calcanhar permite maior flexão de joelho e isola dramaticamente os quadríceps.'
    ]
  },
  {
    id: 'cossack-squat-agachamento-cossaco',
    name: 'Agachamento Cossaco (Cossack Squat)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Pés bem afastados. Agache para um dos lados enquanto estende completamente a perna oposta com calcanhar no chão.',
      'Trabalha força unilateral, mobilidade de quadril e adutores.'
    ]
  }
];
