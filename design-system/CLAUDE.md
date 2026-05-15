# CLAUDE.md — Instruções para o LP Builder
## Design System: Movimento Escalada Aju — v2.0 (DEFINITIVO)

Leia este arquivo COMPLETAMENTE antes de qualquer decisão de implementação.
Este é o design system definitivo. Versões anteriores foram descartadas.

---

## Princípio-raiz

O visual segue o padrão **PulseGrid** — mesmas estruturas de cards, border-radius,
layout, gap e sombras. As únicas substituições são:

| Original PulseGrid | Escalada Aju | Onde aparece |
|--------------------|-------------|--------------|
| Inter | Plus Jakarta Sans | Fonte de toda a interface |
| zinc-950 (primary actions) | teal-500 `#15697C` | Botão primary, nav active, dark CTA bg |
| emerald / sky / violet / amber | teal-300/teal-100 | Badges, indicator dots, icon backgrounds |
| Sem secondary accent | terracota-500 `#8B4C39` | Botão warm, destaques especiais |
| zinc-200 borders | zinc-200 (mantido) | Bordas — não alterar |
| zinc-50 surfaces | zinc-50 (mantido) | Superfícies — não alterar |

---

## Stack obrigatória

- **Next.js 14+** com App Router
- **shadcn/ui** como biblioteca de componentes base
- **Tailwind CSS** para utilitários
- **Plus Jakarta Sans** via `next/font/google`
- **Lucide React** para ícones (`strokeWidth={1.5}` em todos)

---

## Configuração da fonte (obrigatório)

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## tailwind.config.js — configuração completa

```js
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',  // px-6
        lg: '2rem',         // lg:px-8
      },
      screens: {
        '2xl': '80rem',     // max-w-7xl aprox
      },
    },
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', ...fontFamily.sans],
        heading: ['var(--font-sans)', ...fontFamily.sans],
      },
      colors: {
        /* Escalada Aju — Teal (Primary) */
        teal: {
          50:  '#edf6f8',
          100: '#d0eaee',
          200: '#a1d4dd',
          300: '#65b5c4',
          400: '#2d94a9',
          500: '#15697c',  /* BASE — cor da logo */
          600: '#125f70',
          700: '#0f5261',
          800: '#0b3f4b',
          900: '#082d36',
          950: '#041a20',
        },
        /* Escalada Aju — Terracota (Secondary Accent) */
        terracota: {
          50:  '#fdf3f0',
          100: '#fae3dc',
          200: '#f5c5b4',
          300: '#eda088',
          400: '#c9715a',
          500: '#8b4c39',  /* BASE — cor da pomba na logo */
          600: '#7a4231',
          700: '#663828',
          800: '#4e2b1e',
          900: '#371e15',
          950: '#20100c',
        },
        /* Tokens semânticos shadcn/ui */
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        /* shadcn/ui usa --radius como base */
        DEFAULT: 'var(--radius)',   /* 8px */
        sm:      'calc(var(--radius) - 4px)',
        md:      'calc(var(--radius) + 2px)',
        lg:      'calc(var(--radius) + 4px)',
        xl:      '1rem',    /* 16px — rounded-2xl Tailwind */
        '2xl':   '1.5rem',  /* 24px — card */
        '3xl':   '1.25rem', /* 20px — subcard */
        '4xl':   '2rem',    /* 32px — page/feature card */
        full:    '9999px',
      },
      boxShadow: {
        sm:         '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card:       '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        hero:       '0 20px 80px -20px rgba(0, 0, 0, 0.15)',
        teal:       '0 4px 24px -4px rgba(21, 105, 124, 0.25)',
        terracota:  '0 4px 24px -4px rgba(139, 76, 57, 0.22)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-up':        'fade-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

---

## globals.css — tokens HSL shadcn/ui (colar no topo do globals.css)

O shadcn/ui lê estas variáveis HSL para funcionar. Cole este bloco no topo do
`app/globals.css`, ANTES de importar o design-system:

```css
/* app/globals.css */
@layer base {
  :root {
    --background:          0 0% 100%;
    --foreground:          240 10% 3.9%;
    --card:                0 0% 100%;
    --card-foreground:     240 10% 3.9%;
    --popover:             0 0% 100%;
    --popover-foreground:  240 10% 3.9%;
    --primary:             192 72% 28%;     /* #15697C — teal-500 */
    --primary-foreground:  0 0% 100%;
    --secondary:           240 4.8% 95.9%;  /* zinc-100 */
    --secondary-foreground: 240 5.9% 10%;
    --muted:               240 4.8% 95.9%;
    --muted-foreground:    240 3.8% 46.1%;
    --accent:              15 84% 93%;      /* terracota-100 #fae3dc */
    --accent-foreground:   16 44% 21%;      /* terracota-800 #4e2b1e */
    --destructive:         0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border:              240 5.9% 90%;    /* zinc-200 */
    --input:               240 5.9% 90%;
    --ring:                192 72% 28%;     /* teal-500 */
    --radius:              0.5rem;          /* 8px base shadcn */
  }

  .dark {
    --background:          192 72% 5%;
    --foreground:          0 0% 98%;
    --card:                192 60% 8%;
    --card-foreground:     0 0% 98%;
    --popover:             192 60% 8%;
    --popover-foreground:  0 0% 98%;
    --primary:             192 72% 48%;     /* teal mais claro no dark */
    --primary-foreground:  192 72% 5%;
    --secondary:           240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted:               240 3.7% 15.9%;
    --muted-foreground:    240 5% 64.9%;
    --accent:              16 42% 20%;
    --accent-foreground:   15 84% 85%;
    --destructive:         0 62.8% 50%;
    --destructive-foreground: 0 0% 98%;
    --border:              240 3.7% 15.9%;
    --input:               240 3.7% 15.9%;
    --ring:                192 72% 48%;
  }
}
```

Depois deste bloco, importe o design-system:

```css
@import '../design-system/index.css';
```

---

## Componentes shadcn/ui — instalar

```bash
# Setup inicial
npx shadcn@latest init

