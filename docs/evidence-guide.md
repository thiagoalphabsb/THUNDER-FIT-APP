# THUNDER — Guia de demonstração e evidências

Este guia descreve capturas recomendadas para apresentar o aplicativo em um portfólio. Registre apenas telas reais da versão testada; não use mockups como se fossem funcionalidades implementadas.

## Capturas recomendadas

Salvar os arquivos em `docs/evidence/` ou em uma pasta `screenshots/` na raiz (escolha um único local e mantenha-o consistente):

1. `01-dashboard-overview.png` — tela inicial/dashboard com visão geral do aplicativo.
2. `02-workout-active-session.png` — sessão de treino em andamento, mostrando exercícios e séries.
3. `03-rest-timer.png` — temporizador de descanso funcionando.
4. `04-routines-management.png` — lista de rotinas e opções de gerenciamento.
5. `05-exercise-library.png` — biblioteca de exercícios e detalhes de um exercício.
6. `06-progress-history.png` — histórico de treinos ou gráficos de progresso com dados fictícios.
7. `07-profile-settings.png` — perfil e configurações, ocultando dados pessoais.
8. `08-mobile-responsive.png` — interface em viewport de celular.
9. `09-pwa-installation.png` — instalação/execução como PWA, somente se for possível demonstrar no navegador usado.
10. `10-validation-checklist.png` — opcional: checklist de testes concluídos, sem expor informações privadas.

## Como gerar uma demonstração

1. Execute a aplicação no ambiente que você já usa para testar.
2. Use uma conta de demonstração e dados fictícios; nunca capture credenciais, e-mails pessoais, tokens, chaves de API ou dados reais de saúde.
3. Faça uma gravação curta, de 60 a 120 segundos, mostrando uma sequência real: abrir dashboard → abrir rotina → iniciar treino → registrar uma série → mostrar o timer → consultar histórico/progresso.
4. Para capturas estáticas, use a ferramenta de captura do sistema ou do navegador. No Chrome/Edge, abra as ferramentas de desenvolvedor e alterne para a visualização responsiva para registrar a experiência mobile.
5. Corte áreas irrelevantes e confira legibilidade. Não altere a imagem de forma que faça uma função parecer funcionar se ela não funciona.
6. Abra cada PNG antes de publicar e confirme que não há informações sensíveis.
7. Atualize o README com links relativos, por exemplo: `![Dashboard](docs/evidence/01-dashboard-overview.png)`, depois que a imagem existir no repositório.

## Checklist de validação manual

- [ ] Dashboard abre sem erro.
- [ ] Rotinas e exercícios podem ser consultados.
- [ ] Fluxo de treino e registro de séries foi exercitado.
- [ ] Timer inicia, pausa/termina conforme esperado.
- [ ] Histórico e progresso exibem os dados esperados.
- [ ] Layout foi conferido em desktop e celular.
- [ ] Fluxos de autenticação e persistência foram testados, se estiverem habilitados no ambiente.
- [ ] Console do navegador e logs do servidor foram revisados.
- [ ] Nenhum segredo, token ou dado pessoal aparece nas capturas.

**Importante:** as imagens são uma etapa de evidência futura; esta documentação não afirma que os testes acima já foram executados.