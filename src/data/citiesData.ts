import saoPauloImage from "@/assets/sao-paulo-events.jpg";
import rioImage from "@/assets/rio-events.jpg";
import florianopolisImage from "@/assets/florianopolis-events.jpg";
import portoAlegreImage from "@/assets/porto-alegre-events.jpg";
import curitibaImage from "@/assets/curitiba-events.jpg";

export interface CityData {
  id: string;
  name: string;
  state: string;
  description: string;
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  stats: {
    totalEvents: number;
    monthlyEvents: number;
    venues: number;
    rating: number;
    reviews: number;
  };
  scene: {
    genres: string[];
    popularVenues: string[];
    musicStyle: string;
    nightlifeScore: number;
  };
}

export const citiesData: Record<string, CityData> = {
  'sao-paulo': {
    id: 'sao-paulo',
    name: 'São Paulo',
    state: 'São Paulo',
    description: 'A cidade que nunca dorme... nem para de dançar.',
    image: saoPauloImage,
    coordinates: { lat: -23.5505, lng: -46.6333 },
    stats: {
      totalEvents: 2400,
      monthlyEvents: 340,
      venues: 150,
      rating: 4.7,
      reviews: 1250
    },
    scene: {
      genres: ['Eletrônica', 'Rock', 'Funk', 'Sertanejo', 'Jazz'],
      popularVenues: ['D-Edge', 'Warung', 'Clash Club', 'Blue Note'],
      musicStyle: 'Diversificada e cosmopolita',
      nightlifeScore: 9.2
    }
  },
  'rio-de-janeiro': {
    id: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    state: 'Rio de Janeiro',
    description: 'Funk, favela, cor e calor cultural.',
    image: rioImage,
    coordinates: { lat: -22.9068, lng: -43.1729 },
    stats: {
      totalEvents: 1800,
      monthlyEvents: 260,
      venues: 120,
      rating: 4.6,
      reviews: 980
    },
    scene: {
      genres: ['Funk', 'Samba', 'Pagode', 'Eletrônica', 'Rock'],
      popularVenues: ['Fundição Progresso', 'Circo Voador', 'Marina da Glória'],
      musicStyle: 'Funk carioca e cultura local',
      nightlifeScore: 8.8
    }
  },
  'florianopolis': {
    id: 'florianopolis',
    name: 'Florianópolis',
    state: 'Santa Catarina',
    description: 'Beira-mar, eletrônica e coletivo.',
    image: florianopolisImage,
    coordinates: { lat: -27.5969, lng: -48.5495 },
    stats: {
      totalEvents: 800,
      monthlyEvents: 120,
      venues: 45,
      rating: 4.9,
      reviews: 650
    },
    scene: {
      genres: ['Eletrônica', 'Beach House', 'Techno', 'Progressive'],
      popularVenues: ['Pacha Floripa', 'Green Valley', 'P12'],
      musicStyle: 'Eletrônica internacional',
      nightlifeScore: 9.5
    }
  },
  'porto_alegre': {
    id: 'porto_alegre',
    name: 'Porto Alegre',
    state: 'Rio Grande do Sul',
    description: 'A cena alternativa pulsa forte no Sul.',
    image: portoAlegreImage,
    coordinates: { lat: -30.0346, lng: -51.2177 },
    stats: {
      totalEvents: 600,
      monthlyEvents: 90,
      venues: 35,
      rating: 4.8,
      reviews: 420
    },
    scene: {
      genres: ['Rock', 'Indie', 'Alternativo', 'Folk', 'MPB'],
      popularVenues: ['Opinião', 'Ocidente', 'Plano B'],
      musicStyle: 'Rock alternativo e indie',
      nightlifeScore: 8.5
    }
  },
  'curitiba': {
    id: 'curitiba',
    name: 'Curitiba',
    state: 'Paraná',
    description: 'Frio na rua, calor nas pistas.',
    image: curitibaImage,
    coordinates: { lat: -25.4284, lng: -49.2733 },
    stats: {
      totalEvents: 750,
      monthlyEvents: 110,
      venues: 40,
      rating: 4.2,
      reviews: 380
    },
    scene: {
      genres: ['Rock', 'Metal', 'Punk', 'Eletrônica', 'Jazz'],
      popularVenues: ['Tork n Roll', 'Morrison Rock Bar', 'Blues Bar'],
      musicStyle: 'Rock e metal underground',
      nightlifeScore: 7.8
    }
  }
};