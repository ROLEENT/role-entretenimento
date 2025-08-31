#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';

// Verificar ambiente
if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seed não pode ser executado em produção!');
  process.exit(1);
}

const SUPABASE_URL = "https://nutlcbnruabjsxecqpnd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const cities = ['Porto Alegre', 'São Paulo', 'Rio de Janeiro', 'Curitiba', 'Florianópolis'];
const statuses = ['draft', 'scheduled', 'published'];
const types = ['show', 'festival', 'festa', 'workshop', 'talk'];
const venues = ['Bar do Centro', 'Club Noturno', 'Teatro Municipal', 'Centro Cultural', 'Casa de Shows'];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDateInLastWeeks(weeks: number): Date {
  const now = new Date();
  const weeksAgo = new Date(now.getTime() - (weeks * 7 * 24 * 60 * 60 * 1000));
  const randomTime = weeksAgo.getTime() + Math.random() * (now.getTime() - weeksAgo.getTime());
  return new Date(randomTime);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function seedAgenda() {
  console.log('🌱 Iniciando seed da agenda...');

  const events = [];

  for (let i = 1; i <= 20; i++) {
    const city = getRandomElement(cities);
    const status = getRandomElement(statuses);
    const type = getRandomElement(types);
    const venue = getRandomElement(venues);
    
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} ${i} - ${venue}`;
    const slug = generateSlug(title);
    const createdAt = getRandomDateInLastWeeks(8);
    const startAt = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000);

    events.push({
      title,
      slug,
      subtitle: `Um evento incrível em ${city}`,
      summary: `Descrição do evento ${title} que acontece em ${city}. Venha participar desta experiência única!`,
      city,
      location_name: venue,
      address: `Rua Exemplo ${i}, ${city}`,
      neighborhood: 'Centro',
      type,
      status,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      priority: Math.floor(Math.random() * 5),
      patrocinado: Math.random() > 0.8,
      tags: [type, city.toLowerCase().replace(' ', '-')],
      visibility_type: 'curadoria',
      price_min: status === 'published' ? Math.floor(Math.random() * 50) + 10 : null,
      price_max: status === 'published' ? Math.floor(Math.random() * 100) + 60 : null,
      age_rating: getRandomElement(['livre', '16+', '18+']),
      ticket_status: status === 'published' ? getRandomElement(['available', 'sold_out', 'soon']) : null,
      currency: 'BRL'
    });
  }

  console.log(`📝 Inserindo ${events.length} eventos...`);

  const { data, error } = await supabase
    .from('agenda_itens')
    .insert(events)
    .select('id, title, status, city');

  if (error) {
    console.error('❌ Erro ao inserir eventos:', error);
    return;
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📊 Eventos criados por status:`);
  
  const statusCounts = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`   • Draft: ${statusCounts.draft || 0}`);
  console.log(`   • Scheduled: ${statusCounts.scheduled || 0}`);
  console.log(`   • Published: ${statusCounts.published || 0}`);

  console.log(`🏙️  Eventos criados por cidade:`);
  const cityCounts = events.reduce((acc, event) => {
    acc[event.city] = (acc[event.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(cityCounts).forEach(([city, count]) => {
    console.log(`   • ${city}: ${count}`);
  });
}

seedAgenda().catch(console.error);