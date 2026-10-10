import { Exercise } from '../../types';

export const BICEPS_EXERCISES: Exercise[] = [
  {
    id: 'rosca-direta-barra-w',
    name: 'Rosca Direta com Barra W',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Em pé, segure a barra W nas curvas com pegada supinada na largura dos ombros.',
      'Mantenha os cotovelos colados ao lado do tronco.',
      'Flexione os antebraços erguendo a barra até a altura do peito.',
      'Desça o peso até quase a extensão total do braço de forma lenta.'
    ],
    tips: 'A barra W reduz o estresse nas articulações dos punhos.'
  },
  {
    id: 'rosca-direta-barra-reta',
    name: 'Rosca Direta com Barra Reta',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Em pé, segure a barra reta com pegada supinada.',
      'Mantenha os cotovelos fixos e flexione os braços com força total no bíceps.',
      'Desça até a extensão completa controlando a descida.'
    ],
    tips: 'Gera máxima supinação anatômica para pico de ativação do bíceps braquial.'
  },
  {
    id: 'rosca-direta-halteres',
    name: 'Rosca Direta com Halteres (Simultânea)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Em pé, segure os halteres ao lado das coxas com palmas voltadas para a frente.',
      'Flexione ambos os braços ao mesmo tempo sem movimentar o tronco.'
    ]
  },
  {
    id: 'rosca-alternada-halteres-em-pe',
    name: 'Rosca Alternada com Halteres (Em Pé)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Inicie com os halteres em pegada neutra ao lado do corpo.',
      'Ao subir um braço, faça a rotação (supinação) do punho de modo que a palma fique para cima no topo.',
      'Desça controlando e repita com o outro braço.'
    ]
  },
  {
    id: 'rosca-alternada-sentado-halteres',
    name: 'Rosca Alternada com Halteres Sentado',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se no banco com coluna ereta apoiada.',
      'Execute a rosca alternada supinando no topo sem qualquer impulso de tronco.'
    ]
  },
  {
    id: 'rosca-banco-inclinado-45',
    name: 'Rosca 45º no Banco Inclinado',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste o banco em 45°-60° e deite com as costas totalmente apoiadas.',
      'Deixe os braços caírem perpendicularmente ao chão, alongando a cabeça longa do bíceps.',
      'Flexione os antebraços e supine os punhos no topo.',
      'Desça lentamente mantendo os cotovelos apontados para trás.'
    ],
    tips: 'Trabalha a cabeça longa do bíceps em máxima amplitude de alongamento mecânico.'
  },
  {
    id: 'rosca-banco-inclinado-simultanea',
    name: 'Rosca Inclinada Simultânea com Halteres',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deitado a 45°, flexione ambos os braços ao mesmo tempo mantendo tensão simétrica.'
    ]
  },
  {
    id: 'rosca-scott-maquina',
    name: 'Rosca Scott na Máquina',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste o assento para que a axila fique encostada na borda da almofada do banco Scott.',
      'Segure os apoios da máquina com pegada supinada.',
      'Flexione os braços até a contração máxima e desça controlando o peso.'
    ]
  },
  {
    id: 'rosca-scott-barra-w',
    name: 'Rosca Scott com Barra W (Preacher Curl)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie os braços no banco Scott segurando a barra W.',
      'Flexione os cotovelos puxando a barra em direção aos ombros.',
      'Desça com cuidado sem esticar bruscamente os cotovelos na base.'
    ],
    tips: 'Excelente para desenvolver o pico do bíceps e isolar a cabeça curta.'
  },
  {
    id: 'rosca-scott-halteres-unilateral',
    name: 'Rosca Scott Unilateral com Halter',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie um braço no banco Scott com o tronco levemente lateralizado.',
      'Execute a flexão concentrando toda a força em um único bíceps.'
    ]
  },
  {
    id: 'rosca-concentrada-halteres',
    name: 'Rosca Concentrada com Halter (Sentado)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Sentado na ponta do banco com as pernas abertas.',
      'Apoie a parte de trás do cotovelo na parte interna da coxa do mesmo lado.',
      'Flexione o braço erguendo o haltere em direção ao peito.',
      'Aperte o bíceps no topo por 1 segundo antes de descer.'
    ],
    tips: 'Clássico imortalizado por Arnold Schwarzenegger para pico muscular.'
  },
  {
    id: 'rosca-concentrada-em-pe-spider-concentrated',
    name: 'Rosca Concentrada em Pé (Inclinado)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: [],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Em pé, incline o tronco à frente deixando o braço pender solto.',
      'Flexione o antebraço mantendo o braço perpendicular ao solo.'
    ]
  },
  {
    id: 'rosca-spider-aranha-banco-inclinado-barra',
    name: 'Rosca Spider / Aranha com Barra W',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Deite de bruços no banco inclinado a 45° com o peito apoiado no topo.',
      'Deixe os braços caírem retos para a frente segurando a barra W.',
      'Flexione os antebraços até a contração máxima sem mexer a posição dos cotovelos.'
    ],
    tips: 'Mantém tensão máxima contínua no pico de contração do bíceps.'
  },
  {
    id: 'rosca-spider-halteres',
    name: 'Rosca Spider com Halteres',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deitado de bruços no banco inclinado, flexione os halteres simultaneamente ou alternadamente.'
    ]
  },
  {
    id: 'rosca-martelo-halteres',
    name: 'Rosca Martelo com Halteres (Em Pé)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Em pé ou sentado, segure os halteres com as palmas voltadas para dentro (pegada neutra).',
      'Erga os pesos mantendo os punhos firmes e sem rotação.',
      'Foque na contração do braquial e braquiorradial.',
      'Desça controlando a fase excêntrica.'
    ],
    tips: 'Ajuda a criar largura e espessura no braço, empurrando o bíceps para fora.'
  },
  {
    id: 'rosca-martelo-sentado-halteres',
    name: 'Rosca Martelo com Halteres Sentado',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se no banco reto e execute a rosca martelo com técnica rigorosa sem balanço.'
    ]
  },
  {
    id: 'rosca-martelo-banco-inclinado',
    name: 'Rosca Martelo no Banco Inclinado',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se no banco a 60° e execute a rosca martelo com pegada neutra estendendo os braços atrás.'
    ]
  },
  {
    id: 'rosca-martelo-cruzada-pinwheel-curl',
    name: 'Rosca Martelo Cruzada no Peito (Pinwheel Curl)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 60,
    instructions: [
      'Segure o haltere e levante-o na diagonal em direção ao peitoral oposto.',
      'Extrema ativação do músculo braquiorradial e braquial profundo.'
    ]
  },
  {
    id: 'rosca-martelo-corda-polia',
    name: 'Rosca Martelo na Polia Baixa com Corda',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Prenda a corda na polia baixa.',
      'Puxe mantendo a pegada neutra e cotovelos fixos até o topo.'
    ]
  },
  {
    id: 'rosca-polia-baixa-barra-reta',
    name: 'Rosca Direta na Polia Baixa com Barra Reta',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a barra conectada à polia baixa.',
      'Flexione os braços sentindo tensão mecânica constante desde o início da puxada.'
    ]
  },
  {
    id: 'rosca-polia-baixa-barra-w',
    name: 'Rosca Direta na Polia Baixa com Barra W',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Conecte a barra W à polia baixa e execute a rosca direta com pegada anatômica.'
    ]
  },
  {
    id: 'rosca-bayesian-polia-costas',
    name: 'Rosca Bayesian no Cabo (Polia por Trás Unilateral)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Fique de costas para a polia baixa segurando a manopla com o braço estendido atrás do tronco.',
      'Dê um passo à frente inclinando levemente.',
      'Flexione o bíceps mantendo o cotovelo atrás da linha do corpo durante o alongamento e trazendo levemente à frente no topo.'
    ],
    tips: 'Permite hipertrofia mediada por estiramento da cabeça longa do bíceps.'
  },
  {
    id: 'rosca-cabo-alto-duplo-biceps',
    name: 'Rosca Duplo Bíceps no Crossover (Polia Alta)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: [],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Posicione-se no centro do crossover com as polias na altura das orelhas.',
      'Segure as manoplas com braços estendidos e flexione os cotovelos em direção à cabeça como na pose de duplo bíceps.',
      'Aperte fortemente no topo.'
    ]
  },
  {
    id: 'rosca-zottman-halteres',
    name: 'Rosca Zottman com Halteres',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Suba os halteres em rosca direta normal com pegada supinada (palmas para cima).',
      'No topo, gire as mãos para pegada pronada (palmas para baixo).',
      'Desça o peso lentamente na pegada pronada, trabalhando intensamente os antebraços.',
      'No fundo, gire as palmas de volta para cima e repita.'
    ],
    tips: 'O melhor exercício 2-em-1 para bíceps e extensores do antebraço.'
  },
  {
    id: 'rosca-drag-curl-barra',
    name: 'Drag Curl com Barra (Rosca Arrastada)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Puxe a barra para cima rente ao abdômen e peito, jogando os cotovelos para trás.',
      'Mantém os braços em linha vertical, isolando o bíceps e minimizando a ajuda dos deltóides anteriores.'
    ]
  },
  {
    id: 'rosca-21s-barra-w',
    name: 'Rosca 21 com Barra W',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Execute 7 repetições na metade inferior do movimento (do chão até 90°).',
      'Execute 7 repetições na metade superior (de 90° até o topo).',
      'Execute 7 repetições completas completando 21 reps sem descanso.',
      'Gera um bombeamento sanguíneo (pump) e acúmulo de metabólitos extremo.'
    ]
  },
  {
    id: 'rosca-inversa-barra-w',
    name: 'Rosca Inversa com Barra W (Pegada Pronada)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a barra W com as palmas voltadas para baixo (pegada pronada).',
      'Flexione os antebraços mantendo os cotovelos colados ao corpo.',
      'Foco direto no braquiorradial e extensores do punho.'
    ]
  },
  {
    id: 'rosca-inversa-polia-barra-reta',
    name: 'Rosca Inversa na Polia Baixa',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a barra na polia baixa com pegada pronada e execute a flexão contínua.'
    ]
  },
  {
    id: 'rosca-punho-barra-antibraco',
    name: 'Flexão de Punho com Barra (Rosca Punho / Flexores)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 60,
    instructions: [
      'Sentado, apoie os antebraços nas coxas com os punhos para fora dos joelhos e palmas para cima.',
      'Desça a barra abrindo os dedos e enrole a barra para cima flexionando os punhos.'
    ]
  },
  {
    id: 'extensao-punho-barra-antibraco',
    name: 'Extensão de Punho com Barra (Extensores de Punho)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie os antebraços nas coxas com as palmas viradas para baixo.',
      'Eleve a barra estendendo os punhos para cima e desça com controle.'
    ]
  },
  {
    id: 'rosca-punho-halteres-unilateral',
    name: 'Flexão de Punho Unilateral com Halter',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 45,
    instructions: [
      'Apoie o antebraço no banco ou coxa segurando o haltere.',
      'Flexione e estenda o punho para hipertrofia dos flexores do antebraço.'
    ]
  },
  {
    id: 'farmers-walk-caminhada-fazendeiro',
    name: 'Caminhada do Fazendeiro (Farmer Walk para Pegada e Trapézio)',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço', 'Trapézio', 'Abdômen'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Segure um par de halteres ou kettlebells pesados ao lado do corpo com coluna ereta.',
      'Caminhe a passos firmes e curtos por 30 a 60 segundos sem deixar os pesos balançarem.',
      'Desenvolve pegada de aço, antebraços densos e estabilidade de core.'
    ]
  }
];
