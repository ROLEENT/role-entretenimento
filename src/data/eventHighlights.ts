export interface EventHighlight {
  id: string;
  title: string;
  venue: string;
  location: string;
  ticketUrl?: string;
  editorialText: string;
  selectionReasons: string[];
  image: string;
  photoCredit: string;
  date: string;
  time: string;
  genre: string;
  price: number;
  city: string;
  citySlug: string;
  featured: boolean;
  weekRange: string;
}

export const eventHighlights: EventHighlight[] = [
  {
    id: "1",
    title: "Black Pantera + No Rest no Opinião",
    venue: "Bar Opinião",
    location: "Cidade Baixa, Porto Alegre",
    ticketUrl: "https://example.com/tickets/black-pantera",
    editorialText: "Uma das bandas mais potentes do rock nacional divide o palco com veteranos do crustpunk em uma noite que promete ser intensa. O Black Pantera traz sua tour Perpétuo, misturando rock, punk, hardcore e funk numa energia crua e ancestral que representa o melhor da resistência cultural brasileira.",
    selectionReasons: ["Impacto Cultural", "Diversidade Musical", "Resistência", "Qualidade Artística"],
    image: "/assets/Tributo a Ozzy no GREZZ.jpg",
    photoCredit: "Foto: Arquivo ROLÊ",
    date: "14/08/2024",
    time: "22:00",
    genre: "Rock/Punk",
    price: 35,
    city: "Porto Alegre",
    citySlug: "porto_alegre",
    featured: true,
    weekRange: "14-17 Agosto"
  },
  {
    id: "2", 
    title: "Shakti 2025 - Experiência Psytrance",
    venue: "Complexo Lami",
    location: "Lami, Porto Alegre",
    ticketUrl: "https://example.com/tickets/shakti-2025",
    editorialText: "Mais que uma festa, o Shakti é uma imersão completa. São 30 horas ininterruptas de psytrance, arte visual e conexão humana em meio à natureza. Um evento que redefine o conceito de experiência musical, reunindo 500 pessoas em busca de transcendência através da música eletrônica.",
    selectionReasons: ["Experiência Única", "Inovação", "Conexão com a Natureza", "Comunidade"],
    image: "/assets/Pista cheia no Opinião.jpg",
    photoCredit: "Foto: Coletivo Shakti",
    date: "17/08/2024",
    time: "14:00",
    genre: "Psytrance",
    price: 180,
    city: "Porto Alegre", 
    citySlug: "porto_alegre",
    featured: true,
    weekRange: "14-17 Agosto"
  },
  {
    id: "3",
    title: "Valéria Barcellos canta Gal Costa",
    venue: "Teatro Renascença",
    location: "Centro, Porto Alegre", 
    ticketUrl: "https://example.com/tickets/valeria-barcellos",
    editorialText: "Um tributo emocionante à eterna Gal Costa pelas mãos de uma das vozes mais respeitadas da MPB gaúcha. Valéria Barcellos revisita os clássicos da Divina com arranjos cuidadosos e uma interpretação que honra o legado sem perder a personalidade própria.",
    selectionReasons: ["Tributo Histórico", "Qualidade Vocal", "Patrimônio Cultural", "Emoção"],
    image: "/assets/Valéria Barcellos canta Gal.jpg",
    photoCredit: "Foto: Divulgação",
    date: "15/08/2024",
    time: "20:00", 
    genre: "MPB",
    price: 60,
    city: "Porto Alegre",
    citySlug: "porto_alegre",
    featured: false,
    weekRange: "14-17 Agosto"
  },
  {
    id: "4",
    title: "Freaky Melt feat. Disney Channel Hits",
    venue: "Clube Ocidente",
    location: "Centro, Porto Alegre",
    editorialText: "A nostalgia dos anos 2000 invade a pista com os maiores hits da era dourada do Disney Channel. Hilary Duff, Hannah Montana e outros ícones da geração millennial ganham vida em uma festa que celebra a inocência perdida e a música que marcou uma época.",
    selectionReasons: ["Nostalgia", "Cultura Pop", "Diversão Garantida", "Público Jovem"],
    image: "/assets/Melt feat. Goodbye Lenin no Ocidente.jpg",
    photoCredit: "Foto: Melt Collective",
    date: "16/08/2024", 
    time: "23:00",
    genre: "Pop",
    price: 25,
    city: "Porto Alegre",
    citySlug: "porto_alegre",
    featured: false,
    weekRange: "14-17 Agosto"
  },
  {
    id: "5",
    title: "Silvetty Montilla na Workroom",
    venue: "Workroom Club",
    location: "Moinhos de Vento, Porto Alegre",
    ticketUrl: "https://example.com/tickets/silvetty-montilla",
    editorialText: "A drag queen mais icônica do país transforma a Workroom em seu palco particular. Silvetty traz seu humor afiado, performances inesquecíveis e uma energia que só ela consegue entregar, prometendo uma noite de empoderamento e muito glamour.",
    selectionReasons: ["Representatividade", "Arte Drag", "Entretenimento", "Empoderamento"],
    image: "/assets/Silvetty Montilla na Workroom.jpg",
    photoCredit: "Foto: Workroom Club",
    date: "16/08/2024",
    time: "00:00",
    genre: "Drag Show",
    price: 45,
    city: "Porto Alegre",
    citySlug: "porto_alegre",
    featured: true,
    weekRange: "14-17 Agosto"
  }
];

export const getEventHighlightsByCity = (citySlug: string): EventHighlight[] => {
  return eventHighlights.filter(event => event.citySlug === citySlug);
};

export const getFeaturedEventHighlights = (): EventHighlight[] => {
  return eventHighlights.filter(event => event.featured);
};

export const getEventHighlightsByWeek = (weekRange: string): EventHighlight[] => {
  return eventHighlights.filter(event => event.weekRange === weekRange);
};