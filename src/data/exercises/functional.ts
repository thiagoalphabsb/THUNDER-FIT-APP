import { Exercise } from '../../types';

export const FUNCTIONAL_EXERCISES: Exercise[] = [
  {
    id: 'burpee-completo-com-salto',
    name: 'Burpee Completo com Flexão e Salto',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Quadríceps', 'Ombros', 'Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Em pé, agache e apoie as mãos no chão.',
      'Jogue os pés para trás em prancha e execute uma flexão encostando o peito no chão.',
      'Puxe os pés de volta para perto das mãos e salte verticalmente batendo palmas acima da cabeça.'
    ]
  },
  {
    id: 'kettlebell-snatch-arranco',
    name: 'Kettlebell Snatch (Arranco Unilateral com Kettlebell)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Ombros', 'Posteriores', 'Glúteos', 'Trapézio'],
    equipment: 'Kettlebell',
    defaultRestSeconds: 90,
    instructions: [
      'Balance o kettlebell entre as pernas e puxe explosivamente em um movimento único até travar acima da cabeça com o braço estendido.'
    ]
  },
  {
    id: 'kettlebell-clean-and-press-arremesso',
    name: 'Kettlebell Clean and Press (Arremesso e Desenvolvimento)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Costas', 'Posteriores', 'Tríceps'],
    equipment: 'Kettlebell',
    defaultRestSeconds: 90,
    instructions: [
      'Puxe o kettlebell do chão para a posição de rack no ombro e empurre acima da cabeça com impulsão das pernas.'
    ]
  },
  {
    id: 'thruster-com-halteres-ou-barra',
    name: 'Thruster com Halteres / Barra (Agachamento + Desenvolvimento)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Ombros', 'Glúteos', 'Tríceps'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Segure os halteres nos ombros e realize um agachamento profundo.',
      'Suba com força explosiva e aproveite a impulsão para arremessar os halteres acima da cabeça em um único movimento fluido.'
    ]
  },
  {
    id: 'manmaker-com-halteres',
    name: 'Man Maker com Halteres (Flexão + Remada + Agachamento + Press)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Peito', 'Quadríceps', 'Ombros', 'Abdômen'],
    equipment: 'Halteres',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie os halteres no chão, faça uma flexão, reme com o braço direito e depois com o esquerdo.',
      'Puxe os pés à frente, faça um agachamento frontal e finalize com desenvolvimento acima da cabeça.'
    ]
  },
  {
    id: 'corda-naval-battle-ropes-ondas',
    name: 'Corda Naval (Battle Ropes - Ondas Alternadas)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Bíceps', 'Costas', 'Abdômen'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Segure as pontas das cordas navais em semi-agachamento.',
      'Bata os braços alternadamente para cima e para baixo gerando ondas contínuas de alta velocidade por 30 a 60 segundos.'
    ]
  },
  {
    id: 'box-jump-salto-na-caixa',
    name: 'Salto na Caixa Pliométrica (Box Jump)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Glúteos', 'Panturrilhas'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Fique em frente a uma caixa de 50cm a 75cm.',
      'Flexione os joelhos e salte com os dois pés aterrissando suavemente no topo da caixa com joelhos flexionados.',
      'Fique em pé ereto no topo e desça com cuidado.'
    ]
  },
  {
    id: 'turkish-get-up-levantamento-turco',
    name: 'Turkish Get-Up com Kettlebell / Halter (Levantamento Turco)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Abdômen', 'Glúteos', 'Quadríceps'],
    equipment: 'Kettlebell',
    defaultRestSeconds: 90,
    instructions: [
      'Deitado de costas segurando o kettlebell com um braço estendido para cima.',
      'Levante-se progressivamente até ficar em pé sem nunca abaixar ou dobrar o braço que sustenta o peso.',
      'Retorne deitado no chão pelo mesmo caminho passo a passo.'
    ]
  },
  {
    id: 'medicine-ball-slam-arremesso-no-chao',
    name: 'Slam com Medicine Ball no Chão',
    muscleGroup: 'Abdômen',
    secondaryMuscles: ['Costas', 'Ombros', 'Tríceps'],
    equipment: 'Outro',
    defaultRestSeconds: 45,
    instructions: [
      'Erga a medicine ball pesada (slam ball) com ambas as mãos acima da cabeça esticando todo o corpo.',
      'Arremesse a bola no chão com força máxima contraindo o abdômen e agachando para pegar o rebote.'
    ]
  },
  {
    id: 'remada-na-fita-trx-suspensa',
    name: 'Remada Invertida na Fita de Suspensão (TRX Low Row)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Rombóides'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Segure as manoplas do TRX com o corpo inclinado para trás.',
      'Puxe o peito em direção às mãos mantendo o corpo rígido como uma prancha.'
    ]
  },
  {
    id: 'flexao-no-trx-suspensao',
    name: 'Flexão de Braço no TRX (TRX Push-up)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Tríceps', 'Ombros', 'Abdômen'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Segure as manoplas do TRX com as mãos e incline o corpo para a frente.',
      'Execute as flexões controlando a instabilidade das fitas.'
    ]
  },
  {
    id: 'crucifixo-no-trx-fly',
    name: 'Crucifixo no TRX (TRX Chest Fly)',
    muscleGroup: 'Peito',
    secondaryMuscles: ['Ombros'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Abra os braços lateralmente sustentando o peso corporal nas fitas e feche contraindo o peitoral.'
    ]
  },
  {
    id: 'triceps-no-trx-extensao',
    name: 'Extensão de Tríceps no TRX',
    muscleGroup: 'Tríceps',
    secondaryMuscles: ['Abdômen'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Corpo inclinado à frente segurando o TRX.',
      'Flexione os cotovelos passando a cabeça à frente das mãos e empurre com os tríceps.'
    ]
  },
  {
    id: 'biceps-no-trx-rosca',
    name: 'Rosca Bíceps no TRX',
    muscleGroup: 'Bíceps',
    secondaryMuscles: ['Antebraço'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Incline o corpo para trás e flexione os cotovelos trazendo as mãos em direção à testa.'
    ]
  },
  {
    id: 'empurrar-treno-sled-push-prowler',
    name: 'Empurrar Trenó Pliométrico (Sled Push / Prowler)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Panturrilhas', 'Glúteos', 'Ombros'],
    equipment: 'Outro',
    defaultRestSeconds: 90,
    instructions: [
      'Apoie as mãos nas hastes verticais do trenó com carga.',
      'Empurre o trenó pelo chão em passos rápidos com forte impulsão de pernas por 20 a 40 metros.'
    ]
  },
  {
    id: 'puxar-treno-com-corda-sled-pull',
    name: 'Puxar Trenó com Corda (Sled Pull)',
    muscleGroup: 'Costas',
    secondaryMuscles: ['Bíceps', 'Posteriores', 'Antebraço'],
    equipment: 'Outro',
    defaultRestSeconds: 90,
    instructions: [
      'Sentado ou em pé, puxe a corda do trenó braçada por braçada até trazer o trenó até você.'
    ]
  },
  {
    id: 'polichinelo-jumping-jacks',
    name: 'Polichinelos (Jumping Jacks)',
    muscleGroup: 'Panturrilhas',
    secondaryMuscles: ['Ombros'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 30,
    instructions: [
      'Salte abrindo pernas e braços simultaneamente e feche de volta em ritmo contínuo.'
    ]
  },
  {
    id: 'corrida-estacionaria-joelhos-altos-high-knees',
    name: 'Corrida Estacionária com Joelhos Altos (High Knees)',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Panturrilhas', 'Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 45,
    instructions: [
      'Corra no mesmo lugar elevando os joelhos até a linha da cintura com alta cadência.'
    ]
  },
  {
    id: 'bear-crawl-caminhada-do-urso',
    name: 'Caminhada do Urso no Solo (Bear Crawl)',
    muscleGroup: 'Ombros',
    secondaryMuscles: ['Quadríceps', 'Abdômen'],
    equipment: 'Peso Corporal',
    defaultRestSeconds: 60,
    instructions: [
      'Posição de quatro apoios com joelhos a 5cm do chão.',
      'Caminhe para a frente e para trás mantendo as costas retas e o core travado.'
    ]
  },
  {
    id: 'agachamento-com-arremesso-de-bola-wall-ball',
    name: 'Wall Ball Shot com Medicine Ball',
    muscleGroup: 'Quadríceps',
    secondaryMuscles: ['Ombros', 'Glúteos'],
    equipment: 'Outro',
    defaultRestSeconds: 60,
    instructions: [
      'Agache segurando a medicine ball e suba arremessando a bola em um alvo a 3 metros de altura na parede, pegando-a na descida do próximo agachamento.'
    ]
  }
];
