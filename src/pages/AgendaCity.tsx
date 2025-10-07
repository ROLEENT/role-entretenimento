import { useParams } from "react-router-dom";
import { FilteredAgendaList } from "@/components/agenda/FilteredAgendaList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

export default function AgendaCity() {
  const { city } = useParams<{ city: string }>();

  const cityName = city ? decodeURIComponent(city) : '';

  return (
    <>
      <Helmet>
        <title>{cityName} - Agenda Rolezeira</title>
        <meta name="description" content={`Eventos culturais em ${cityName}`} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Eventos em {cityName}</h1>
            <p className="text-muted-foreground">
              Descubra o que está acontecendo na cidade
            </p>
          </div>
          
          <FilteredAgendaList 
            filters={{ 
              status: 'upcoming',
              city: cityName
            }}
          />
        </main>
        
        <Footer />
      </div>
    </>
  );
}
