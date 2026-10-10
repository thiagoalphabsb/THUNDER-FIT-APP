import { Exercise } from '../../types';

export const CHEST_EXERCISES: Exercise[] = [
  {
    id: 'supino-reto-barra',
    name: 'Supino Reto com Barra',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no banco plano com os olhos alinhados com a barra.',
      'Segure a barra com pegada ligeiramente mais larga que os ombros.',
      'Retraia as escápulas e mantenha os pés firmes no chão.',
      'Desça a barra de forma controlada até a linha dos mamilos.',
      'Empurre a barra de volta com explosão mantendo a estabilidade.'
    ],
    tips: 'Mantenha os cotovelos em um ângulo de ~45° a 75° em relação ao tronco, nunca a 90°.'
  },
  {
    id: 'supino-halteres-reto',
    name: 'Supino Reto com Halteres',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Halteres',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no banco plano com um haltere em cada mão.',
      'Inicie com os braços estendidos e palmas voltadas para a frente.',
      'Desça os halteres em movimento controlado até sentir bom alongamento no peito.',
      'Empurre para cima sem encostar os halteres bruscamente.'
    ],
    tips: 'Excelente para corrigir assimetrias de força e trabalhar estabilizadores.'
  },
  {
    id: 'supino-inclinado-halteres',
    name: 'Supino Inclinado com Halteres',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 120,
    instructions: [
      'Ajuste o banco em uma inclinação entre 30° e 45°.',
      'Posicione os halteres acima do peitoral com os braços estendidos.',
      'Desça os halteres com controle até a lateral do peito.',
      'Pressione para cima convergindo levemente os halteres no topo sem bater.'
    ],
    tips: 'Foque na porção clavicular (peito superior). Evite inclinações acima de 45° para não sobrecarregar os ombros.'
  },
  {
    id: 'supino-inclinado-barra',
    name: 'Supino Inclinado com Barra',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite no banco inclinado a 30°-45° com as escápulas retraídas.',
      'Desça a barra controladamente até o peito superior (abaixo da clavícula).',
      'Empurre de volta mantendo a trajetória vertical.'
    ],
    tips: 'Mantenha os pés bem firmes no solo e peito estufado.'
  },
  {
    id: 'supino-declinado-barra',
    name: 'Supino Declinado com Barra',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no banco declinado travando as pernas no apoio acolchoado.',
      'Segure a barra com pegada ligeiramente mais larga que os ombros.',
      'Desça a barra até a linha inferior do peito e empurre para cima.'
    ],
    tips: 'Foca na cabeça esternal e porção inferior do peitoral.'
  },
  {
    id: 'supino-declinado-halteres',
    name: 'Supino Declinado com Halteres',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se no banco declinado com halteres posicionados ao lado do peitoral inferior.',
      'Pressione os halteres para cima estendendo os braços.',
      'Desça controlando a fase excêntrica até alongar o peitoral.'
    ]
  },
  {
    id: 'supino-articulado-maquina',
    name: 'Supino Máquina / Articulado',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste a altura do banco para as pegadas ficarem alinhadas com o peitoral.',
      'Empurre as manoplas para a frente contraindo o peito.',
      'Retorne lentamente até o ponto de máximo alongamento seguro.'
    ]
  },
  {
    id: 'supino-inclinado-maquina',
    name: 'Supino Inclinado na Máquina Convergente',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste o assento para que as manoplas fiquem na linha do peito superior.',
      'Empurre as manoplas para cima e para frente acompanhando o arco da máquina.',
      'Retorne de forma controlada.'
    ],
    tips: 'Ótimo para levar até a falha muscular com total segurança articular.'
  },
  {
    id: 'supino-smith-reto',
    name: 'Supino Reto no Smith Machine',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione o banco reto no centro do Smith.',
      'Alinhe a barra com a linha média dos mamilos.',
      'Destrave a barra, desça até tocar levemente o peito e empurre para cima.'
    ]
  },
  {
    id: 'supino-smith-inclinado',
    name: 'Supino Inclinado no Smith Machine',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione o banco inclinado a 30° no Smith.',
      'Ajuste o posicionamento para a barra descer na altura da clavícula.',
      'Empurre a barra focando na contração da parte superior do peito.'
    ]
  },
  {
    id: 'supino-smith-declinado',
    name: 'Supino Declinado no Smith Machine',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Máquina',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione o banco declinado sob a barra do Smith.',
      'Desça a barra em direção à porção inferior do peitoral e empurre com controle.'
    ]
  },
  {
    id: 'peck-deck-voador',
    name: 'Peck Deck / Voador',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste a altura do banco para que as mãos fiquem na linha do peitoral médio.',
      'Mantenha as costas e cabeça apoiadas no encosto.',
      'Feche os braços concentrando a força no peitoral.',
      'Retorne lentamente até sentir o alongamento do peito.'
    ],
    tips: 'Não permita que os cotovelos passem excessivamente para trás da linha dos ombros no retorno.'
  },
  {
    id: 'crucifixo-reto-halteres',
    name: 'Crucifixo Reto com Halteres',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se no banco plano segurando os halteres acima do peito.',
      'Abra os braços lateralmente em arco suave até a altura dos ombros.',
      'Retorne trazendo os halteres para o centro contraindo o peitoral.'
    ],
    tips: 'Mantenha uma leve flexão fixa nos cotovelos durante todo o movimento.'
  },
  {
    id: 'crucifixo-inclinado-halteres',
    name: 'Crucifixo Inclinado com Halteres',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste o banco em 30° a 45° de inclinação.',
      'Com cotovelos levemente flexionados, abra os braços em arco sentindo o peitoral superior.',
      'Feche os braços contraindo o peito no topo.'
    ],
    tips: 'Foque no estiramento controlado na base do movimento.'
  },
  {
    id: 'crucifixo-declinado-halteres',
    name: 'Crucifixo Declinado com Halteres',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco declinado e abra os braços em arco na linha inferior do peito.',
      'Feche os braços contraindo a porção inferior do peitoral.'
    ]
  },
  {
    id: 'crucifixo-no-chao-floor-fly',
    name: 'Crucifixo no Solo (Floor Fly)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se no chão com halteres acima do peito.',
      'Abra os braços até os tríceps tocarem suavemente o chão.',
      'Feche os braços contraindo o peitoral.'
    ],
    tips: 'O chão limita a hiperextensão do ombro, sendo excelente para quem tem dores articulares.'
  },
  {
    id: 'crossover-polia',
    name: 'Crossover na Polia Média',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste as polias na altura média.',
      'Dê um passo à frente com o tronco ligeiramente inclinado.',
      'Traga as mãos para a frente em arco até se tocarem na linha do peito.',
      'Abra os braços controlando o retorno mantendo leve flexão nos cotovelos.'
    ],
    tips: 'Aperte o peito fortemente na contração máxima por 1 segundo.'
  },
  {
    id: 'crossover-polia-alta',
    name: 'Crossover na Polia Alta',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste as polias no topo e dê um passo à frente.',
      'Puxe as manoplas para baixo e para o centro cruzando levemente as mãos.',
      'Retorne controlando o peso.'
    ],
    tips: 'Foco na porção inferior e esternal do peitoral.'
  },
  {
    id: 'crossover-polia-baixa',
    name: 'Crossover na Polia Baixa',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste as polias na base e segure as manoplas.',
      'Puxe de baixo para cima convergindo as mãos na altura do peito superior.',
      'Desça com controle.'
    ],
    tips: 'Foco na porção clavicular (peito superior).'
  },
  {
    id: 'crossover-unilateral-polia',
    name: 'Crossover Unilateral na Polia',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a manopla de um lado com a polia na altura do peito.',
      'Aduza o braço cruzando a linha média do corpo para máxima contração.',
      'Retorne controlando a carga.'
    ],
    tips: 'Permite cruzar além da linha média, gerando maior pico de contração.'
  },
  {
    id: 'crucifixo-polia-banco-reto',
    name: 'Crucifixo na Polia no Banco Reto',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Posicione um banco reto entre duas polias baixas.',
      'Deite-se e segure as manoplas com braços estendidos acima do peito.',
      'Abra os braços em arco e feche contraindo o peito com tensão constante.'
    ]
  },
  {
    id: 'crucifixo-polia-banco-inclinado',
    name: 'Crucifixo na Polia no Banco Inclinado',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Posicione um banco inclinado a 30° entre duas polias baixas.',
      'Execute o crucifixo sentindo tensão contínua na porção superior do peito.'
    ]
  },
  {
    id: 'flexao-de-braco-solo',
    name: 'Flexão de Braço no Solo (Push-up)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros', 'Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Posicione as mãos no chão ligeiramente mais largas que os ombros.',
      'Mantenha o corpo alinhado da cabeça aos calcanhares.',
      'Desça o tronco até o peito quase tocar o chão.',
      'Empurre o chão até a extensão dos braços mantendo o core contraído.'
    ]
  },
  {
    id: 'flexao-de-braco-declinada',
    name: 'Flexão Declinada (Pés Elevados no Banco)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros', 'Tríceps'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie os pés em um banco e as mãos no chão.',
      'Desça o peito em direção ao chão e empurre com força.',
      'Foco acentuado na porção superior do peito e ombros.'
    ]
  },
  {
    id: 'flexao-de-braco-inclinada',
    name: 'Flexão Inclinada (Mãos no Banco)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie as mãos em um banco ou barra baixa e pés no chão.',
      'Execute a flexão empurrando o corpo para cima.',
      'Excelente para aquecimento ou finalização de treino.'
    ]
  },
  {
    id: 'flexao-diamante',
    name: 'Flexão Diamante (Pegada Fechada)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Junte os polegares e indicadores no chão formando um triângulo/diamante sob o peito.',
      'Desça o peito até as mãos e empurre para cima.'
    ]
  },
  {
    id: 'flexao-com-peso-anilha',
    name: 'Flexão de Braço com Peso nas Costas',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 90,
    instructions: [
      'Coloque uma anilha sobre a parte superior das costas.',
      'Execute a flexão estrita mantendo o tronco rígido.'
    ]
  },
  {
    id: 'paralelas-foco-peito',
    name: 'Mergulho nas Paralelas (Foco Peitoral)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 120,
    instructions: [
      'Segure as barras paralelas com pegada mais aberta.',
      'Incline o tronco para a frente a ~30° e abra levemente os cotovelos.',
      'Desça até sentir alongamento no peito e empurre estendendo os braços.'
    ],
    tips: 'Manter o tronco inclinado direciona a sobrecarga para a porção inferior do peitoral.'
  },
  {
    id: 'paralelas-assistida-peito',
    name: 'Mergulho nas Paralelas no Graviton (Assistido)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste o contrapeso no graviton e apoie os joelhos na plataforma.',
      'Incline o tronco à frente e execute o mergulho com controle.'
    ]
  },
  {
    id: 'pullover-halteres',
    name: 'Pullover com Halter',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Costas', 'Tríceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se perpendicularmente ao banco apoiando apenas as costas superiores.',
      'Segure um haltere com as duas mãos em formato de diamante acima do peito.',
      'Desça o haltere para trás da cabeça com os cotovelos levemente flexionados.',
      'Puxe o peso de volta acima do peito contraindo peitoral e serrátil.'
    ],
    tips: 'Excelente para expansão da caixa torácica e ativação do serrátil anterior.'
  },
  {
    id: 'pullover-barra-reta',
    name: 'Pullover com Barra',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Costas', 'Tríceps'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Deite no banco plano segurando a barra com pegada na largura dos ombros.',
      'Desça a barra para trás da cabeça em arco controlado e retorne contraindo o peito.'
    ]
  },
  {
    id: 'pullover-polia-banco',
    name: 'Pullover na Polia no Banco Plano',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Costas'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Posicione o banco em frente à polia baixa com corda ou barra reta.',
      'Puxe o cabo sobre a cabeça até a altura do peito contraindo fortemente.'
    ]
  },
  {
    id: 'supino-chao-floor-press-barra',
    name: 'Supino no Chão com Barra (Floor Press)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no chão sob o suporte da barra.',
      'Desça a barra até os tríceps encostarem no chão, pausando por 1 segundo.',
      'Empurre a barra com força explosiva.'
    ],
    tips: 'Excelente para desenvolver força de travamento (lockout) e proteger os ombros.'
  },
  {
    id: 'supino-chao-floor-press-halteres',
    name: 'Supino no Chão com Halteres (Floor Press)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se no chão com um par de halteres.',
      'Desça até os cotovelos tocarem o chão em ângulo de 45° e empurre de volta.'
    ]
  },
  {
    id: 'supino-pegada-invertida-barra',
    name: 'Supino com Pegada Invertida (Reverse Grip Bench Press)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Deite-se no banco plano e segure a barra com pegada supinada (palmas voltadas para a cabeça).',
      'Desça a barra no peito superior e empurre com controle.'
    ],
    tips: 'Estudos mostram altíssima ativação da porção clavicular (peito superior).'
  },
  {
    id: 'svend-press-anilhas',
    name: 'Svend Press com Anilhas',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Em pé, segure duas anilhas pequenas prensadas entre as palmas das mãos na altura do peito.',
      'Aperte as mãos uma contra a outra e empurre as anilhas para a frente.',
      'Retorne ao peito mantendo a pressão máxima constante.'
    ],
    tips: 'Foco exclusivo na contração isométrica interna do peitoral.'
  }
];
