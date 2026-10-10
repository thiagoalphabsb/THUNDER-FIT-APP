import { Exercise } from '../../types';

export const TRICEPS_EXERCISES: Exercise[] = [
  {
    id: 'triceps-pulley-corda',
    name: 'Tríceps Corda no Pulley',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Prenda a corda na polia alta e segure com pegada neutra.',
      'Mantenha os cotovelos fixos ao lado do corpo e tronco levemente inclinado.',
      'Empurre a corda para baixo estendendo os braços e abrindo a corda no final.',
      'Retorne até formar um ângulo de 90° nos cotovelos.'
    ],
    tips: 'Abra as pontas da corda na parte inferior para ativar intensamente a cabeça lateral.'
  },
  {
    id: 'triceps-pulley-barra-reta',
    name: 'Tríceps Pulley com Barra Reta (Pegada Pronada)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a barra com pegada pronada na largura dos ombros.',
      'Empurre a barra para baixo estendendo os cotovelos até travar.',
      'Suba com controle até a linha do peito mantendo os cotovelos fixos.'
    ]
  },
  {
    id: 'triceps-pulley-barra-v',
    name: 'Tríceps Pulley com Barra V',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a barra V com pegada semi-pronada.',
      'Empurre para baixo mantendo estabilidade nos punhos e cotovelos.'
    ]
  },
  {
    id: 'triceps-pulley-supinado-barra-invertida',
    name: 'Tríceps Pulley com Pegada Invertida (Supinada)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a barra reta com palmas viradas para cima (pegada supinada).',
      'Empurre a barra para baixo focando na cabeça medial do tríceps.'
    ]
  },
  {
    id: 'triceps-pulley-unilateral-polia',
    name: 'Tríceps Pulley Unilateral na Polia (Pegada Pronada)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a manopla com uma mão e empurre até a extensão total.',
      'Excelente para corrigir assimetrias de força e volume entre os braços.'
    ]
  },
  {
    id: 'triceps-pulley-unilateral-sem-manopla',
    name: 'Tríceps Katana Unilateral no Cabo (Sem Manopla)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure na bolinha de borracha do cabo com a polia na altura do ombro/cabeça.',
      'Estenda o braço na diagonal acompanhando a linha natural das fibras do tríceps.'
    ]
  },
  {
    id: 'triceps-katana-extension-dupla-polia',
    name: 'Katana Extension Dupla na Polia (Overhead Cable Extension)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste duas polias na altura do pescoço cruzando os cabos atrás da cabeça.',
      'Segure os cabos opostos e estenda ambos os braços para cima e para fora.',
      'Proporciona alinhamento biomecânico e alongamento superior da cabeça longa.'
    ]
  },
  {
    id: 'triceps-testa-barra-w',
    name: 'Tríceps Testa com Barra W (Skull Crusher)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no banco plano segurando a barra W com pegada pronada estreita.',
      'Inicie com os braços apontados para cima ligeiramente inclinados para trás (~75°).',
      'Flexione apenas os cotovelos descendo a barra até a testa ou ligeiramente atrás da cabeça.',
      'Estenda os cotovelos retornando à posição inicial.'
    ],
    tips: 'Manter os braços ligeiramente inclinados para trás mantém a tensão mecânica constante no topo.'
  },
  {
    id: 'triceps-testa-barra-reta',
    name: 'Tríceps Testa com Barra Reta',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite no banco e flexione os cotovelos descendo a barra reta até a testa com cotovelos fechados.'
    ]
  },
  {
    id: 'triceps-testa-halteres',
    name: 'Tríceps Testa com Halteres (Banco Plano)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco com pegada neutra nos halteres.',
      'Flexione os cotovelos descendo os halteres ao lado das orelhas.',
      'Estenda os braços para cima contraindo os tríceps.'
    ]
  },
  {
    id: 'triceps-testa-banco-declinado',
    name: 'Tríceps Testa no Banco Declinado (Barra W)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco declinado e execute o tríceps testa.',
      'O ângulo declinado aumenta a amplitude de movimento e tensão na cabeça longa.'
    ]
  },
  {
    id: 'triceps-testa-banco-inclinado',
    name: 'Tríceps Testa no Banco Inclinado com Barra W',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco a 30° de inclinação e desça a barra por trás da cabeça.',
      'Intensifica o alongamento da cabeça longa do tríceps.'
    ]
  },
  {
    id: 'triceps-testa-polia-baixa-barra',
    name: 'Tríceps Testa na Polia Baixa com Barra Reta / W',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco posicionado com a cabeça virada para a polia baixa.',
      'Puxe a barra da polia e execute o tríceps testa com resistência contínua dos cabos.'
    ]
  },
  {
    id: 'triceps-testa-no-chao-floor-skull-crusher',
    name: 'Tríceps Testa no Solo com Halteres',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Deite no chão com joelhos dobrados e halteres acima dos ombros.',
      'Desça os halteres ao lado da cabeça até quase tocarem o chão e estenda com força.'
    ]
  },
  {
    id: 'triceps-frances-halteres',
    name: 'Tríceps Francês com Halter (Duas Mãos)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se com o tronco ereto e segure um haltere com as duas mãos acima da cabeça.',
      'Desça o haltere por trás da nuca flexionando os cotovelos.',
      'Sinta o alongamento profundo da cabeça longa do tríceps.',
      'Empurre o peso de volta acima da cabeça.'
    ],
    tips: 'Mantenha os cotovelos o mais fechados e apontados para a frente possível.'
  },
  {
    id: 'triceps-frances-unilateral-halter',
    name: 'Tríceps Francês Unilateral com Halter',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Segure um haltere em uma mão acima da cabeça.',
      'Desça o peso por trás do pescoço e estenda o braço verticalmente.'
    ]
  },
  {
    id: 'triceps-frances-barra-w',
    name: 'Tríceps Francês Sentado com Barra W',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se com encosto vertical e segure a barra W acima da cabeça.',
      'Desça a barra atrás da nuca e estenda os braços para cima.'
    ]
  },
  {
    id: 'triceps-frances-polia-alta-corda',
    name: 'Tríceps Francês na Polia Alta com Corda (Overhead Extension)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Fique de costas para a polia alta segurando a corda acima e atrás da cabeça.',
      'Dê um passo à frente inclinando o tronco a 45°.',
      'Estenda os cotovelos para a frente abrindo a corda no final.',
      'Retorne alongando os tríceps atrás da nuca.'
    ]
  },
  {
    id: 'triceps-frances-polia-baixa-corda',
    name: 'Tríceps Francês na Polia Baixa com Corda',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Fique de costas para a polia baixa segurando a corda por trás dos ombros.',
      'Estenda os braços verticalmente acima da cabeça.'
    ]
  },
  {
    id: 'triceps-coice-halteres',
    name: 'Tríceps Coice com Halter (Kickback Unilateral)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie o joelho no banco com tronco paralelo ao chão.',
      'Erga o cotovelo acima da linha das costas e trave a posição.',
      'Estenda o antebraço para trás até o braço ficar 100% reto.',
      'Aperte o tríceps por 1 segundo e retorne até 90°.'
    ]
  },
  {
    id: 'triceps-coice-polia-unilateral',
    name: 'Tríceps Coice na Polia Baixa (Cable Kickback)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure o cabo na polia baixa sem manopla.',
      'Incline o tronco e estenda o braço para trás com tensão mecânica contínua.'
    ]
  },
  {
    id: 'triceps-paralelas',
    name: 'Mergulho nas Barras Paralelas (Foco Tríceps)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Peito', 'Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 120,
    instructions: [
      'Suspenda-se nas barras paralelas com os braços estendidos e tronco ereto vertical.',
      'Flexione os cotovelos descendo o corpo com os cotovelos fechados rente ao corpo.',
      'Empurre para cima estendendo os braços totalmente.'
    ],
    tips: 'Manter o corpo estritamente vertical transfere todo o foco do peito para os tríceps.'
  },
  {
    id: 'triceps-mergulho-banco-dips',
    name: 'Mergulho no Banco (Bench Dips)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie as mãos na borda do banco com pernas estendidas à frente.',
      'Desça o quadril próximo ao banco flexionando os cotovelos a 90°.',
      'Empurre para cima contraindo os tríceps.',
      'Pode colocar anilhas sobre as coxas para carga extra.'
    ]
  },
  {
    id: 'triceps-graviton-assistido',
    name: 'Mergulho no Graviton (Assistido)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Peito'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste a plataforma de contrapeso e execute os mergulhos com foco na extensão dos braços.'
    ]
  },
  {
    id: 'supino-fechado-barra-close-grip',
    name: 'Supino Fechado com Barra (Close-Grip Bench Press)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Peito', 'Ombros'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no banco plano e segure a barra com pegada na largura dos ombros (~30-40cm).',
      'Desça a barra no peito inferior mantendo os cotovelos colados às costelas.',
      'Empurre a barra com força explosiva estendendo os tríceps.'
    ],
    tips: 'Excelente exercício composto para construir volume e força maciça nos tríceps.'
  },
  {
    id: 'supino-fechado-smith-close-grip',
    name: 'Supino Fechado no Smith Machine',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Peito'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Deite no banco sob a barra do Smith com pegada na largura dos ombros.',
      'Desça a barra mantendo cotovelos fechados e empurre com os tríceps.'
    ]
  },
  {
    id: 'triceps-tate-press-halteres',
    name: 'Tate Press com Halteres (Banco Plano)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco com halteres estendidos acima do peito e palmas viradas para os pés.',
      'Flexione os cotovelos para fora descendo as cabeças internas dos halteres até tocarem o peito.',
      'Empurre os halteres para cima estendendo os cotovelos.'
    ],
    tips: 'Criado pelo lendário powerlifter Dave Tate para fortalecer a cabeça medial e tendões do cotovelo.'
  },
  {
    id: 'triceps-california-press',
    name: 'California Press com Barra (Híbrido Supino Fechado + Testa)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Peito'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Inicie a descida como um tríceps testa até a altura do queixo.',
      'Traga a barra rente ao peito e finalize empurrando como um supino fechado.'
    ]
  },
  {
    id: 'flexao-de-braco-diamante-solo',
    name: 'Flexão Diamante no Solo (Diamond Push-up)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Peito', 'Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Junte as mãos no chão formando um triângulo com dedos sob o peito.',
      'Desça com cotovelos rentes ao corpo e empurre com os tríceps.'
    ]
  },
  {
    id: 'triceps-extensao-na-parede-ou-barra-guiada',
    name: 'Bodyweight Triceps Extension (Extensão de Tríceps com Peso Corporal na Barra)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie as mãos em uma barra fixa baixa com corpo inclinado como uma prancha.',
      'Flexione os cotovelos passando a cabeça por baixo da barra.',
      'Empurre com as palmas estendendo os braços de volta.'
    ]
  },
  {
    id: 'triceps-maquina-sentado',
    name: 'Tríceps na Máquina Sentado (Dip Machine)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Peito'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se no aparelho e ajuste o apoio de pernas.',
      'Empurre as alavancas para baixo estendendo os braços com controle.'
    ]
  },
  {
    id: 'triceps-coice-duplo-halteres-em-pe',
    name: 'Tríceps Coice Duplo com Halteres (Simultâneo)',
    muscleGroup: 'Tríceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Incline o tronco à frente com costas retas segurando um haltere em cada mão.',
      'Erga ambos os cotovelos e estenda os dois braços simultaneamente para trás.'
    ]
  }
];
