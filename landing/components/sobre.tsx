import { ImageAccordion } from "@/components/ui/interactive-image-accordion";

export function Sobre() {
  return (
    <section id="o-que-e" className="relative">
      <div className="max-w-5xl mx-auto px-8">
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: "640px" }}>

        {/* ── Coluna esquerda: texto ──────────────────────────────── */}
        <div className="flex flex-col justify-center py-24 pr-10">
          <div>

            {/* Label */}
            <p
              className="text-[10px] font-semibold tracking-[0.28em] uppercase mb-8"
              style={{ color: "#8B4C39" }}
            >
              O que é
            </p>

            {/* Heading — duas cores em tensão */}
            <h2
              className="font-bold leading-[1.08] tracking-tight mb-8"
              style={{ fontSize: "clamp(2rem, 3.8vw, 3.2rem)" }}
            >
              <span className="text-zinc-900">Jovem evangelizando</span>
              <br />
              <span style={{ color: "#15697C" }}>o jovem.</span>
            </h2>

            {/* Linha dupla: teal + terracota */}
            <div className="flex gap-2 mb-9">
              <div className="h-px w-10" style={{ background: "#15697C" }} />
              <div className="h-px w-5" style={{ background: "#8B4C39" }} />
            </div>

            {/* Corpo */}
            <div
              className="space-y-5 leading-[1.85]"
              style={{ fontSize: "0.85rem", color: "#6B7280" }}
            >
              <p>
                O Escalada é um movimento de evangelização jovem que chegou a
                Aracaju com uma missão: anunciar Jesus Cristo através da
                amizade, do encontro e da experiência transformadora dos retiros.
              </p>
              <p>
                Cada retiro é conduzido por jovens para jovens — uma corrente
                viva onde quem já passou pela experiência acolhe quem está
                chegando. São dias fora da rotina, de oração e conversas que
                ficam para a vida.
              </p>
              <p>
                Mais do que um evento, o Escalada é uma comunidade. Depois do
                retiro, os participantes continuam se encontrando e crescendo
                juntos na fé.
              </p>
            </div>

          </div>
        </div>

        {/* ── Coluna direita: acordeão de imagens ───────────────────── */}
        <div className="hidden md:flex items-center justify-center overflow-hidden">
          <ImageAccordion />
        </div>

      </div>
      </div>
    </section>
  );
}
