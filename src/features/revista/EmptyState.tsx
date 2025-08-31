export default function EmptyState({ msg }: { msg?: string }) {
  return (
    <div className="text-center py-16 grid gap-2">
      <h3 className="text-lg font-semibold">Nenhum artigo encontrado</h3>
      <p className="text-sm text-gray-600">{msg ?? "Ajuste os filtros ou tente mais tarde."}</p>
      <a href="/" className="inline-flex px-4 py-2 rounded-md border hover:bg-gray-50">Voltar para a Home</a>
    </div>
  );
}