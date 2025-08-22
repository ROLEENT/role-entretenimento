export interface WeeklyEvent {
  id: string;
  title: string;
  venue: string;
  location: string;
  city: string;
  date: string;
  time: string;
  genre: string;
  category: string;
  price: number;
  image: string;
  featured: boolean;
  trending: boolean;
  trendingScore: number;
  comments: number;
  attendees: number;
  tags: string[];
  description: string;
}

export interface WeekData {
  weekId: string;
  startDate: string;
  endDate: string;
  title: string;
  subtitle: string;
  featured: boolean;
  totalEvents: number;
  trending: WeeklyEvent[];
  mustSee: WeeklyEvent[];
  dailyEvents: Record<string, WeeklyEvent[]>;
}

export const weeklyData: Record<string, WeekData> = {
  '20-24-agosto': {
    weekId: '20-24-agosto',
    startDate: '2024-08-20',
    endDate: '2024-08-24',
    title: 'Semana de 20 a 24 de Agosto',
    subtitle: 'Eletrônica, rock e muito mais dominam a semana',
    featured: true,
    totalEvents: 47,
    trending: [
      {
        id: 'trend-1',
        title: 'Alok Live at Green Valley',
        venue: 'Green Valley',
        location: 'Camboriú, SC',
        city: 'Florianópolis',
        date: '2024-08-23',
        time: '23:00',
        genre: 'Eletrônica',
        category: 'Música',
        price: 350,
        image: '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png',
        featured: true,
        trending: true,
        trendingScore: 98,
        comments: 2847,
        attendees: 8500,
        tags: ['Alok', 'EDM', 'International'],
        description: 'O maior DJ brasileiro em uma noite épica no templo da eletrônica mundial'
      },
      {
        id: 'trend-2',
        title: 'Rock in Rio - Foo Fighters',
        venue: 'Cidade do Rock',
        location: 'Barra da Tijuca, RJ',
        city: 'Rio de Janeiro',
        date: '2024-08-22',
        time: '22:30',
        genre: 'Rock',
        category: 'Show',
        price: 280,
        image: '/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png',
        featured: true,
        trending: true,
        trendingScore: 95,
        comments: 1834,
        attendees: 15000,
        tags: ['Rock in Rio', 'Internacional', 'Lendário'],
        description: 'Os lendários Foo Fighters retornam ao Brasil em show histórico'
      }
    ],
    mustSee: [
      {
        id: 'must-1',
        title: 'Festival de Inverno Bonito',
        venue: 'Centro de Bonito',
        location: 'Bonito, MS',
        city: 'Campo Grande',
        date: '2024-08-21',
        time: '19:00',
        genre: 'MPB',
        category: 'Festival',
        price: 120,
        image: '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png',
        featured: true,
        trending: false,
        trendingScore: 87,
        comments: 456,
        attendees: 3000,
        tags: ['Festival', 'MPB', 'Natureza'],
        description: 'Música brasileira em meio às belezas naturais de Bonito'
      }
    ],
    dailyEvents: {
      '2024-08-20': [
        {
          id: 'day1-1',
          title: 'Terça Underground',
          venue: 'Sub Astor',
          location: 'Centro, SP',
          city: 'São Paulo',
          date: '2024-08-20',
          time: '22:00',
          genre: 'Techno',
          category: 'Música',
          price: 40,
          image: '/lovable-uploads/e7152d25-522d-4a55-9968-b848ce6cde97.png',
          featured: false,
          trending: false,
          trendingScore: 72,
          comments: 89,
          attendees: 200,
          tags: ['Underground', 'Techno'],
          description: 'Noite underground com techno de qualidade'
        }
      ],
      '2024-08-21': [
        {
          id: 'day2-1',
          title: 'Quarta do Rock',
          venue: 'Morrison Rock Bar',
          location: 'Batel, PR',
          city: 'Curitiba',
          date: '2024-08-21',
          time: '21:00',
          genre: 'Rock',
          category: 'Música',
          price: 25,
          image: '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png',
          featured: false,
          trending: false,
          trendingScore: 68,
          comments: 43,
          attendees: 150,
          tags: ['Rock', 'Clássico'],
          description: 'Os clássicos do rock nacional e internacional'
        }
      ]
    }
  },
  '27-31-agosto': {
    weekId: '27-31-agosto',
    startDate: '2024-08-27',
    endDate: '2024-08-31',
    title: 'Semana de 27 a 31 de Agosto',
    subtitle: 'Festival season com grandes nomes',
    featured: false,
    totalEvents: 52,
    trending: [
      {
        id: 'trend-3',
        title: 'Lollapalooza Brasil 2024',
        venue: 'Autódromo de Interlagos',
        location: 'Interlagos, SP',
        city: 'São Paulo',
        date: '2024-08-30',
        time: '14:00',
        genre: 'Festival',
        category: 'Festival',
        price: 450,
        image: '/lovable-uploads/c5238b2d-273a-46f1-a5a6-c330f2a3142c.png',
        featured: true,
        trending: true,
        trendingScore: 99,
        comments: 5247,
        attendees: 25000,
        tags: ['Lollapalooza', 'Festival', 'Multi-gênero'],
        description: 'O maior festival multi-gênero do Brasil'
      }
    ],
    mustSee: [],
    dailyEvents: {}
  }
};

export const getWeekByDate = (dateString: string): WeekData | null => {
  return weeklyData[dateString] || null;
};

export const getAllWeeks = (): WeekData[] => {
  return Object.values(weeklyData);
};

export const getNextWeek = (currentWeek: string): string | null => {
  const weeks = Object.keys(weeklyData);
  const currentIndex = weeks.indexOf(currentWeek);
  return currentIndex !== -1 && currentIndex < weeks.length - 1 
    ? weeks[currentIndex + 1] 
    : null;
};

export const getPreviousWeek = (currentWeek: string): string | null => {
  const weeks = Object.keys(weeklyData);
  const currentIndex = weeks.indexOf(currentWeek);
  return currentIndex > 0 ? weeks[currentIndex - 1] : null;
};