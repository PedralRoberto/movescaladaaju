export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-3 px-6"
      style={{ borderTop: "1px solid #F0F0F0" }}
    >
      <p
        className="text-center text-zinc-400"
        style={{ fontSize: "0.72rem" }}
      >
        © {year} Escalada Aju · Desenvolvido por{" "}
        <a
          href="https://robertopedral.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-800 transition-colors duration-200 underline underline-offset-2"
        >
          RP Design
        </a>
      </p>
    </footer>
  );
}
