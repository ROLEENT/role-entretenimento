export interface Event {
  id: string;
  title: string;
  venue: string;
  location: string;
  city: string;
  time: string;
  date: string;
  genre: string;
  category: string;
  attendees: number;
  price: number;
  description: string;
  image: string;
  featured: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const eventsData: Event[] = [
  {
    id: "1",
    title: "Noite Eletrônica no D-Edge",
    venue: "D-Edge",
    location: "Vila Olímpia, SP",
    city: "São Paulo",
    time: "22:00",
    date: "2024-08-22",
    genre: "Eletrônica",
    category: "Música",
    attendees: 1200,
    price: 80,
    description: "A melhor noite eletrônica da cidade com DJs internacionais",
    image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
    featured: true,
    coordinates: { lat: -23.5505, lng: -46.6333 }
  },
  {
    id: "2",
    title: "Rock in Roll Pub",
    venue: "Pub Rock Station",
    location: "Vila Madalena, SP",
    city: "São Paulo",
    time: "20:30",
    date: "2024-08-22",
    genre: "Rock",
    category: "Música",
    attendees: 350,
    price: 45,
    description: "Noite de rock nacional e internacional",
    image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
    featured: false,
    coordinates: { lat: -23.5505, lng: -46.6444 }
  },
  {
    id: "3",
    title: "Baile Funk da Quebrada",
    venue: "Casa do Funk",
    location: "Cidade Tiradentes, SP",
    city: "São Paulo",
    time: "23:00",
    date: "2024-08-22",
    genre: "Funk",
    category: "Festa",
    attendees: 800,
    price: 25,
    description: "O melhor baile funk da região com MCs locais",
    image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
    featured: true,
    coordinates: { lat: -23.5505, lng: -46.3833 }
  },
  {
    id: "4",
    title: "Jazz & Blues Night",
    venue: "Blue Note SP",
    location: "Itaim Bibi, SP",
    city: "São Paulo",
    time: "21:00",
    date: "2024-08-22",
    genre: "Jazz",
    category: "Música",
    attendees: 180,
    price: 90,
    description: "Uma noite especial com jazz e blues de qualidade",
    image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
    featured: false,
    coordinates: { lat: -23.5505, lng: -46.6777 }
  },
  {
    id: "5",
    title: "Festival de Arte Urbana",
    venue: "Parque Ibirapuera",
    location: "Ibirapuera, SP",
    city: "São Paulo",
    time: "14:00",
    date: "2024-08-23",
    genre: "Arte",
    category: "Arte",
    attendees: 2500,
    price: 0,
    description: "Festival gratuito de arte urbana com exposições e workshops",
    image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
    featured: true,
    coordinates: { lat: -23.5505, lng: -46.6591 }
  },
  {
    id: "6",
    title: "Show Sertanejo Universitário",
    venue: "Arena SP",
    location: "Barra Funda, SP",
    city: "São Paulo",
    time: "19:00",
    date: "2024-08-24",
    genre: "Sertanejo",
    category: "Show",
    attendees: 15000,
    price: 120,
    description: "Grande show de sertanejo universitário",
    image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
    featured: false,
    coordinates: { lat: -23.5280, lng: -46.6653 }
  },
  {
    id: "7",
    title: "Festa de Formatura UFMG",
    venue: "Palácio das Artes",
    location: "Centro, BH",
    city: "Belo Horizonte",
    time: "20:00",
    date: "2024-08-23",
    genre: "Universitário",
    category: "Festa",
    attendees: 500,
    price: 60,
    description: "Festa de formatura da turma de 2024",
    image: "/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png",
    featured: false,
    coordinates: { lat: -19.9245, lng: -43.9352 }
  },
  {
    id: "8",
    title: "Beach Party Floripa",
    venue: "Praia de Jurerê",
    location: "Jurerê Internacional, SC",
    city: "Florianópolis",
    time: "16:00",
    date: "2024-08-25",
    genre: "Eletrônica",
    category: "Festa",
    attendees: 3000,
    price: 150,
    description: "A maior beach party do verão",
    image: "/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png",
    featured: true,
    coordinates: { lat: -27.4417, lng: -48.4927 }
  }
];