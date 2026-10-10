import { Exercise } from '../../types';

export const BACK_EXERCISES: Exercise[] = [
  {
    id: 'puxada-alta-aberta',
    name: 'Puxada Alta Aberta (Lat Pulldown)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 120,
    instructions: [
      'Sente-se no aparelho e ajuste os apoios de coxa firmemente.',
      'Segure a barra com pegada pronada mais larga que os ombros.',
      'Puxe a barra em direção à parte superior do peito puxando com os cotovelos.',
      'Mantenha o peito aberto e retorne à posição inicial de forma lenta.'
    ],
    tips: 'Pense em puxar com os cotovelos apontando para o chão e para baixo.'
  },
  {
    id: 'puxada-alta-triangulo',
    name: 'Puxada Alta com Triângulo (Pegada Neutra Fechada)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Conecte o puxador triângulo na polia alta.',
      'Puxe o triângulo até tocar a parte superior do peito, projetando os cotovelos para baixo e para trás.',
      'Retorne estendendo os braços e alongando a grande dorsal.'
    ]
  },
  {
    id: 'puxada-alta-supinada',
    name: 'Puxada Alta com Pegada Supinada (Underhand Pulldown)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Segure a barra reta com palmas voltadas para você na largura dos ombros.',
      'Puxe até o peito focando na grande dorsal inferior e bíceps.'
    ]
  },
  {
    id: 'puxada-alta-neutra-aberta',
    name: 'Puxada Alta com Barra Neutra Aberta',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Use a barra com pegadores neutros paralelos afastados.',
      'Puxe até a linha da clavícula mantendo as escápulas retraídas.'
    ]
  },
  {
    id: 'puxada-alta-unilateral-polia',
    name: 'Puxada Alta Unilateral na Polia',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Ajoelhe-se ou sente-se segurando a manopla com uma mão.',
      'Puxe o cotovelo rente à cintura inclinando levemente o tronco para o lado.',
      'Alongue totalmente a grande dorsal na subida.'
    ],
    tips: 'Permite alinhamento biomecânico perfeito com as fibras da grande dorsal.'
  },
  {
    id: 'puxada-alta-articulada-maquina',
    name: 'Puxada Alta na Máquina Articulada (Hammer Strength)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Ajuste a altura do assento para alcance confortável.',
      'Puxe as alavancas para baixo simultaneamente ou alternadamente até a contração total.'
    ]
  },
  {
    id: 'puxada-nuca-polia',
    name: 'Puxada Atrás da Nuca na Polia',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se inclinado levemente à frente.',
      'Puxe a barra suavemente até a altura da nuca sem projetar a cabeça bruscamente.',
      'Retorne de forma controlada.'
    ]
  },
  {
    id: 'barra-fixa-pronada',
    name: 'Barra Fixa Pronada (Pull-up)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 120,
    instructions: [
      'Segure a barra com pegada pronada mais larga que os ombros.',
      'Inicie o movimento ativando as escápulas para baixo.',
      'Puxe o corpo para cima até que o queixo ultrapasse a linha da barra.',
      'Desça com controle até a extensão completa dos braços.'
    ],
    tips: 'Se necessário, use caneleiras ou cinto com anilhas para sobrecarga progressiva.'
  },
  {
    id: 'barra-fixa-supinada-chinup',
    name: 'Barra Fixa Supinada (Chin-up)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 120,
    instructions: [
      'Segure a barra com pegada supinada (palmas para você) na largura dos ombros.',
      'Puxe o peito em direção à barra até o queixo passar.',
      'Desça com controle total.'
    ]
  },
  {
    id: 'barra-fixa-pegada-neutra',
    name: 'Barra Fixa com Pegada Neutra',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 120,
    instructions: [
      'Segure nas pegadas paralelas da barra fixa.',
      'Puxe o corpo para cima focando na ativação das dorsais.',
      'Muito confortável para as articulações dos ombros e punhos.'
    ]
  },
  {
    id: 'barra-fixa-graviton-assistida',
    name: 'Barra Fixa no Graviton (Assistida)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Selecione o peso de assistência adequado no aparelho.',
      'Apoie os joelhos na almofada e execute a puxada com amplitude completa.'
    ]
  },
  {
    id: 'barra-fixa-com-peso-lastro',
    name: 'Barra Fixa com Carga Extra (Weighted Pull-up)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Abdômen'],
    equipment: 'Barra',
    defaultRestSeconds: 150,
    instructions: [
      'Prenda anilhas ao cinto de lastro ou use halter entre os pés.',
      'Execute a barra fixa estrita sem balanço.'
    ]
  },
  {
    id: 'remada-curvada-barra',
    name: 'Remada Curvada com Barra (Pronada)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Posteriores', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Em pé, incline o tronco para a frente a ~45° mantendo a coluna neutra.',
      'Segure a barra com pegada pronada na largura dos ombros.',
      'Puxe a barra em direção ao umbigo contraindo as dorsais e rombóides.',
      'Desça o peso com controle total sem arredondar as costas.'
    ],
    tips: 'Mantenha o core rígido e os joelhos levemente flexionados durante toda a série.'
  },
  {
    id: 'remada-curvada-supinada-yates',
    name: 'Remada Curvada Supinada (Yates Row)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Incline o tronco a ~60° com pegada supinada na barra.',
      'Puxe a barra diretamente para o abdômen inferior retraindo as escápulas.',
      'Foca fortemente na dorsal inferior e espessura do meio das costas.'
    ]
  },
  {
    id: 'remada-pendlay-barra',
    name: 'Remada Pendlay com Barra (Pendlay Row)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Posteriores', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 150,
    instructions: [
      'Incline o tronco até ficar 100% paralelo ao chão com a barra no chão.',
      'Puxe a barra explosivamente até tocar o peito inferior.',
      'Retorne a barra ao solo a cada repetição, zerando o impulso.'
    ],
    tips: 'Excelente construtor de potência pura e espessura dorsal.'
  },
  {
    id: 'remada-cavalinho-barra-t',
    name: 'Remada Cavalinho (Barra T)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Trapézio', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Posicione a barra no suporte landmine com pegador triângulo sob a barra.',
      'Fique sobre a barra com joelhos dobrados e tronco inclinado.',
      'Puxe o peso em direção ao peito inferior contraindo o meio das costas.'
    ]
  },
  {
    id: 'remada-cavalinho-maquina-apoiada',
    name: 'Remada Cavalinho na Máquina (Peito Apoiado)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Trapézio'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie o peito na almofada inclinada da máquina.',
      'Puxe as alavancas retraindo as escápulas.',
      'Isola a musculatura dorsal eliminando a sobrecarga na lombar.'
    ]
  },
  {
    id: 'remada-serrote-halteres',
    name: 'Remada Unilateral com Halter (Serrote)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie um joelho e a mão do mesmo lado no banco plano.',
      'Mantenha o tronco paralelo ao solo e coluna reta.',
      'Puxe o haltere em direção ao quadril com o cotovelo rente ao corpo.',
      'Desça alongando a grande dorsal sem girar a coluna.'
    ],
    tips: 'Trabalhe o lado mais fraco primeiro para equilibrar o desenvolvimento.'
  },
  {
    id: 'remada-kroc-halteres',
    name: 'Kroc Rows (Remada com Halter de Alta Carga/Repetição)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Trapézio', 'Antebraço'],
    equipment: 'Halteres',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie-se em um banco ou suporte de halteres.',
      'Use um haltere pesado e execute séries de 15-25 repetições com leve impulso controlado do tronco.',
      'Trabalha dorsal, pegada e resistência extrema.'
    ]
  },
  {
    id: 'remada-curvada-halteres-banco-inclinado',
    name: 'Remada Curvada com Halteres no Banco Inclinado (Chest Supported)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Rombóides'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Deite de bruços no banco inclinado a 30°-45° com halteres nas mãos.',
      'Puxe os halteres para cima retraindo as escápulas.',
      'Desça lentamente alongando os músculos das costas.'
    ]
  },
  {
    id: 'remada-curvada-dois-halteres-em-pe',
    name: 'Remada Curvada com Halteres em Pé',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Lombar'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Em pé, incline o tronco com um haltere em cada mão.',
      'Puxe simultaneamente ambos os halteres em direção ao quadril.'
    ]
  },
  {
    id: 'remada-baixa-triangulo',
    name: 'Remada Baixa no Triângulo',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Ombros'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Sente-se com os pés na plataforma e joelhos levemente flexionados.',
      'Segure o puxador triângulo e mantenha a coluna ereta.',
      'Puxe a pegada em direção ao abdômen inferior retraindo as escápulas.',
      'Retorne estendendo os braços sem projetar o tronco excessivamente para a frente.'
    ],
    tips: 'Evite usar o embalo da lombar para puxar a carga.'
  },
  {
    id: 'remada-baixa-barra-reta',
    name: 'Remada Baixa com Barra Reta (Pegada Pronada)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Trapézio', 'Rombóides'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Use a barra reta na polia baixa com pegada mais aberta.',
      'Puxe em direção ao peito médio com cotovelos abertos para focar no meio das costas.'
    ]
  },
  {
    id: 'remada-baixa-corda-polia',
    name: 'Remada Baixa na Polia com Corda',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Trapézio'],
    equipment: 'Polia',
    defaultRestSeconds: 90,
    instructions: [
      'Use a corda na polia baixa.',
      'Puxe a corda abrindo as mãos no final do movimento para contração profunda dos rombóides.'
    ]
  },
  {
    id: 'remada-baixa-unilateral-polia',
    name: 'Remada Baixa Unilateral na Polia',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a manopla com uma mão na polia baixa.',
      'Puxe o cotovelo para trás girando o punho para a pegada neutra.',
      'Excelente amplitude e conexão mente-músculo com a dorsal.'
    ]
  },
  {
    id: 'remada-articulada-maquina-unilateral',
    name: 'Remada Articulada na Máquina (Unilateral)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Sente-se no aparelho articulado apoiando o peito.',
      'Puxe uma alavanca de cada vez focando na máxima contração da dorsal.'
    ]
  },
  {
    id: 'remada-articulada-maquina-bilateral',
    name: 'Remada Articulada na Máquina (Bilateral)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Puxe as duas pegadas juntas contraindo o centro das costas e dorsais.'
    ]
  },
  {
    id: 'remada-smith-inclinada',
    name: 'Remada Inclinada no Smith Machine',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Lombar'],
    equipment: 'Máquina',
    defaultRestSeconds: 90,
    instructions: [
      'Incline o tronco sob a barra do Smith.',
      'Puxe a barra guiada em direção ao abdômen com trajetória fixa.'
    ]
  },
  {
    id: 'remada-invertida-barra-australiana',
    name: 'Remada Invertida na Barra / TRX (Australian Pull-up)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Posicione-se embaixo de uma barra fixa baixa ou fitas de suspensão TRX.',
      'Mantenha o corpo reto e calcanhares no chão.',
      'Puxe o peito até a barra mantendo as escápulas fechadas.'
    ]
  },
  {
    id: 'pulldown-polia-bracos-estendidos-corda',
    name: 'Pulldown na Polia com Corda (Braços Estendidos)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Fique em pé em frente à polia alta segurando a corda com braços quase retos.',
      'Incline o tronco levemente.',
      'Puxe a corda em arco para baixo até as coxas contraindo a grande dorsal.',
      'Retorne de forma controlada até sentir o alongamento no topo.'
    ],
    tips: 'Excelente exercício de isolamento puro para a dorsal sem envolver os bíceps.'
  },
  {
    id: 'pulldown-polia-barra-reta',
    name: 'Pulldown na Polia com Barra Reta',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Polia',
    defaultRestSeconds: 60,
    instructions: [
      'Segure a barra reta com pegada pronada na largura dos ombros.',
      'Pressione a barra em arco para baixo até tocar as coxas.'
    ]
  },
  {
    id: 'levantamento-terra-convencional',
    name: 'Levantamento Terra Convencional (Deadlift)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Posteriores', 'Glúteos', 'Lombar', 'Trapézio', 'Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 180,
    instructions: [
      'Fique em pé com os pés na largura do quadril e a barra sobre o meio do pé.',
      'Incline-se, dobre os joelhos e segure a barra firme.',
      'Estufe o peito, trave a coluna e ative as dorsais.',
      'Empurre o chão com os pés e levante a barra até ficar em pé com o corpo ereto.',
      'Desça o peso controlando o quadril para trás.'
    ],
    tips: 'O exercício de força mais completo de toda a cadeia posterior.'
  },
  {
    id: 'levantamento-terra-trap-bar',
    name: 'Levantamento Terra com Trap Bar (Hex Bar Deadlift)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Quadríceps', 'Glúteos', 'Posteriores', 'Trapézio'],
    equipment: 'Barra',
    defaultRestSeconds: 180,
    instructions: [
      'Fique dentro da barra hexagonal segurando as pegadas neutras.',
      'Mantenha as costas retas e empurre o chão subindo ereto.',
      'Reduz a sobrecarga cisalhante na lombar em comparação com a barra reta.'
    ]
  },
  {
    id: 'levantamento-terra-bloco-rack-pull',
    name: 'Rack Pull (Levantamento Terra Parcial no Suporte)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Trapézio', 'Lombar', 'Antebraço'],
    equipment: 'Barra',
    defaultRestSeconds: 150,
    instructions: [
      'Ajuste os suportes da gaiola para a barra ficar na altura dos joelhos.',
      'Puxe a carga estendendo o quadril e contraindo fortemente as costas e trapézios.',
      'Permite trabalhar cargas muito elevadas para construir espessura massiva.'
    ]
  },
  {
    id: 'hiperextensao-lombar-banco-romano',
    name: 'Hiperextensão Lombar no Banco Romano (45°)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Glúteos', 'Posteriores', 'Lombar'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Apoie as coxas na almofada do banco romano com os pés travados.',
      'Desça o tronco flexionando a cintura.',
      'Suba o tronco até alinhar com as pernas contraindo eretores da espinha e glúteos.',
      'Pode segurar uma anilha no peito para sobrecarga.'
    ]
  },
  {
    id: 'hiperextensao-lombar-maquina',
    name: 'Extensão de Tronco na Máquina (Lombar)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Lombar'],
    equipment: 'Máquina',
    defaultRestSeconds: 60,
    instructions: [
      'Sente-se no aparelho com o rolo acolchoado apoiado na parte superior das costas.',
      'Empurre o rolo para trás estendendo o tronco e retorne com calma.'
    ]
  },
  {
    id: 'bom-dia-good-morning-barra',
    name: 'Bom Dia com Barra (Good Morning)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Posteriores', 'Glúteos', 'Lombar'],
    equipment: 'Barra',
    defaultRestSeconds: 120,
    instructions: [
      'Apoie a barra nos trapézios como no agachamento.',
      'Com os joelhos ligeiramente destravados, empurre o quadril para trás inclinando o tronco à frente.',
      'Desça até o tronco ficar quase paralelo ao chão e retorne contraindo a cadeia posterior.'
    ]
  },
  {
    id: 'seal-row-banco-reto',
    name: 'Seal Row com Barra / Halteres (Banco Elevado)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Trapézio', 'Rombóides'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Deite-se completamente de bruços sobre um banco plano elevado horizontal.',
      'Puxe a barra do chão até tocar o fundo do banco.',
      'Elimina 100% de qualquer compensação lombar, isolando a musculatura dorsal.'
    ]
  },
  {
    id: 'remada-landmine-unilateral-meadows',
    name: 'Meadows Row (Remada Landmine Unilateral do John Meadows)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Trapézio'],
    equipment: 'Barra',
    defaultRestSeconds: 90,
    instructions: [
      'Fique de lado para a extremidade da barra landmine.',
      'Segure a ponta da barra com pegada pronada e cotovelo apontado para fora.',
      'Puxe o cotovelo para o alto focando na parte superior das costas e dorsal.'
    ]
  },
  {
    id: 'superman-solo',
    name: 'Extensão Lombar Superman no Solo',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Glúteos', 'Lombar'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Deite-se de bruços no chão com braços e pernas estendidos.',
      'Eleve simultaneamente os braços, peito e pernas do chão.',
      'Segure no topo por 2 segundos e desça lentamente.'
    ]
  }
];
