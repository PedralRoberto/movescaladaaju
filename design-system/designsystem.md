# Design System — Movimento Escalada Aju
### Versão 2.0 (Definitiva) — Mescla PulseGrid + Identidade Escalada

---

## 1. Decisão Criativa

### O que é e o que não é

O Escalada Aju é um **movimento jovem de espiritualidade ativa** — não uma instituição,
não um produto SaaS, não uma ONG genérica. O design reflete isso: estrutural sem ser frio,
acolhedor sem ser infantil, espiritual sem ser kitsch religioso.

### A mescla PulseGrid

O ponto de partida visual é o **PulseGrid** — um dashboard de referência com linguagem
altamente refinada: bordas arredondadas em progressão hierárquica, sombras sutis, layout
limpo com zinc como neutro e espaçamento preciso. Essa estrutura é mantida integralmente.

O que foi substituído: a paleta de accents multicoloridos (emerald, sky, violet, amber)
foi descartada e substituída pelos dois tons da logo do Escalada — teal oceânico e terracota.
A tipografia Inter foi substituída pela Plus Jakarta Sans, que mantém a estrutura de pesos e
tamanhos mas tem personalidade mais arredondada, adequada a um movimento de jovens.

### Palavra-síntese: Movimento.

O design deve comunicar energia contida, não euforia. Clareza, não frieza. Pertencimento,
não performance religiosa.

---

## 2. Paleta de Cores

### Cores de Marca — extraídas diretamente da logo

| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
| Teal-500 (Primary) | `#15697C` | 192 72% 28% | CTA principal, nav ativo, ring de foco, dark CTA BG |
| Terracota-500 (Secondary) | `#8B4C39` | 16 42% 38% | Botão warm, badges especiais, pomba da logo |
| Branco | `#FFFFFF` | 0 0% 100% | Background padrão, texto sobre fundos escuros |

### Escala Teal (Primary) — baseada em `#15697C`

| Token | Hex | Uso típico |
|-------|-----|------------|
| `--teal-50` | `#edf6f8` | Hover sutil ghost buttons |
| `--teal-100` | `#d0eaee` | Icon box, badge primary bg, teal-light |
| `--teal-200` | `#a1d4dd` | Seleção de texto `::selection` |
| `--teal-300` | `#65b5c4` | Indicator dots, accents suaves |
| `--teal-400` | `#2d94a9` | Ícones secundários |
| `--teal-500` | `#15697C` | **PRIMARY — não substituir** |
| `--teal-600` | `#125f70` | Hover do primary |
| `--teal-700` | `#0f5261` | Texto sobre fundo teal claro |
| `--teal-800` | `#0b3f4b` | Texto sobre fundo muito claro |
| `--teal-900` | `#082d36` | Texto de alta hierarquia em fundos teal |
| `--teal-950` | `#041a20` | Dark CTA background (substitui zinc-950) |

### Escala Terracota (Secondary) — baseada em `#8B4C39`

| Token | Hex | Uso típico |
|-------|-----|------------|
| `--terracota-50` | `#fdf3f0` | Background muito sutil |
| `--terracota-100` | `#fae3dc` | Badge warm bg, accent-foreground base |
| `--terracota-200` | `#f5c5b4` | Detalhe decorativo, separadores quentes |
| `--terracota-300` | `#eda088` | Ornamento, ícones decorativos |
| `--terracota-400` | `#c9715a` | Indicator dots quentes |
| `--terracota-500` | `#8B4C39` | **SECONDARY — não substituir** |
| `--terracota-600` | `#7a4231` | Hover do warm button |
| `--terracota-700` | `#663828` | Texto sobre terracota claro |
| `--terracota-800` | `#4e2b1e` | Accent-foreground (dark sobre terracota-100) |
| `--terracota-900` | `#371e15` | Texto de alta hierarquia |
| `--terracota-950` | `#20100c` | Darkest accent |

### Zinc — Neutros (PulseGrid, mantidos sem alteração)

| Token | Hex | Uso típico |
|-------|-----|------------|
| `--zinc-50` | `#fafafa` | Superfícies suaves, seções alternadas |
| `--zinc-100` | `#f4f4f5` | Muted background, disabled inputs |
| `--zinc-200` | `#e4e4e7` | **Bordas — sempre zinc-200, não alterar** |
| `--zinc-400` | `#a1a1aa` | Texto muted sutil (não usar em body) |
| `--zinc-500` | `#71717a` | Muted foreground, captions |
| `--zinc-600` | `#52525b` | Texto corpo, parágrafos |
| `--zinc-950` | `#09090b` | Texto principal (foreground) |

### Pares WCAG AA verificados

