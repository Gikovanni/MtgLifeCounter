# ARCHITECTURE.md

# Magic Life Counter — Arquitetura e Estrutura de Pastas

## Objetivo

Este documento define uma arquitetura recomendada para um app Ionic + Angular + TypeScript de contador de vida para partidas de Magic/Card Games.


## Estrutura de pastas recomendada

```txt
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── player.model.ts
│   │   │   ├── match.model.ts
│   │   │   ├── location.model.ts
│   │   │   └── life-history.model.ts
│   │   │
│   │   ├── services/
│   │   │   ├── storage.service.ts
│   │   │   ├── match.service.ts
│   │   │   ├── player.service.ts
│   │   │   ├── location.service.ts
│   │   │   ├── export.service.ts
│   │   │   └── timer.service.ts
│   │   │
│   │   ├── constants/
│   │   │   └── storage-keys.ts
│   │   │
│   │   └── utils/
│   │       ├── date.util.ts
│   │       └── csv.util.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── player-life-card/
│   │   │   │   ├── player-life-card.component.ts
│   │   │   │   ├── player-life-card.component.html
│   │   │   │   └── player-life-card.component.scss
│   │   │   │
│   │   │   ├── action-toolbar/
│   │   │   │   ├── action-toolbar.component.ts
│   │   │   │   ├── action-toolbar.component.html
│   │   │   │   └── action-toolbar.component.scss
│   │   │   │
│   │   │   └── empty-state/
│   │   │       ├── empty-state.component.ts
│   │   │       ├── empty-state.component.html
│   │   │       └── empty-state.component.scss
│   │   │
│   │   ├── pipes/
│   │   │   └── duration.pipe.ts
│   │   │
│   │   └── shared.module.ts
│   │
│   ├── features/
│   │   ├── match/
│   │   │   ├── pages/
│   │   │   │   ├── match-counter/
│   │   │   │   ├── match-setup/
│   │   │   │   └── match-finish/
│   │   │   │
│   │   │   └── match-routing.module.ts
│   │   │
│   │   ├── history/
│   │   │   ├── pages/
│   │   │   │   ├── match-history/
│   │   │   │   └── match-details/
│   │   │   │
│   │   │   └── history-routing.module.ts
│   │   │
│   │   ├── locations/
│   │   │   ├── pages/
│   │   │   │   ├── location-list/
│   │   │   │   └── location-form/
│   │   │   │
│   │   │   └── locations-routing.module.ts
│   │   │
│   │   └── settings/
│   │       ├── pages/
│   │       │   └── settings/
│   │       │
│   │       └── settings-routing.module.ts
│   │
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
│
├── assets/
│   ├── icons/
│   ├── images/
│   └── themes/
│
├── theme/
│   ├── variables.scss
│   └── app-theme.scss
│
└── environments/
    ├── environment.ts
    └── environment.prod.ts