# ⚡ THUNDER — Workout & Strength Tracker PWA

<div align="center">

![THUNDER Banner](https://img.shields.io/badge/THUNDER-Strength%20%26%20Hypertrophy%20Tracker-00e5c0?style=for-the-badge&logo=lightning&logoColor=black)

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75C2?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-blueviolet?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![Security Audited](https://img.shields.io/badge/AppSec-Hardened-00e5c0?style=flat-square&logo=shield&logoColor=black)](#-seguran%C3%A7a-e-auditoria-appsec)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br />

**Aplicativo progressivo de musculação, sobrecarga progressiva e periodização inteligente com assistente Strength Coach alimentado por Gemini AI, estética dark premium e arquitetura offline-first sincronizada na nuvem.**

[Demonstração](#-vis%C3%A3o-geral) • [Funcionalidades](#-funcionalidades) • [Segurança (AppSec)](#-seguran%C3%A7a-e-auditoria-appsec) • [Como Rodar](#-como-rodar-localmente) • [Variáveis de Ambiente](#-vari%C3%A1veis-de-ambiente) • [Arquitetura](#-arquitetura-do-projeto)

</div>

---

## 📖 Visão Geral

O **THUNDER** foi desenvolvido para atletas, praticantes sérios de musculação e entusiastas de hipertrofia que precisam de um acompanhamento preciso de cada série, repetição e sobrecarga progressiva, sem atrito ou interfaces lentas.

Combinando uma interface **Offline-First** ultraveloz com a capacidade analítica da **Google Gemini 2.5 Flash**, o app fornece feedback biométrico e recomendações personalizadas de volume, fadiga (RPE/RIR) e cálculo em tempo real de **1RM (One-Rep Max)**.

### 🌟 Destaques do Projeto
- 📱 **PWA (Progressive Web App)**: Instalável no Android, iOS e Desktop com suporte a notificações e funcionamento offline.
- 🎨 **Estética Visual Premium**: Tema Obsidian Dark (`#07080a`) com acentos em Tiffany Cyan (`#00e5c0`), tipografia combinada *Outfit* e *JetBrains Mono*.
- 🤖 **Gemini Strength Coach**: Backend inteligente que analisa histórico recente de treinos, detecta grupos musculares atrasados e calcula o balanço ideal de volume de séries.
- ⏱️ **Timer de Descanso Avançado**: Cronômetro com Web Audio API (síntese sonora sem assets externos), vibração tátil e Service Worker de segundo plano para disparar mesmo com a tela do celular apagada.
- 🔒 **Blindagem de Segurança (AppSec)**: Protegido contra vulnerabilidades de injeção, DoS, vazamento de credenciais e ataques comuns na web.

---

### 📱 Demonstração em Tempo Real

| Dashboard & Navegação | Sessão de Treino & Temporizador |
| :---: | :---: |
| <img src="https://raw.githubusercontent.com/thiagoalphabsb/cybersecurity-portfolio/main/projects/evidences/01-dashboard-flow.gif" width="280" alt="Dashboard" /> | <img src="https://raw.githubusercontent.com/thiagoalphabsb/cybersecurity-portfolio/main/projects/evidences/02-workout-timer.gif" width="280" alt="Timer" /> |

---

## ⚡ Funcionalidades

### 1. Execução de Treino em Tempo Real
- **Registro Preciso**: Cargas, repetições, RPE (Esforço Percebido) e tipos de séries (Aquecimento, Trabalho, Drop-set, Até a Falha).
- **Sobrecarga Progressiva Visual**: Consulta rápida de qual foi a última carga e repetições executadas no treino anterior do mesmo exercício.
- **Detecção Automática de Recordes (PR)**: Identificação instantânea de recorde de carga ou 1RM estimado (fórmulas de *Brzycki* e *Epley*).
- **Adição Rápida & Substituição**: Inclua novos exercícios ou ajuste a ordem da ficha em pleno andamento do treino.

### 2. Timer de Descanso com Execução em Segundo Plano
- Controles de atalho rápido (+30s, +60s, +90s, +120s, customizado).
- **Service Worker dedicado (`sw.js`)**: Mantém a contagem de descanso ativa mesmo se o app for minimizado ou a tela bloquear.
- **Feedback Multimodal**: Alertas sonoros sintetizados via Web Audio API e vibração via Vibration API.

### 3. Inteligência Artificial: Gemini Strength Coach
- **Análise de Tendência de Volume**: Avaliação do volume semanal por grupo muscular (Peito, Costas, Quadríceps, etc.).
- **Diagnóstico de Recuperação**: Alerta de sobretreinamento (overreaching/overtraining) ou subtreinamento com sugestões de ajuste de séries antes da próxima sessão.
- **Modo Resiliente / Offline**: Mecanismo de fallback que garante funcionamento pleno e sem quebras caso a chave de IA não esteja configurada ou o dispositivo esteja sem internet.

### 4. Gestão de Fichas e Biblioteca de Exercícios
- Fichas modulares customizáveis (ex.: ABC, ABCDE, Upper/Lower, Push/Pull/Legs).
- Biblioteca completa de exercícios com instruções de execução, músculos ativados primários/secundários e dicas de mobilidade articular.
- Construtor intuitivo de novos exercícios e rotinas.

### 5. Analytics, Métricas e Gamificação
- **Gráficos de Evolução Interativos**: Histórico de volume e carga máxima por grupo muscular com Recharts.
- **Rastreador de Cardio Integrado**: Registro de corridas, esteira, bike e HIIT com tempo, distância, calorias estimadas e FC média.
- **Conquistas & Badges**: Desbloqueio de medalhas por consistência, tonelagem levantada e recordes batidos.
- **Thunder Wrapped Mensal**: Retrospectiva mensal estilo "Wrapped" com cartão compartilhável gerado dinamicamente para redes sociais.
- **Beach Rest Day**: Tela de dia de descanso ativo com dicas de recuperação, alongamento e hidratação.

### 6. Armazenamento Híbrido & Sincronização
- **Offline-First Local**: Funciona 100% de imediato via LocalStorage.
- **Backup e Restauração JSON**: Exportação e importação de dados com higienização estrita contra arquivos corrompidos ou maliciosos.
- **Sincronização na Nuvem**: Suporte a Firebase Firestore e Firebase Auth (Google Sign-In e login anônimo) com regras de segurança ativas.

---

## 🛡️ Segurança e Auditoria AppSec

Este repositório foi submetido a uma auditoria de segurança rigorosa de pré-publicação para garantir conformidade com as melhores práticas de desenvolvimento corporativo e repositórios abertos no GitHub:

| Camada | Medida de Segurança Implementada |
| :--- | :--- |
| **Credenciais & Segredos** | Nenhum segredo ou chave privada hardcoded no código-fonte. Configurações sensíveis são carregadas exclusivamente via variáveis de ambiente (`.env`). |
| **Versionamento Seguro** | `.gitignore` configurado para impedir o rastreio de credenciais reais (`firebase-applet-config.json`, `.env*`), fornecendo apenas templates higienizados (`.env.example` e `firebase-applet-config.example.json`). |
| **Proteção de Headers** | Middleware **Helmet** ativo com `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy: no-referrer`, `X-Download-Options: noopen` e remoção de identificadores do servidor (`app.disable('x-powered-by')`). |
| **Mitigação de DoS / Brute-Force** | **Express Rate Limit** configurado em todas as rotas `/api/*` (30 requisições/min por IP) e limite de corpo JSON restrito a 256 KB. |
| **Sanitização de Dados** | Validação estrita de tipos e estruturas de arrays antes de processar no backend. Prevenção de prototype pollution e injeções no importador de backup. |
| **Isolamento de Banco de Dados** | Regras de segurança do Firestore (`firestore.rules`) configuradas com controle granular de acesso (RBAC por documento): apenas o próprio usuário autenticado pode ler ou gravar seus próprios dados (`request.auth.uid == userId`). |
| **Auditoria de Pacotes** | Dependências vulneráveis atualizadas (incluindo mitigação de CVEs conhecidas em `proxy-addr`). |

---

## 🛠️ Stack Tecnológica

- **Frontend**:
  - [React 19](https://react.dev/) — Interface declarativa em componentes funcionais modernos
  - [TypeScript 5.8](https://www.typescriptlang.org/) — Tipagem estática rigorosa
  - [Vite 6.2](https://vitejs.dev/) — Bundler e ambiente de desenvolvimento ultrarrápido
  - [Tailwind CSS 4.1](https://tailwindcss.com/) — Estilização utilitária de alta performance
  - [Lucide React](https://lucide.dev/) — Pacote de ícones SVG consistentes
  - [Recharts 3.10](https://recharts.org/) — Gráficos vetoriais de métricas e volume
  - [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) — Feedback visual ao concluir treinos e conquistas
- **Backend & APIs**:
  - [Node.js](https://nodejs.org/) & [Express 4.21](https://expressjs.com/) — Servidor de API e proxy seguro para IA
  - [Google Gen AI SDK (@google/genai)](https://ai.google.dev/) — Integração com Gemini 2.5 Flash
  - [Helmet](https://helmetjs.github.io/) & [express-rate-limit](https://express-rate-limit.mintlify.app/) — Proteção de borda e mitigação de abusos
- **Banco de Dados & Autenticação**:
  - [Firebase Firestore](https://firebase.google.com/docs/firestore) — Armazenamento distribuído NoSQL em tempo real
  - [Firebase Authentication](https://firebase.google.com/docs/auth) — Gestão de identidade com provedores seguros
- **Recursos Nativos & PWA**:
  - Service Workers, Web Audio API, Vibration API, Web Manifest

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js** v18+ instalado ([Download Node.js](https://nodejs.org/))
- **npm**, **pnpm** ou **yarn** instalado

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/thunder-workout-tracker.git
   cd thunder-workout-tracker
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Copie o arquivo de exemplo para criar seu `.env`:
   ```bash
   cp .env.example .env
   ```
   Abra o arquivo `.env` e configure sua chave da Gemini API:
   ```env
   PORT=3000
   GEMINI_API_KEY=AIzaSy_SuaChaveDoGoogleAIStudioAqui
   ```
   *(Opcional: Obtenha sua chave gratuita em [aistudio.google.com](https://aistudio.google.com/))*.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000).

---

## 🔑 Variáveis de Ambiente

O arquivo `.env.example` contém o modelo com todas as variáveis aceitas pelo projeto:

| Variável | Obrigatória | Onde é utilizada | Descrição |
| :--- | :---: | :--- | :--- |
| `PORT` | Não | Servidor (Express) | Porta na qual o servidor HTTP é executado (padrão: `3000`). |
| `GEMINI_API_KEY` | Recomendada | Servidor (Express) | Chave de acesso à API Google Gemini para o Strength Coach. *(Nunca exposta ao cliente)*. |
| `VITE_FIREBASE_API_KEY` | Opcional | Cliente (Vite/Browser) | Chave web do projeto Firebase para autenticação e nuvem. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Opcional | Cliente (Vite/Browser) | Domínio de autenticação do Firebase. |
| `VITE_FIREBASE_PROJECT_ID` | Opcional | Cliente (Vite/Browser) | ID do projeto no Google Cloud / Firebase. |
| `VITE_FIREBASE_STORAGE_BUCKET`| Opcional | Cliente (Vite/Browser) | Bucket de storage do Firebase. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Opcional | Cliente (Vite/Browser) | ID do remetente de mensagens do Firebase. |
| `VITE_FIREBASE_APP_ID` | Opcional | Cliente (Vite/Browser) | ID da aplicação Web no Firebase. |

> **Nota sobre o Firebase:** O aplicativo possui modo autônomo offline-first. Se nenhuma credencial do Firebase for preenchida, o sistema continuará operando normalmente utilizando o LocalStorage persistente do navegador.

---

## 🏗️ Arquitetura do Projeto

```text
├── public/
│   ├── favicon.svg             # Ícone vetorial da marca Thunder
│   ├── manifest.json           # Manifesto PWA com cores de tema e ícones
│   └── sw.js                   # Service Worker para alertas do timer em segundo plano
├── src/
│   ├── components/             # Componentes modulares da interface
│   │   ├── ActiveWorkout.tsx   # Painel de execução e registro do treino ao vivo
│   │   ├── DashboardView.tsx   # Visão geral de métricas, treinos do dia e atalhos
│   │   ├── HistoryView.tsx     # Linha do tempo de treinos e detalhes de sessões
│   │   ├── ProgressView.tsx    # Gráficos de volume, 1RM e consistência semanal
│   │   ├── RoutinesView.tsx    # Gerenciador e editor de rotinas e fichas
│   │   ├── ExercisesView.tsx   # Catálogo completo de exercícios anatômicos
│   │   ├── CardioSection.tsx   # Rastreador e histórico de atividades de cardio
│   │   ├── RestTimerOverlay.tsx# Interface flutuante do cronômetro de descanso
│   │   ├── StrengthCoachCard.tsx# Cartão com diagnósticos gerados pelo Gemini AI
│   │   ├── MonthlyWrappedModal.tsx # Retrospectiva mensal estilo "Wrapped"
│   │   ├── ProfileView.tsx     # Perfil, gerenciamento de conta, backup e nuvem
│   │   └── ...
│   ├── data/                   # Fichas pré-definidas, dados anatômicos e dicas
│   ├── lib/
│   │   └── firebase.ts         # Inicializador do Firebase com resolução segura de config
│   ├── services/
│   │   └── dbService.ts        # Camada de abstração e sincronização do Firestore
│   ├── utils/
│   │   ├── audio.ts            # Síntese sonora via Web Audio API
│   │   ├── backgroundTimer.ts  # Ponte de controle com Service Worker
│   │   ├── calc.ts             # Cálculos de 1RM (Epley/Brzycki), tonelagem e volume
│   │   ├── storage.ts          # Camada de persistência local e importador seguro
│   │   └── vibrationWrapper.ts # Wrapper tátil para a Vibration API
│   ├── types.ts                # Definições completas de tipos TypeScript
│   ├── index.css               # Estilos globais e importações do Tailwind CSS 4
│   └── main.tsx                # Ponto de entrada React do cliente
├── .env.example                # Template público documentado de variáveis de ambiente
├── firebase-applet-config.example.json # Template higienizado de configuração Firebase
├── firestore.rules             # Regras de segurança RBAC para o Firestore
├── server.ts                   # Servidor Express com Helmet, Rate Limit e rotas Gemini
└── vite.config.ts              # Configuração do Vite com plugin do Tailwind CSS
```

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento (Express + Vite integrado) em `http://localhost:3000`. |
| `npm run build` | Compila os arquivos TypeScript e empacota os assets otimizados para produção na pasta `dist/`. |
| `npm run start` | Executa o servidor Node/Express em modo de produção. |
| `npm run preview` | Inicializa uma pré-visualização local da compilação de produção do Vite. |
| `npm run lint` | Executa a verificação estática de tipos do TypeScript sem emitir arquivos (`tsc --noEmit`). |

---

## 🌐 Deploy em Produção

O projeto pode ser hospedado com facilidade em plataformas modernas de nuvem:

### Opção 1: Vercel / Render / Railway (Fullstack)
1. Conecte seu repositório no dashboard da plataforma escolhida.
2. Defina os scripts:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
3. Configure as variáveis de ambiente (`GEMINI_API_KEY` e, se desejar, as variáveis `VITE_FIREBASE_*`).

### Opção 2: Firebase Hosting
Se desejar implantar as regras de segurança do Firestore:
```bash
firebase deploy --only firestore:rules
```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.

---

<div align="center">
  <sub>Construído com foco em alta performance, segurança de software e design centrado no atleta.</sub>
</div>
