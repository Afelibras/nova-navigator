import { MapPinned } from "lucide-react";

export function ReferenceBanner({ name }: { name: string }) {
  return (
    <div className="pointer-events-auto glass rounded-full px-4 py-2 flex items-center gap-2 text-xs animate-fade-up">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <MapPinned className="h-3.5 w-3.5 text-accent" />
      <span className="text-muted-foreground">Ponto de referência mais próximo:</span>
      <span className="font-semibold text-foreground">{name}</span>
    </div>
  );
}