# Componentes deste projeto
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add accordion
npx shadcn@latest add navigation-menu
npx shadcn@latest add sheet
npx shadcn@latest add dialog
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add toast
```

Após instalar, o shadcn vai gerar tokens HSL padrão no globals.css.
Apague os tokens gerados e mantenha apenas os definidos acima.

---

## Sistema de Border-Radius — hierarquia obrigatória (PulseGrid)

Esta hierarquia de 7 níveis DEVE ser respeitada em toda a LP:

| Nível | Token CSS | Tailwind | px | Onde usar |
|-------|-----------|----------|----|-----------|
| 1 — Container/Página | `--radius-page` | `rounded-[2rem]` | 32 | Feature cards grandes, wrappers externos, CTA dark section |
| 2 — Card/Section | `--radius-card` | `rounded-[1.5rem]` | 24 | Cards de seção, hero preview, inner sections |
| 3 — Sub-card | `--radius-subcard` | `rounded-[1.25rem]` | 20 | Ilustrações internas de card, nested content |
| 4 — Elemento/Item | `--radius-element` | `rounded-2xl` | 16 | Cards de lista, FAQ items, icon boxes, automation items |
| 5 — Campo/Botão | `--radius-button` | `rounded-xl` | 12 | Inputs, tabs trigger |
| 6 — Pill/Badge | `--radius-pill` | `rounded-full` | ∞ | Badges, todos os botões, announcement badge, nav links |

Regra: **nunca inverta a hierarquia** — elemento interno sempre tem radius menor ou igual ao container.

---

## Botões — padrão PulseGrid

Todos os botões usam `rounded-full` (pill). Sem exceção.

```tsx
// Primary — teal (ação principal, CTA)
<Button className="rounded-full bg-teal-500 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-teal-600">
  Participar agora
</Button>

// Secondary — borda zinc, fundo branco (PulseGrid padrão)
<Button variant="outline" className="rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-medium hover:bg-zinc-50">
  Saiba mais
</Button>

// Warm — terracota (CTA alternativo quente)
<Button className="rounded-full bg-terracota-500 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-terracota-600">
  Encontre uma turma
</Button>

// Small
<Button className="rounded-full px-4 py-2 text-sm">
  Ação pequena
</Button>
```

---

## Cards — padrão PulseGrid

```tsx
// Feature card grande (outer: rounded-[2rem] | inner: rounded-[1.5rem])
<div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
  <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5 mb-5">
    {/* Ilustração / preview */}
  </div>
  <h3 className="text-xl font-semibold">Título do card</h3>
  <p className="text-sm text-zinc-600 mt-2 leading-7">Descrição</p>
