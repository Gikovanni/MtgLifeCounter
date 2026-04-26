# GK MTG Counter

Contador de vida para Magic: The Gathering feito com Ionic Angular e Capacitor.

## Funcionalidades

- Partidas offline com 2 a 6 jogadores
- Layout responsivo por quantidade de jogadores
- Controle de vida com botoes laterais
- Nome e imagem de background por jogador
- Tema claro/escuro
- Locais de partida
- Historico de alteracoes e partidas finalizadas
- Exportacao/importacao de backup JSON
- Exportacao CSV
- Build Android via Capacitor

## Stack

- Angular standalone
- Ionic Angular
- Capacitor 7
- TypeScript

> Projeto organizado como app Ionic + Angular + TypeScript, seguindo `architecture.md`.

## Rodando no navegador

Instale as dependencias:

```bash
npm install
```

Rode em desenvolvimento:

```bash
npm run dev
```

Gere o build web:

```bash
npm run build
```

## Android / APK

Requisitos:

- Android Studio com Android SDK instalado
- JDK 17 ou superior
- `ANDROID_HOME` ou `android/local.properties` apontando para o SDK

Sincronize o projeto Android:

```bash
npx cap sync android
```

Gere um APK debug:

```bash
cd android
.\gradlew.bat assembleDebug
```

Saida esperada:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Estrutura

- `src/app/core`: modelos, servicos, constantes e utilitarios de dominio
- `src/app/shared`: componentes reutilizaveis
- `src/app/features`: telas e modais por feature
- `src/theme/variables.scss`: tema visual e layouts dos jogadores
- `src/theme/app-theme.scss`: ponto de extensao do tema
- `capacitor.config.ts`: configuracao nativa do app

## Observacoes

- A pasta `android/` fica fora do Git por padrao e pode ser recriada/sincronizada com Capacitor.
