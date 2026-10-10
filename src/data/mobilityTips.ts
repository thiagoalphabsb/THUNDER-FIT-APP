export type MobilityCategory = 'all' | 'quadris' | 'joelhos' | 'ombros' | 'tornozelos' | 'coluna';

export interface MobilityTip {
  id: string;
  title: string;
  category: 'quadris' | 'joelhos' | 'ombros' | 'tornozelos' | 'coluna';
  categoryLabel: string;
  targetBenefit: string;
  idealFor: string;
  suggestedProtocol: string;
  defaultTimerSeconds?: number;
  steps: string[];
  proTip: string;
  commonMistakes: string[];
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
}

export const MOBILITY_CATEGORIES: { id: MobilityCategory; label: string; iconName: string; count?: number }[] = [
  { id: 'all', label: 'Todas as Dicas', iconName: 'Sparkles' },
  { id: 'quadris', label: 'Quadris', iconName: 'Layers' },
  { id: 'joelhos', label: 'Joelhos', iconName: 'Zap' },
  { id: 'ombros', label: 'Ombros & Escápulas', iconName: 'Shield' },
  { id: 'tornozelos', label: 'Tornozelos', iconName: 'Flame' },
  { id: 'coluna', label: 'Coluna & Postura', iconName: 'Activity' }
];