</div>

// Card de item / lista (rounded-2xl)
<div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm flex items-center gap-3">
  <div className="icon-box icon-box-sm">
    <Mountain size={16} strokeWidth={1.5} />
  </div>
  <span className="text-sm font-medium">Item de lista</span>
</div>
```

---

## Announcement Badge — PulseGrid

```tsx
<div className="rounded-full border border-zinc-200 bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-sm inline-flex items-center gap-2">
  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
  <span className="text-sm font-medium text-zinc-700">Novo encontro em Aracaju</span>
</div>
```

---

## FAQ Accordion — PulseGrid (details/summary ou Accordion shadcn)

```tsx
// Via shadcn/ui Accordion
<Accordion type="single" collapsible>
  <AccordionItem value="q1" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm mb-2">
    <AccordionTrigger className="text-base font-semibold hover:text-teal-500">
      Pergunta frequente?
    </AccordionTrigger>
    <AccordionContent className="text-base text-zinc-600 leading-7">
      Resposta detalhada...
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

O ícone do trigger deve ser `<Plus size={20} strokeWidth={1.5} />` rotacionando 45° quando aberto.

---

## CTA Section Escura — PulseGrid

```tsx
<section className="rounded-[2rem] bg-teal-950 overflow-hidden relative">
  {/* Gradients decorativos — substituem os coloridos do PulseGrid */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute -top-1/2 -left-1/4 w-1/2 h-[200%] bg-[radial-gradient(ellipse,rgba(21,105,124,0.35)_0%,transparent_60%)]" />
    <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-[160%] bg-[radial-gradient(ellipse,rgba(139,76,57,0.25)_0%,transparent_55%)]" />
  </div>
  <div className="relative z-10 px-8 py-16 text-center">
    <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
      Faça parte do movimento
    </h2>
    <p className="mt-4 text-lg text-white/70 leading-8">
      Subtítulo de CTA aqui.
    </p>
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button className="rounded-full bg-white text-teal-950 px-5 py-3 text-sm font-medium hover:bg-zinc-100">
        CTA principal
      </Button>
      <Button className="rounded-full border border-white/20 text-white px-5 py-3 text-sm font-medium hover:bg-white/10">
        CTA secundário
      </Button>
    </div>
  </div>
</section>
```

---

## Ícones — Lucide React

```tsx
import { Mountain, Users, Heart, ChevronRight, MapPin, Calendar, Plus } from 'lucide-react'

// Regra: SEMPRE strokeWidth={1.5}
// Tamanhos padrão (espelhando PulseGrid):
<Mountain size={16} strokeWidth={1.5} />   // h-4 w-4 — inline em texto
<Mountain size={20} strokeWidth={1.5} />   // h-5 w-5 — em card/lista
<Mountain size={28} strokeWidth={1.5} />   // h-7 w-7 — destaque/icon box
```

---

## Tipografia — classes Tailwind (PulseGrid)

```
H1 hero:     text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl
H2 seção:    text-4xl font-semibold tracking-tight sm:text-5xl
H3 card:     text-xl font-semibold
Body large:  text-lg font-normal leading-8
Body:        text-base font-normal leading-7
Label:       text-sm font-medium
Caption:     text-xs font-medium uppercase tracking-[0.2em]
Eyebrow:     text-xs font-medium uppercase tracking-[0.2em] text-teal-500
```

---

## Layout — PulseGrid

```
Max-width container:  max-w-7xl
Padding horizontal:   px-6 lg:px-8
Padding vertical:     py-14 lg:py-20
Gap padrão cards:     gap-4
Grid padrão:          12 colunas Tailwind
```

---

## Hierarquia de cores por contexto

```
Botão CTA primário:       bg-teal-500 text-white hover:bg-teal-600
Botão CTA secundário:     border border-zinc-200 bg-white hover:bg-zinc-50
Botão CTA quente:         bg-terracota-500 text-white hover:bg-terracota-600
Nav link ativo:           text-teal-500 font-semibold
Badge/pill primário:      bg-teal-100 text-teal-700
Badge/pill quente:        bg-terracota-100 text-terracota-700
Icon box padrão:          bg-teal-100 text-teal-500 rounded-2xl
CTA dark background:      bg-teal-950
Seção alternada:          bg-zinc-50
Bordas:                   border-zinc-200 (SEMPRE — não substituir)
```