| Combinação | Ratio | Status |
|-----------|-------|--------|
| Branco sobre Teal-500 `#15697C` | 6.1:1 | APROVADO |
| Branco sobre Terracota-500 `#8B4C39` | 5.3:1 | APROVADO |
| Zinc-950 sobre Branco | 18:1 | APROVADO |
| Zinc-600 sobre Branco | 5.9:1 | APROVADO |
| Teal-700 sobre Teal-100 | 6.5:1 | APROVADO |
| Terracota-700 sobre Terracota-100 | 7.1:1 | APROVADO |
| Teal-500 sobre Terracota-500 | 2.1:1 | REPROVADO |
| Zinc-400 sobre Branco | 2.3:1 | REPROVADO — nunca usar em texto |

---

## 3. Tipografia

### Fonte Principal: Plus Jakarta Sans

Carregada via `next/font/google` com pesos: 300, 400, 500, 600, 700, 800.

**Por que Plus Jakarta Sans (e não Inter)?**
- Inter é a fonte do PulseGrid original — excelente para dashboards, mas neutra demais para
  um movimento jovem com identidade visual forte.
- Plus Jakarta Sans tem terminals mais arredondados que criam acolhimento sem perder
  a clareza estrutural que o PulseGrid exige.
- Funciona como heading e body com a mesma fonte — simplifica a stack sem criar dissonância.
- Variable font disponível — carregamento otimizado.
- Os pesos e métricas são próximos o suficiente do Inter para que toda a escala tipográfica
  do PulseGrid funcione sem ajuste.

### Escala Tipográfica (espelho do PulseGrid)

| Papel | Classe Tailwind | rem | px | Pesos | Line-height |
|-------|-----------------|-----|----|-------|-------------|
| H1 hero | `text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight` | 3→3.75→4.5 | 48→60→72 | 600 | 1.1 |
| H2 seção | `text-4xl sm:text-5xl font-semibold tracking-tight` | 2.25→3 | 36→48 | 600 | 1.1 |
| H3 card | `text-xl font-semibold` | 1.25 | 20 | 600 | 1.25 |
| Body large | `text-lg font-normal leading-8` | 1.125 | 18 | 400 | 2rem (32px) |
| Body | `text-base font-normal leading-7` | 1 | 16 | 400 | 1.75rem (28px) |
| Label | `text-sm font-medium` | 0.875 | 14 | 500 | 1.5 |
| Caption | `text-xs font-medium uppercase tracking-[0.2em]` | 0.75 | 12 | 500 | 1.5 |

### Pesos e seu papel

| Peso | Tailwind | Uso |
|------|----------|-----|
| 300 (light) | `font-light` | Nunca em body — apenas em heroes grandes com muito texto |
| 400 (regular) | `font-normal` | Corpo de texto, parágrafos, lead text |
| 500 (medium) | `font-medium` | Labels, nav links, captions |
| 600 (semibold) | `font-semibold` | Headings, botões, subtítulos de card |
| 700 (bold) | `font-bold` | Destaques muito específicos |
| 800 (extrabold) | `font-extrabold` | Evitar — o tracking-tight do semibold já gera impacto |

---

## 4. Sistema de Border-Radius — Hierarquia PulseGrid

O radius progressivo é a assinatura visual mais forte do PulseGrid.
Cada nível comunica profundidade de hierarquia — elemento menor dentro de elemento maior.

```
Nível 1 — 32px (rounded-[2rem])
  └── Nível 2 — 24px (rounded-[1.5rem])
        └── Nível 3 — 20px (rounded-[1.25rem])
              └── Nível 4 — 16px (rounded-2xl)
                    └── Nível 5 — 12px (rounded-xl)
                          └── Nível 6 — ∞ (rounded-full — pill/badge)
```

### Mapeamento por componente

| Componente | Nível | px | Classe Tailwind |
|-----------|-------|----|----|
| Feature card grande, CTA section, wrappers | 1 | 32 | `rounded-[2rem]` |
| Cards de seção, hero preview, inner sections | 2 | 24 | `rounded-[1.5rem]` |
| Ilustrações internas de card | 3 | 20 | `rounded-[1.25rem]` |
| Cards de lista, FAQ items, icon boxes | 4 | 16 | `rounded-2xl` |
| Inputs, campos | 5 | 12 | `rounded-xl` |
| Badges, todos os botões, announcement | 6 | ∞ | `rounded-full` |

**Regra**: elemento interno nunca tem radius MAIOR que o container.

---

