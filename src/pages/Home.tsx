import { FilteredAgendaList } from "@/components/agenda/FilteredAgendaList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Rolezeira - Agenda Cultural</title>
        <meta name="description" content="Descubra os melhores eventos culturais da sua cidade" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Eventos em Destaque</h1>
            <p className="text-muted-foreground">
              Descubra os melhores eventos culturais acontecendo agora
            </p>
          </div>
          
          <FilteredAgendaList 
            filters={{ status: 'upcoming' }}
            limit={12}
            showViewMore={true}
          />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
