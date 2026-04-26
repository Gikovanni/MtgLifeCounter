# GK MTG Counter

Estrutura inicial em `Ionic + React + Capacitor` para um contador de vida offline-first.

## O que ja vem pronto

- Controle de vida por jogador
- Adicao e remocao de jogadores
- Nome por jogador
- Vida inicial configuravel
- Reset de partida
- Persistencia local com `localStorage`
- Estrutura modular para evoluir historico, timer, matches e exportacao

## Rodando

1. Instale dependencias:

```bash
npm install
```

2. Rode em desenvolvimento:

```bash
npm run dev
```

3. Gere o build web:

```bash
npm run build
```

4. Inicialize plataformas nativas quando quiser:

```bash
npx cap add android
npx cap add ios
```

## Estrutura

- `src/features/match`: estado e UI do contador de vida
- `src/theme`: tema visual inicial
- `capacitor.config.ts`: configuracao do app nativo

## Proximos passos recomendados

- Criar historico de alteracoes de vida
- Adicionar timer de partida
- Persistir historico de partidas e locais
- Implementar exportacao/importacao