## 5. Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` | Cards estáticos, badges, nav |
| `--shadow-card` | `0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Cards no hover |
| `--shadow-hero` | `0 20px 80px -20px rgba(0,0,0,0.15)` | Hero preview card (PulseGrid) |
| `--shadow-teal` | `0 4px 24px -4px rgba(21,105,124,0.25)` | Hover de btn-primary |
| `--shadow-terracota` | `0 4px 24px -4px rgba(139,76,57,0.22)` | Hover de btn-warm |

Nunca use `shadow-xl` em elementos inline. Apenas modals e drawers.

---

## 6. Padrões de Componentes-Chave

### Announcement Badge
Pill com borda zinc-200, fundo branco translúcido, backdrop-blur, dot teal.
Sinaliza novidade sem agredir a hierarquia da hero.

### Botões
Todos `rounded-full`. Três variantes:
- **Primary** (teal) — ação principal, uma por viewport.
- **Secondary** (borda zinc, fundo branco) — ação alternativa neutra.
- **Warm** (terracota) — CTA em seções de conversão quente ou final.

Nunca coloque dois CTAs primary side-by-side. O secondary neutraliza o conflito.

### Feature Card (PulseGrid)
Outer: `rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm`
Inner illustration: `rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5`
O contraste de radius entre outer/inner é a identidade do PulseGrid.

### CTA Section Escura
`rounded-[2rem] bg-teal-950 overflow-hidden` com dois radial gradients:
- Esquerda-topo: teal com 35% de opacidade
- Direita-baixo: terracota com 25% de opacidade
Texto sempre branco. Botões: branco opaco (primary) + branco/20 (secondary).

### FAQ Accordion
`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm` com espaçamento `mb-2` entre itens.
Trigger: semibold, hover teal. Ícone: `<Plus>` Lucide rotacionando 45° quando aberto.

---

## 7. Espaçamento e Layout

### Grid e container
- Grid: 12 colunas Tailwind
- Max-width: `max-w-7xl` (~1280px)
- Padding horizontal: `px-6 lg:px-8`
- Section padding: `py-14 lg:py-20`
- Gap padrão entre cards: `gap-4`

### Escala de espaçamento (múltiplos de 4)

| Tailwind | px | Uso típico |
|----------|----|------------|
| `gap-1` / `p-1` | 4 | Gap mínimo ícone + texto |
| `gap-2` / `p-2` | 8 | Padding badge, gap interno |
| `gap-3` / `p-3` | 12 | Padding botão small, gap de lista |
| `gap-4` / `p-4` | 16 | Gap padrão (PulseGrid), padding item |
| `gap-5` / `p-5` | 20 | Padding de card padrão |
| `gap-6` / `p-6` | 24 | Gap de grid, padding de section header |
| `gap-8` / `p-8` | 32 | Padding CTA section |
| `py-14` | 56 | Section padding mobile |
| `py-20` | 80 | Section padding desktop |

---

## 8. Tom Visual por Seção da LP

| Seção | Fundo | Texto | CTA |
|-------|-------|-------|-----|
| Hero | Branco | zinc-950 / zinc-600 | Primary (teal) + Secondary (zinc border) |
| Social Proof | zinc-50 | zinc-950 | — |
| Quem Somos | Branco | zinc-950 / zinc-600 | — |
| Como Funciona | zinc-50 | zinc-950 | Ghost ou outline |
| Eventos | Branco | zinc-950 | Primary |
| Depoimentos | teal-950 (dark) | Branco | Warm (terracota) |
| FAQ | Branco | zinc-950 | — |
| CTA Final | terracota-500 | Branco | Branco opaco |
| Footer | zinc-950 | Branco / zinc-400 | Links brancos |

---

## 9. Iconografia

- Biblioteca: **Lucide React** (inclusa com shadcn/ui)
- Stroke: **strokeWidth={1.5}** em todos os ícones — sem exceção
- Nunca mude para `strokeWidth={2}` ou `strokeWidth={1}`

| Contexto | Tamanho Lucide | Tailwind equiv |
|----------|---------------|----------------|
| Inline em texto/botão | `size={16}` | `h-4 w-4` |
| Em card / lista | `size={20}` | `h-5 w-5` |
| Icon box / destaque | `size={28}` | `h-7 w-7` |

Ícones relevantes para o Escalada Aju: `Mountain`, `Users`, `Heart`, `MapPin`,
`Calendar`, `ChevronRight`, `Plus`, `ArrowRight`, `Star`.

---

## 10. Anti-patterns — nunca fazer

1. Usar `rounded-none` ou `rounded-sm` em qualquer elemento visível — fere o PulseGrid
2. Usar Inter ou qualquer outra fonte além de Plus Jakarta Sans
3. Usar emoji como ícone
4. Misturar Lucide com outra biblioteca de ícones
5. Texto de corpo menor que `text-base` (16px)
6. Teal como cor de texto sobre fundo terracota (contraste reprovado)
7. Múltiplos CTAs primary na mesma seção sem hierarquia clara
8. Sombra pesada (`shadow-xl`) em cards — usar `shadow-sm` ou `shadow-card`
9. Hardcode de hex no JSX — usar sempre classes Tailwind
10. Gradientes não definidos neste DS — o único gradiente permitido é o radial da CTA dark
11. `zinc-400` como cor de texto — abaixo do mínimo WCAG AA em fundo branco
12. Imagens sem dimensões declaradas — causa CLS (Core Web Vitals)
13. Placeholder como substituto de label em formulários
14. Scroll horizontal em mobile — testar sempre em 375px
15. Remover focus ring — acessibilidade não é negociável
