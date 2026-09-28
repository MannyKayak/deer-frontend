export function ComparisonTraditional() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-md border-2 border-border-neutral bg-surface-muted p-[22px] opacity-85">
      <h3 className="font-lexend text-base font-semibold text-text-secondary">Metodo tradizionale</h3>
      <div className="space-y-2" aria-hidden="true">
        <div className="h-2 w-full rounded-full bg-surface-muted-line" />
        <div className="h-2 w-5/6 rounded-full bg-surface-muted-line" />
        <div className="h-2 w-4/6 rounded-full bg-surface-muted-line" />
      </div>
      <p className="font-sans text-[15px] leading-[1.5] text-text-secondary">
        Un muro di 3000 domande uguali, da rileggere all&apos;infinito sperando che restino in testa.
      </p>
    </div>
  );
}
