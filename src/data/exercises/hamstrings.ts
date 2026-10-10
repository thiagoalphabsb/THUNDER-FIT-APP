import { Exercise } from '../../types';

export const HAMSTRING_EXERCISES: Exercise[] = [
  {
    id: 'mesa-flexora',
    name: 'Mesa Flexora Deitada',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Panturrilhas'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se de bruços no aparelho com a almofada posicionada logo abaixo das panturrilhas.',
      'Segure as manoplas para estabilizar o tronco e manter o quadril colado ao banco.',
      'Flexione os joelhos puxando os calcanhares em direção aos glúteos.',
      'Retorne de forma controlada até estender quase totalmente as pernas.'
    ],
    tips: 'Não levante o quadril da almofada durante a contração máxima.'
  },
  {
    id: 'mesa-flexora-unilateral',
    name: 'Mesa Flexora Unilateral',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Panturrilhas'],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Deite-se no aparelho e flexione uma perna de cada vez.',
      'Ideal para identificar e corrigir assimetrias de força nos isquiotibiais.'
    ]
  },
  {
    id: 'cadeira-flexora',
    name: 'Cadeira Flexora Sentada',
    muscleGroup: 'Posteriores',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se no aparelho e ajuste a trava superior bem firme sobre as coxas.',
      'Apoie a parte de trás dos tornozelos na almofada inferior.',
      'Flexione os joelhos puxando a almofada para baixo e para trás.',
      'Retorne resistindo ao movimento e sentindo o alongamento.'
    ],
    tips: 'Na posição sentada, o quadril fica flexionado a 90°, alongando a origem dos isquiotibiais e maximizando o estiramento para hipertrofia.'
  },
  {
    id: 'cadeira-flexora-unilateral',
    name: 'Cadeira Flexora Unilateral',
    muscleGroup: 'Posteriores',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Execute a flexão sentada de forma unilateral com foco em cada perna isoladamente.'
    ]
  },
  {
    id: 'flexora-em-pe-maquina',
    name: 'Flexora em Pé na Máquina',
    muscleGroup: 'Posteriores',
    secondaryMuscles: [],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie a coxa na almofada e o tornozelo sob o rolo.',
      'Flexione o joelho elevando o calcanhar em direção ao glúteo.',
      'Desça de forma suave sem encostar os pesos na pilha.'
    ]
  },
  {
    id: 'flexora-na-polia-com-tornozeleira',
    name: 'Flexão de Joelho na Polia Baixa com Tornozeleira',
    muscleGroup: 'Posteriores',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Prenda a tornozeleira na polia baixa e fique em pé de frente para o aparelho.',
      'Flexione o joelho puxando o calcanhar para trás contra a tensão contínua do cabo.'
    ]
  },
  {
    id: 'stiff-barra',
    name: 'Stiff com Barra (Pernas Semiestendidas)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar', 'Trapézio'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Em pé, segure a barra na largura dos ombros com joelhos levemente destravados e fixos.',
      'Projete o quadril para trás mantendo a coluna totalmente neutra e peito estufado.',
      'Desça a barra rente às pernas até sentir forte alongamento nos posteriores.',
      'Contraia os glúteos e posteriores para retornar à posição ereta.'
    ],
    tips: 'O movimento é puramente uma dobradiça de quadril (hip hinge), não agachamento nem flexão de coluna.'
  },
  {
    id: 'stiff-halteres',
    name: 'Stiff com Halteres',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Segure um haltere em cada mão à frente das coxas.',
      'Incline o tronco empurrando o quadril para trás até sentir o alongamento máximo dos isquiotibiais.',
      'Suba contraindo glúteos e posteriores.'
    ]
  },
  {
    id: 'stiff-smith-machine',
    name: 'Stiff no Smith Machine',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Fique em pé sob a barra do Smith e execute o Stiff com a barra descendo na linha vertical guiada.'
    ]
  },
  {
    id: 'stiff-unilateral-halteres-single-leg-rdl',
    name: 'Stiff Unilateral com Halter (Single-Leg RDL)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Equilibre-se em uma perna segurando um haltere na mão oposta.',
      'Incline o tronco para a frente enquanto eleva a perna livre estendida para trás em linha reta.',
      'Desça até o tronco ficar paralelo ao chão e retorne com controle.',
      'Desenvolve estabilidade do tornozelo, quadril e hipertrofia unilateral dos posteriores.'
    ]
  },
  {
    id: 'levantamento-terra-romeno-rdl-barra',
    name: 'Levantamento Terra Romeno com Barra (RDL)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar', 'Costas'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Inicie em pé com a barra nas mãos.',
      'Flexione levemente os joelhos e empurre o quadril para trás mantendo a barra colada nas coxas.',
      'Desça até abaixo da linha dos joelhos (meia canela) e inverta o movimento com força explosiva de quadril.'
    ]
  },
  {
    id: 'rdl-com-halteres-romeno',
    name: 'RDL com Halteres (Romanian Deadlift)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Mantenha os halteres colados nas laterais das pernas ao descer o quadril para trás.'
    ]
  },
  {
    id: 'flexao-nordica-nordic-hamstring-curl',
    name: 'Flexão Nórdica no Solo (Nordic Hamstring Curl)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Panturrilhas'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 120,
    instructions: [
      'Ajoelhe-se com os tornozelos firmemente travados por um parceiro ou sob um suporte acolchoado.',
      'Com o corpo reto do joelho à cabeça, incline o corpo para a frente resistindo à gravidade apenas com os isquiotibiais.',
      'Apoie as mãos no chão no final e empurre suavemente para ajudar a subir.',
      'O exercício número um do mundo para prevenção de estiramentos e força excêntrica.'
    ],
    tips: 'Foque em frear a descida o máximo de segundos possível.'
  },
  {
    id: 'glute-ham-raise-ghr-maquina',
    name: 'Glute-Ham Raise na Máquina (GHR)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Panturrilhas', 'Lombar'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie os joelhos na almofada semicircular e trave os calcanhares na plataforma.',
      'Desça o tronco até a linha horizontal e puxe o corpo de volta flexionando os joelhos e contraindo posteriores e glúteos.'
    ]
  },
  {
    id: 'flexao-de-pernas-com-bola-suica-swiss-ball-leg-curl',
    name: 'Flexão de Pernas com Bola Suíça (Swiss Ball Curl)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Deite de costas no chão com os calcanhares apoiados sobre a bola suíça.',
      'Eleve o quadril em ponte e puxe a bola em direção aos glúteos flexionando os joelhos.',
      'Estenda as pernas de volta mantendo o quadril sempre alto.'
    ]
  },
  {
    id: 'flexao-de-pernas-no-trx-fita-suspensao',
    name: 'Flexão de Joelhos no TRX (TRX Hamstring Curl)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Abdômen'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Encaixe os calcanhares nas alças do TRX e eleve a bacia em ponte.',
      'Puxe os calcanhares em direção aos glúteos e retorne controlando a instabilidade.'
    ]
  },
  {
    id: 'flexora-com-halter-entre-os-pes-no-banco',
    name: 'Flexora Deitada com Halter Entre os Pés',
    muscleGroup: 'Posteriores',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Deite-se de bruços no banco plano segurando um haltere preso verticalmente entre as solas dos pés.',
      'Flexione os joelhos erguendo o haltere em direção aos glúteos e desça com cuidado.'
    ]
  },
  {
    id: 'hiperextensao-45-enfase-posteriores',
    name: 'Hiperextensão 45° no Banco com Foco em Posteriores',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Ajuste o apoio do banco romano logo abaixo da crista ilíaca.',
      'Arredonde ligeiramente a parte superior das costas para neutralizar eretores e flexione o quadril subindo com contração dos isquiotibiais.'
    ]
  },
  {
    id: 'good-morning-barra-joelhos-flexionados',
    name: 'Good Morning com Joelhos Semi-Flexionados (Isquiotibiais)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Barra nos trapézios, empurre o quadril bem para trás até sentir o limite elástico dos posteriores da coxa.'
    ]
  },
  {
    id: 'good-morning-no-smith-machine',
    name: 'Good Morning no Smith Machine',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Incline o tronco sob a barra guiada do Smith sentindo os posteriores sustentarem a carga excêntrica.'
    ]
  },
  {
    id: 'kettlebell-swing-balanco-kettlebell',
    name: 'Kettlebell Swing (Balanço com Kettlebell)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Costas', 'Abdômen'],
    equipment: 'Kettlebell',
    defaultRestSeconds: 60,
    instructions: [
      'Fique em pé com pés afastados segurando o kettlebell com ambas as mãos.',
      'Empurre o quadril para trás flexionando levemente os joelhos e lance o kettlebell para a frente até a altura do peito com extensão explosiva do quadril.',
      'Use a força da bacia e dos posteriores, nunca dos braços.'
    ]
  },
  {
    id: 'stiff-com-elastico-superband',
    name: 'Stiff com Elástico Superband',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Outro',
    defaultRestSeconds: 45,
    instructions: [
      'Pise no elástico e segure as extremidades com as mãos.',
      'Incline o tronco e estenda o quadril contra a resistência progressiva do elástico.'
    ]
  },
  {
    id: 'slide-board-hamstring-curls',
    name: 'Flexão de Posteriores no Slider / Flanela (Slide Curls)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Deite de costas no chão liso com os calcanhares apoiados sobre discos deslizantes ou toalha.',
      'Suba o quadril e deslize os calcanhares puxando em direção aos glúteos.'
    ]
  },
  {
    id: 'ponte-de-posteriores-unilateral-solo',
    name: 'Ponte de Posteriores Unilateral com Perna Estendida',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Deite no chão e apoie apenas o calcanhar de uma perna mais distante do quadril (~120° de joelho).',
      'Eleve o quadril focando a contração exclusivamente nos isquiotibiais da perna de apoio.'
    ]
  },
  {
    id: 'b-stance-rdl-halteres',
    name: 'B-Stance RDL com Halteres (Stiff com Pé de Apoio Escalonado)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Coloque uma perna à frente como foco principal e apoie apenas a ponta do pé de trás como suporte de equilíbrio.',
      'Execute o RDL mantendo 90% do peso corporal na perna frontal.',
      'Combina os benefícios do exercício unilateral com a estabilidade de dois pés no solo.'
    ]
  },
  {
    id: 'b-stance-rdl-barra',
    name: 'B-Stance RDL com Barra',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a barra com postura escalonada (B-Stance) e execute a dobradiça de quadril profunda.'
    ]
  },
  {
    id: 'landmine-single-leg-rdl',
    name: 'Stiff Unilateral na Barra Landmine',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos'],
    equipment: 'Barra',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a extremidade da barra landmine e execute o RDL unilateral com trajetória em arco fixo.'
    ]
  },
  {
    id: 'cabo-pull-through-polia-baixa',
    name: 'Cable Pull-Through na Polia Baixa com Corda',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Fique de costas para a polia baixa segurando a corda por entre as pernas.',
      'Dê dois passos à frente, incline o tronco para trás e estenda o quadril explosivamente à frente.'
    ]
  },
  {
    id: 'flexao-nordica-reversa-reverse-nordic',
    name: 'Flexão Nórdica Reversa (Reverse Nordic)',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Quadríceps'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Ajoelhe-se no solo com corpo ereto e incline-se para trás a partir dos joelhos com controle total.'
    ]
  },
  {
    id: 'stiff-com-halteres-pe-elevado-anilha',
    name: 'Stiff com Halteres e Ponta dos Pés Elevadas em Anilha',
    muscleGroup: 'Posteriores',
    secondaryMuscles: ['Glúteos', 'Panturrilhas'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie a parte anterior dos pés sobre uma anilha (dorsiflexão forçada) e execute o Stiff para estiramento fascial ampliado de toda a cadeia posterior.'
    ]
  }
];