export const MOBILITY_TIPS_DATA: MobilityTip[] = [
  // QUADRIS
  {
    id: 'mob-quadril-90-90',
    title: 'Transição 90/90 (90/90 Hip Flow)',
    category: 'quadris',
    categoryLabel: 'Quadris',
    targetBenefit: 'Rotação interna e externa da cabeça do fêmur na cavidade acetabular.',
    idealFor: 'Antes de agachamento livre, leg press e terra sumo.',
    suggestedProtocol: '2 séries de 8 a 10 transições controladas por lado.',
    steps: [
      'Sente-se no chão com uma perna flexionada à frente em ângulo de 90° e a outra flexionada atrás em 90°.',
      'Mantenha a coluna ereta e o peito aberto, sem curvar a lombar.',
      'Gire os dois joelhos para o lado oposto sem tirar os calcanhares do solo.',
      'Incline suavemente o tronco sobre a coxa da frente em cada troca para sentir o glúteo.'
    ],
    proTip: 'Se não conseguir manter as mãos fora do chão, apoie as palmas atrás do quadril para manter a coluna alinhada.',
    commonMistakes: ['Arredondar a coluna torácica', 'Fazer o movimento com pressa ou impulso'],
    difficulty: 'Iniciante'
  },
  {
    id: 'mob-quadril-couch',
    title: 'Couch Stretch (Alongamento no Sofá/Parede)',
    category: 'quadris',
    categoryLabel: 'Quadris',
    targetBenefit: 'Liberação profunda do reto femoral e psoas maior (flexores do quadril).',
    idealFor: 'Pessoas que passam muito tempo sentadas e quem sente a lombar puxar no agachamento.',
    suggestedProtocol: '2 séries de 45 a 60 segundos por perna.',
    defaultTimerSeconds: 45,
    steps: [
      'Ajoelhe-se de costas para uma parede ou banco, com a canela encostada na vertical.',
      'Dê um passo à frente com a outra perna em posição de avanço (90°).',
      'Contraia ativamente o glúteo da perna de trás e eleve o tronco na vertical.',
      'Sinta o alongamento intenso na parte anterior da coxa e quadril.'
    ],
    proTip: 'A chave deste exercício é a retroversão pélvica: "encaixe o quadril para dentro" e contraia o abdômen.',
    commonMistakes: ['Hiperextender a coluna lombar para tentar ficar reto', 'Não contrair o glúteo'],
    difficulty: 'Intermediário'
  },
  {
    id: 'mob-quadril-sapinho',
    title: 'Frog Stretch (Alongamento do Sapo)',
    category: 'quadris',
    categoryLabel: 'Quadris',
    targetBenefit: 'Abertura profunda de adutores e cápsula articular inferior do quadril.',
    idealFor: 'Agachamentos com base mais aberta, sumô e amplitude pélvica.',
    suggestedProtocol: '2 séries de 45 segundos com pequenos balanços suaves frente-trás.',
    defaultTimerSeconds: 45,
    steps: [
      'Em 4 apoios sobre um colchonete macio, afaste os joelhos o máximo que conseguir confortavelmente.',
      'Dobre os joelhos a 90° com as bordas internas dos pés apoiadas no chão.',
      'Apoie os antebraços no solo mantendo as costas retas.',
      'Desloque o quadril suavemente para trás em direção aos calcanhares até sentir a virilha.'
    ],
    proTip: 'Respire fundo pelo nariz e solte pela boca ao projetar o quadril para trás, permitindo que os músculos relaxem.',
    commonMistakes: ['Deixar os joelhos escorregarem sem controle', 'Arredondar a lombar em excesso'],
    difficulty: 'Intermediário'
  },

  // JOELHOS
  {
    id: 'mob-joelho-tibialis',
    title: 'Elevação Tibial na Parede (Tibialis Raises)',
    category: 'joelhos',
    categoryLabel: 'Joelhos',
    targetBenefit: 'Fortalecimento do tibial anterior, absorção de impacto patelar e desaceleração.',
    idealFor: 'Prevenção de dor patelar (joelho de saltador) e canelite.',
    suggestedProtocol: '2 a 3 séries de 15 a 20 repetições com contração no topo.',
    steps: [
      'Encoste as costas e os glúteos em uma parede lisa.',
      'Posicione os calcanhares cerca de 30 a 40cm à frente da parede.',
      'Com as pernas estendidas, puxe a ponta dos pés para cima em direção às canelas.',
      'Segure 1 segundo no topo sentindo a musculatura da frente da canela queimar, e desça controlado.'
    ],
    proTip: 'Quanto mais longe os pés estiverem da parede, mais difícil e eficiente fica o exercício.',
    commonMistakes: ['Dobrar os joelhos durante a elevação', 'Bater os pés no chão sem controlar a descida'],
    difficulty: 'Iniciante'
  },
  {
    id: 'mob-joelho-step-down',
    title: 'Poliquin Step-Up / Toque de Calcanhar',
    category: 'joelhos',
    categoryLabel: 'Joelhos',
    targetBenefit: 'Ativação e vascularização do VMO (Vasto Medial Oblíquo) e tendão patelar.',
    idealFor: 'Aquecimento específico antes de agachamentos pesados ou hack squat.',
    suggestedProtocol: '2 séries de 12 a 15 repetições lentas por perna (com calcanhar elevado).',
    steps: [
      'Fique de pé em cima de uma anilha ou degrau de 10 a 15cm.',
      'Eleve o calcanhar da perna de apoio (ou coloque uma pequena cunha sob ele).',
      'Desça lentamente projetando o joelho à frente sobre os dedos dos pés até o outro calcanhar roçar no chão.',
      'Empurre o solo com a perna de apoio para subir sem pegar impulso com o pé livre.'
    ],
    proTip: 'Mantenha o tronco o mais vertical possível para isolar a extensão do joelho e o quadríceps perto da patela.',
    commonMistakes: ['Empurrar o chão com o pé que desce', 'Deixar o joelho colapsar para dentro (valgo dinâmico)'],
    difficulty: 'Intermediário'
  },

  // OMBROS & ESCÁPULAS
  {
    id: 'mob-ombro-pass-through',
    title: 'Passagem com Bastão ou Elástico (Dislocates)',
    category: 'ombros',
    categoryLabel: 'Ombros & Escápulas',
    targetBenefit: 'Extensão, rotação e descompressão da cápsula glenoumeral e peitoral.',
    idealFor: 'Pré-treino de Peito, Ombros e Costas.',
    suggestedProtocol: '2 séries de 10 a 12 passagens lentas e contínuas.',
    steps: [
      'Segure um bastão de PVC, cabo de vassoura ou elástico com pegada bem aberta.',
      'Com os braços estendidos, passe o bastão por cima da cabeça até tocar atrás das costas.',
      'Retorne pelo mesmo caminho sem dobrar os cotovelos.',
      'Conforme a mobilidade melhorar, feche ligeiramente a pegada.'
    ],
    proTip: 'Não empurre a cabeça para frente nem arqueie a lombar: trave o abdômen e mova apenas os ombros.',
    commonMistakes: ['Dobrar um cotovelo para forçar a passagem', 'Pegar muito fechado no início'],
    difficulty: 'Iniciante'
  },
  {
    id: 'mob-ombro-toracica',
    title: 'Rotação Torácica em 4 Apoios (Thread the Needle)',
    category: 'ombros',
    categoryLabel: 'Ombros & Escápulas',
    targetBenefit: 'Mobilidade da coluna torácica e alívio de tensão nos romboides e trapézio.',
    idealFor: 'Melhora de postura no supino, desenvolvimento com halteres e remadas.',
    suggestedProtocol: '2 séries de 8 rotações para cada lado com pausa de 2s no ápice.',
    steps: [
      'Fique na posição de 4 apoios com os joelhos abaixo dos quadris e mãos abaixo dos ombros.',
      'Coloque uma mão atrás da cabeça ou na nuca.',
      'Gire o cotovelo para baixo em direção ao braço de apoio e, em seguida, abra o peito girando o cotovelo para o teto.',
      'Acompanhe o movimento com o olhar e segure 2 segundos no topo.'
    ],
    proTip: 'Tente manter o quadril imóvel; todo o movimento de rotação deve vir da parte média e alta das costas.',
    commonMistakes: ['Girar o quadril junto com o tronco', 'Mover apenas o braço sem girar a caixa torácica'],
    difficulty: 'Iniciante'
  },
  {
    id: 'mob-ombro-ytwl',
    title: 'Ativação Escapular Y-T-W-L no Solo',
    category: 'ombros',
    categoryLabel: 'Ombros & Escápulas',
    targetBenefit: 'Ativação dos depressores escapulares, trapézio inferior e manguito rotador.',
    idealFor: 'Estabilidade máxima para supino pesado, overhead press e prevenção de impacto subacromial.',
    suggestedProtocol: '1 a 2 séries de 6 a 8 repetições em cada formato de letra (Y, T, W, L).',
    steps: [
      'Deite-se de bruços no chão com a testa apoiada em um colchonete ou toalha.',
      'Posicione os braços no formato de "Y" com os polegares apontados para o teto e erga os braços comprimindo as escápulas.',
      'Alterne para o formato "T" (braços abertos a 90°), "W" (cotovelos dobrados puxados para as costelas) e "L".',
      'Em cada posição, segure 2 segundos no topo focando no aperto entre as escápulas.'
    ],
    proTip: 'Não use impulso da lombar; levante os braços usando apenas a musculatura ao redor das escápulas.',
    commonMistakes: ['Encolher os ombros em direção às orelhas', 'Tirar o tronco do chão usando a lombar'],
    difficulty: 'Intermediário'
  },

  // TORNOZELOS
  {
    id: 'mob-tornozelo-parede',
    title: 'Mobilidade de Tornozelo na Parede (Knee to Wall)',
    category: 'tornozelos',
    categoryLabel: 'Tornozelos',
    targetBenefit: 'Ganho de dorsiflexão tibial e alívio da pressão no tendão de Aquiles.',
    idealFor: 'Permitir agachar fundo sem que o calcanhar levante e sem jogar o tronco excessivamente para frente.',
    suggestedProtocol: '2 séries de 12 repetições dinâmicas por perna com 3s de pressão no final.',
    steps: [
      'Fique de frente para uma parede a cerca de 8 a 10cm de distância com um pé à frente.',
      'Mantenha o calcanhar da frente colado no chão o tempo todo.',
      'Projete o joelho para frente em linha reta até tocar a parede sem erguer o calcanhar.',
      'Retorne e repita, tentando aos poucos afastar o pé mais 1cm da parede.'
    ],
    proTip: 'Garanta que o joelho passe por cima do segundo ou terceiro dedo do pé, sem desabar para dentro.',
    commonMistakes: ['Tirar o calcanhar do chão', 'Deixar o joelho colapsar para a parte interna do pé'],
    difficulty: 'Iniciante'
  },
  {
    id: 'mob-tornozelo-elastico',
    title: 'Dorsiflexão com Tração Elástica (Banded Distraction)',
    category: 'tornozelos',
    categoryLabel: 'Tornozelos',
    targetBenefit: 'Deslizamento posterior do tálus na articulação tibiotársica.',
    idealFor: 'Quem sente um "bloqueio" ou "pinçamento" na frente do tornozelo ao agachar.',
    suggestedProtocol: '2 séries de 40 a 60 segundos com movimentos de bombeamento.',
    defaultTimerSeconds: 45,
    steps: [
      'Prenda um elástico superband em um ponto fixo baixo atrás de você.',
      'Coloque a alça do elástico abaixo dos maléolos (bem na dobra do tornozelo, sobre o tálus).',
      'Ajoelhe-se em posição de avanço com o elástico tracionando o tornozelo para trás.',
      'Leve o joelho à frente mantendo o calcanhar firme no chão enquanto o elástico cria espaço na articulação.'
    ],
    proTip: 'O elástico deve ficar abaixo dos ossos laterais do tornozelo, nunca na canela, para tracionar o osso correto.',
    commonMistakes: ['Colocar o elástico alto demais na canela', 'Usar um elástico muito fraco sem tração suficiente'],
    difficulty: 'Intermediário'
  },

  // COLUNA & POSTURA
  {
    id: 'mob-coluna-gato-camelo',
    title: 'Gato e Camelo (Cat-Cow Flow)',
    category: 'coluna',
    categoryLabel: 'Coluna & Postura',
    targetBenefit: 'Segmentação e lubrificação de toda a coluna vertebral (cervical, torácica e lombar).',
    idealFor: 'Alívio matinal, descompressão pós-treino ou preparação para levantamento terra e agachamento.',
    suggestedProtocol: '2 séries de 8 a 10 ciclos respiratórios lentos.',
    steps: [
      'Posicione-se em 4 apoios com as mãos sob os ombros e joelhos sob os quadris.',
      'Inspire profundamente, empurre o abdômen suavemente para baixo, olhe para frente e eleve o cóccix (posição da Vaca).',
      'Expire lentamente, empurre o chão com as mãos, arredonde as costas para o teto e leve o queixo ao peito (posição do Gato).',
      'Mova vértebra por vértebra com ritmo calmo e respiração fluida.'
    ],
    proTip: 'Sinta cada segmento da coluna mover-se individualmente, como uma onda suave.',
    commonMistakes: ['Fazer o movimento rápido e sem sincronia com a respiração', 'Travar os cotovelos com força excessiva'],
    difficulty: 'Iniciante'
  },
  {
    id: 'mob-coluna-world-greatest',
    title: 'O Maior Alongamento do Mundo (World\'s Greatest Stretch)',
    category: 'coluna',
    categoryLabel: 'Coluna & Postura',
    targetBenefit: 'Integração de mobilidade de quadril, rotação torácica, flexores e posteriores em um só exercício.',
    idealFor: 'Aquecimento geral dinâmico de 3 minutos antes de qualquer treino de corpo inteiro ou pernas.',
    suggestedProtocol: '2 séries de 5 a 6 repetições completas por lado.',
    steps: [
      'Dê um passo longo à frente em posição de afundo com as duas mãos apoiadas no chão ao lado do pé da frente.',
      'Tente aproximar o cotovelo de dentro do chão próximo ao tornozelo.',
      'Gire o tronco e estenda o braço em direção ao teto, acompanhando a mão com os olhos.',
      'Retorne a mão ao chão, estenda os joelhos e empurre o quadril para cima para alongar os posteriores da coxa.'
    ],
    proTip: 'Excelente rotina rápida para quando você tem pouco tempo para aquecer antes de entrar na academia.',
    commonMistakes: ['Não alongar os posteriores na fase final', 'Perder o equilíbrio ao girar o braço'],
    difficulty: 'Avançado'
  }
];
