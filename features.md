# 📱 Magic Life Counter — Features

## Overview
Aplicativo mobile para controle de vida em partidas de card games (ex: Magic), com foco em uso local (offline), múltiplos jogadores e registro de histórico de partidas.

---

## Core Features

### 1. Life Counter
- **Stability**: in-progress
- **Description**: Sistema principal de controle de vida por jogador.

- **Properties**:
  - Cada jogador possui um valor de vida independente
  - Incremento e decremento manual de vida
  - Suporte a múltiplos jogadores (2+)
  - Vida inicial configurável (ex: 20, 40)

- **Test Criteria**:
  - [ ] Incrementar vida altera o valor corretamente
  - [ ] Decrementar vida altera o valor corretamente
  - [ ] Cada jogador mantém seu próprio estado
  - [ ] Reset de partida redefine valores

---

### 2. Player Management
- **Stability**: planned
- **Description**: Gerenciamento de jogadores da partida.

- **Properties**:
  - Adicionar jogadores
  - Remover jogadores
  - Definir nome por jogador
  - Identificação única por jogador

- **Test Criteria**:
  - [ ] Jogador pode ser adicionado
  - [ ] Jogador pode ser removido
  - [ ] Nome do jogador é persistido
  - [ ] IDs não se repetem

---

### 3. Life Change History (Real-time)
- **Stability**: planned
- **Description**: Registro de todas as alterações de vida durante a partida.

- **Properties**:
  - Registro com timestamp
  - Registro do jogador afetado
  - Registro do valor alterado (+/-)
  - Ordenação cronológica

- **Test Criteria**:
  - [ ] Cada alteração gera um registro
  - [ ] Histórico mantém ordem correta
  - [ ] Dados persistem durante a partida

---

### 4. Match Timer
- **Stability**: planned
- **Description**: Controle de duração da partida.

- **Properties**:
  - Timer inicia ao começar partida
  - Timer pausa/finaliza ao encerrar
  - Exibição em tempo real
  - Armazenamento da duração final

- **Test Criteria**:
  - [ ] Timer inicia corretamente
  - [ ] Tempo é atualizado em tempo real
  - [ ] Tempo final é salvo ao encerrar

---

### 5. Match Management
- **Stability**: planned
- **Description**: Criação, execução e finalização de partidas.

- **Properties**:
  - Iniciar nova partida
  - Associar jogadores à partida
  - Definir vencedor ao final
  - Registrar dados da partida

- **Test Criteria**:
  - [ ] Partida pode ser iniciada
  - [ ] Partida pode ser finalizada
  - [ ] Vencedor é registrado corretamente
  - [ ] Dados da partida são persistidos

---

### 6. Locations System
- **Stability**: planned
- **Description**: Cadastro e uso de locais de jogo.

- **Properties**:
  - Criar local
  - Editar local
  - Remover local
  - Associar local à partida

- **Test Criteria**:
  - [ ] Local pode ser criado
  - [ ] Local pode ser editado
  - [ ] Local pode ser removido
  - [ ] Partida pode ser vinculada a um local

---

### 7. Match History
- **Stability**: planned
- **Description**: Histórico de partidas jogadas.

- **Properties**:
  - Listagem de partidas
  - Filtro por local
  - Registro de vencedor
  - Registro de duração
  - Registro de data

- **Test Criteria**:
  - [ ] Partidas são listadas corretamente
  - [ ] Filtro por local funciona
  - [ ] Dados da partida são exibidos corretamente

---

### 8. Data Persistence
- **Stability**: in-progress
- **Description**: Armazenamento local dos dados do app.

- **Properties**:
  - Persistência offline
  - Dados sobrevivem ao fechar app
  - Estrutura consistente de armazenamento
  - Suporte a atualização incremental

- **Test Criteria**:
  - [ ] Dados permanecem após reiniciar app
  - [ ] Dados não são perdidos durante uso normal
  - [ ] Estrutura pode ser carregada corretamente

---

### 9. Data Export
- **Stability**: planned
- **Description**: Exportação de dados do app.

- **Properties**:
  - Exportar histórico de partidas
  - Suporte a JSON
  - Suporte a CSV
  - Compartilhamento de arquivo

- **Test Criteria**:
  - [ ] Arquivo JSON é gerado corretamente
  - [ ] Arquivo CSV é gerado corretamente
  - [ ] Arquivo pode ser compartilhado

---

### 10. Data Import (Backup Restore)
- **Stability**: planned
- **Description**: Importação de dados previamente exportados.

- **Properties**:
  - Leitura de arquivo JSON
  - Restauração completa dos dados
  - Validação de estrutura

- **Test Criteria**:
  - [ ] Arquivo válido é importado corretamente
  - [ ] Dados são restaurados corretamente
  - [ ] Dados inválidos são rejeitados

---

## Non-Functional Requirements

### Performance
- Interface deve responder imediatamente às alterações de vida
- Operações devem ser locais (sem dependência de rede)

### Offline First
- Todas funcionalidades devem funcionar sem internet

### Usability
- Interação rápida (uso durante jogo)
- Baixo número de toques para ações principais

---

## Future Features (Optional)

- Sons ao alterar vida
- Vibração (haptic feedback)
- Rolagem de dados (D20, D6, etc.)
- Estatísticas avançadas (ranking de jogadores)

---