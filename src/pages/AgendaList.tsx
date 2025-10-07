import { useState } from "react";
import { FilteredAgendaList } from "@/components/agenda/FilteredAgendaList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function AgendaList() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Helmet>
        <title>Agenda - Rolezeira</title>
        <meta name="description" content="Veja todos os eventos culturais disponíveis" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Agenda Completa</h1>
            
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <FilteredAgendaList 
            filters={{ 
              status: 'upcoming',
              search: search || undefined
            }}
          />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
