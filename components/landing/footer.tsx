export function Footer() {
  return (
    <footer className="bg-footer-bg px-[22px] py-[28px] xl:px-[56px]">
      <div className="mx-auto flex max-w-page flex-col items-center gap-3 text-center xl:flex-row xl:justify-between">
        <span className="font-sans text-[13px] font-medium text-footer-text">
          Remindeer — mnemotecniche per il concorso farmacie
        </span>
        <nav className="flex items-center gap-4">
          <a
            href="#privacy"
            className="font-sans text-[13px] font-medium text-footer-text underline-offset-2 hover:underline"
          >
            Privacy
          </a>
          <a
            href="#termini"
            className="font-sans text-[13px] font-medium text-footer-text underline-offset-2 hover:underline"
          >
            Termini
          </a>
        </nav>
      </div>
    </footer>
  );
}
