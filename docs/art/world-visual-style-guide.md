# Guia visual de mapas — PokeSpace

Este é o contrato visual para todos os mapas novos. As quatro artes recebidas foram preservadas, sem alteração, em [`public/assets/reference/pokespace-visual-guide`](../../public/assets/reference/pokespace-visual-guide). Elas são a referência prioritária para composição, sprites, HUD, efeitos e escala.

## Referências guardadas

| Arquivo | Uso obrigatório como referência |
| --- | --- |
| `01-visual-guide-complete.png` | Direção de arte, paleta, tiles, UI e organização de assets. |
| `02-sprite-library.png` | Biblioteca visual de personagens, criaturas, efeitos, vegetação, estruturas e ícones. |
| `03-visual-guide-technical.png` | Grades de animação, convenções técnicas e grupos de assets. |
| `04-visual-style-guide.png` | Composição de cena, transições, iluminação, barras e escala relativa. |

Essas pranchas **não são tilesets para renderização direta**: são imagens de apresentação e algumas têm sprites compostos em uma única lâmina. O jogo deve usar os assets individuais/atlases aprovados, mantendo a prancha como fonte de decisão visual. Isso evita recortes acidentais, halos e escalas incompatíveis no mapa.

## Padrão obrigatório

- Tile base: **32×32 px**. Escale apenas por números inteiros.
- Renderização: `image-rendering: pixelated` e `imageSmoothingEnabled = false`.
- Camadas TMX: `Terreno`, `Transições`, `Detalhes`, `Objetos/Construções` e `Collision`.
- Terreno: grama, terra, pedra, areia e água sempre com peças de transição; não faça blocos retos ou cortes secos.
- Composição: defina primeiro rota jogável e pontos de interesse; depois crie molduras orgânicas com árvores, rochas, arbustos, flores e água.
- Escala: personagem = 1 tile; criatura pequena = 1 tile; criatura grande e árvores = 2×2 tiles ou mais.
- Profundidade: mantenha objetos altos em camadas acima do ator e respeite uma única direção de sombra/contorno.
- Leitura: não cubra caminhos, spawn, interações ou colisões com decoração.
- UI e efeitos: reserve azul, dourado, vermelho, verde e magenta de alto brilho para estados, magia e HUD — não para preencher o terreno.

## Paleta de trabalho

| Família | Base | Luz | Uso |
| --- | --- | --- | --- |
| Natureza | `#2f7138` | `#a9d65b` | Grama, folhas, arbustos e árvores. |
| Terra | `#80512f` | `#e4b56a` | Caminhos, solo e madeira envelhecida. |
| Água | `#13538a` | `#a3e5df` | Rios, lagos, margens e reflexos. |
| Rocha | `#45443d` | `#d5e0cc` | Penhascos, pedras, cavernas e ruínas. |
| Construção | `#5c3826` | `#c49358` | Pontes, cercas, placas, barris e edifícios. |
| Interface | `#101018` | `#f9bc01` | HUD, foco, hotbar e estados de jogo. |

Os tokens reutilizáveis estão em [`src/features/game-world/style-guide.ts`](../../src/features/game-world/style-guide.ts). Não introduza uma paleta ou estilo paralelo em mapas futuros.

## Uso de sprites e assets

Use apenas sprites de `public/assets/sprites/{player,creature,item}`, `public/assets/ui` e atlases de `public/assets/world/tilesets`, salvo quando um novo asset for produzido explicitamente no mesmo estilo. Todo novo sprite deve ter fundo transparente, contorno escuro consistente, sombra curta e pixels nítidos.

Antes de publicar um mapa, rode `pnpm world:style-check`. O verificador confirma que as referências, o manifesto e a estrutura de mapas 32×32 continuam presentes; a revisão visual continua obrigatória.
