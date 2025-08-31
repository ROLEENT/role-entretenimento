import { FileX, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
}

export default function EmptyState({ 
  title = "Nada por aqui ainda",
  description = "Volte mais tarde ou confira a Revista.",
  actionLabel = "Ir para a Revista",
  actionLink = "/revista"
}: EmptyStateProps) {
  return (
    <section className="text-center py-16 grid gap-4">
      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
        <FileX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {description}
      </p>
      {actionLink && actionLabel && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors mx-auto"
        >
          <ExternalLink className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}
    </section>
  );
}