---

## Regras críticas — NÃO violar

1. **Nunca hardcode hex** no JSX. Use classes Tailwind (`bg-teal-500`, `text-terracota-500`).
2. **Nunca use teal sobre terracota** como texto/fundo — contraste ~2.1:1, reprovado WCAG AA.
3. **Nunca use rounded-none** em nada que seja visível — o estilo PulseGrid é totalmente arredondado.
4. **Nunca misture estilos de radius** sem seguir a hierarquia dos 7 níveis.
5. **Nunca use Inter** — a fonte é exclusivamente Plus Jakarta Sans.
6. **Nunca use emoji** como ícone — somente Lucide React com strokeWidth={1.5}.
7. **Nunca remova o focus ring** — acessibilidade não é opcional.
8. **Mínimo 16px** para qualquer texto de corpo (text-base).
9. **Touch target mínimo 44px** em qualquer elemento interativo.
10. **Texto sobre bg-teal-950**: use sempre text-white ou text-white/70.

---

## Pares de cor seguros (WCAG AA verificados)

| Texto | Fundo | Ratio | Status |
|-------|-------|-------|--------|
| `#ffffff` sobre `#15697c` | Branco / Teal-500 | ~6.1:1 | APROVADO |
| `#ffffff` sobre `#8b4c39` | Branco / Terracota-500 | ~5.3:1 | APROVADO |
| `#09090b` sobre `#ffffff` | Zinc-950 / Branco | ~18:1 | APROVADO |
| `#52525b` sobre `#ffffff` | Zinc-600 / Branco | ~5.9:1 | APROVADO |
| `#0f5261` sobre `#d0eaee` | Teal-700 / Teal-100 | ~6.5:1 | APROVADO |
| `#663828` sobre `#fae3dc` | Terracota-700 / Terracota-100 | ~7.1:1 | APROVADO |
| `#15697c` sobre `#8b4c39` | Teal / Terracota | ~2.1:1 | REPROVADO |
| `#a1a1aa` sobre `#ffffff` | Zinc-400 / Branco | ~2.3:1 | REPROVADO — não usar em texto |

---

## Estrutura de seções da LP — ordem recomendada

```
1.  <Header>        — nav sticky, logo, links, btn-primary "Participe"
2.  <Hero>          — h1, subtítulo lead, 2 CTAs (primary + secondary), visual
3.  <SocialProof>   — contador de membros, logos parceiros ou cidades
4.  <WhoWeAre>      — texto + imagem, identidade do Movimento
5.  <HowItWorks>    — 3 passos: Conheça → Participe → Cresça
6.  <Events>        — próximos encontros, cards de agenda
7.  <Testimonials>  — depoimentos (section-cta-dark: bg-teal-950)
8.  <FinalCTA>      — CTA quente (section-cta-warm: bg-terracota-500)
9.  <Footer>        — links, contato, redes sociais, logo branca
```

---

## Referência rápida de tokens

```
Primary brand:      #15697C  → teal-500  → bg-teal-500 / text-teal-500
Primary hover:      #125f70  → teal-600  → hover:bg-teal-600
Primary light:      #d0eaee  → teal-100  → bg-teal-100
Primary dark:       #0f5261  → teal-700  → text-teal-700
Primary darkest:    #041a20  → teal-950  → bg-teal-950

Accent warm:        #8b4c39  → terracota-500  → bg-terracota-500
Accent warm hover:  #7a4231  → terracota-600  → hover:bg-terracota-600
Accent warm light:  #fae3dc  → terracota-100  → bg-terracota-100

Background:         #ffffff  → bg-white
Subtle surface:     #fafafa  → bg-zinc-50
Border:             #e4e4e7  → border-zinc-200
Text primary:       #09090b  → text-zinc-950
Text body:          #52525b  → text-zinc-600
Text muted:         #71717a  → text-zinc-500

Font:               Plus Jakarta Sans, 300/400/500/600/700/800
Icons:              Lucide React, strokeWidth={1.5}
```
