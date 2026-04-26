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

> Este projeto foi migrado de Ionic React para Ionic Angular. A logica de dominio em `src/core` foi preservada, e a camada de UI/estado foi recriada em Angular.

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

- `src/app`: componentes Angular e servico de estado da aplicacao
- `src/core`: tipos, validacao, storage, utilitarios e regras de dominio
- `src/state`: reducer puro reaproveitado pela versao Angular
- `src/theme/variables.css`: tema visual e layouts dos jogadores
- `capacitor.config.ts`: configuracao nativa do app

## Observacoes

- A chave de storage foi alterada na migracao para Angular, entao dados locais da versao React nao sao reutilizados automaticamente.
- A pasta `android/` fica fora do Git por padrao e pode ser recriada/sincronizada com Capacitor.
