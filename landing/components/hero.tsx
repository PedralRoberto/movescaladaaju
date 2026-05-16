import Link from "next/link";
import Image from "next/image";

const SISTEMA_URL =
  process.env.NEXT_PUBLIC_SISTEMA_URL ?? "https://app.movescaladaaju.com.br";

export function Hero() {
  return (
    <section className="h-screen overflow-hidden relative flex bg-white">
      {/* ── Coluna esquerda — conteúdo ───────────────────────────── */}
      <div className="flex flex-col justify-center px-16 lg:pl-32 lg:pr-12 w-full lg:w-[48%] shrink-0 z-10 relative">
        {/* Badge */}
        <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#15697C] mb-8">
          Movimento Jovem Católico · Aracaju
        </p>

        {/* H1 — largura livre para sangrar na imagem */}
        <h1
          className="font-bold text-zinc-900 leading-[1.05] tracking-tight w-max max-w-[55vw]"
          style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)" }}
        >
          Um encontro
          <br />
          que{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(120deg, #15697C 30%, #8B4C39 100%)" }}>
            transforma
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-[0.9rem] text-zinc-400 leading-relaxed max-w-sm">
          Retiros de jovens católicos em Aracaju que renovam a fé e criam
          laços para a vida.
        </p>

        {/* Divider */}
        <div className="mt-8 mb-8 h-px w-12 bg-zinc-200" />

        {/* CTAs */}
        <div className="flex items-center gap-5">
          <Link
            href={`${SISTEMA_URL}/inscricao`}
            className="px-5 py-2.5 rounded-full bg-[#15697C] text-white text-xs font-semibold hover:bg-[#1D8499] transition-colors"
          >
            Quero me inscrever
          </Link>
          <a
            href="#o-que-e"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            Saiba mais →
          </a>
        </div>
      </div>

      {/* ── Imagem — absolute na section, sem coluna flex ───────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/desenho-hero.png"
        alt="Escalada — retiro de jovens"
        className="hidden lg:block absolute right-0 bottom-0 w-auto pointer-events-none"
        style={{ height: "115%" }}
      />

      {/* Fade suave na junção texto/imagem */}
      <div
        className="hidden lg:block absolute inset-y-0 z-[5] pointer-events-none"
        style={{
          left: "42%",
          width: "8%",
          background: "linear-gradient(to right, white, transparent)",
        }}
      />
      {/* Fade na base */}
      <div
        className="absolute inset-x-0 bottom-0 z-[5] pointer-events-none"
        style={{
          height: "25%",
          background: "linear-gradient(to top, white, transparent)",
        }}
      />
    </section>
  );
}
