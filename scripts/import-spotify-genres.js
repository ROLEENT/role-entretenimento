/**
 * Script para importar gêneros do Spotify para o ROLÊ
 * Usa o Supabase client com service role para inserir dados em massa
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { parse } from 'csv-parse';

// Configurações - usar variáveis de ambiente
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nutlcbnruabjsxecqpnd.supabase.co';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_SERVICE_ROLE) {
  console.error('❌ SUPABASE_SERVICE_ROLE é obrigatória');
  console.log('Use: SUPABASE_SERVICE_ROLE=your_key node scripts/import-spotify-genres.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Dataset expandido de gêneros musicais
const SPOTIFY_GENRES_DATASET = [
  // Eletrônica - Principais
  { name: 'Techno', source: 'spotify', parent_name: null, is_active: true },
  { name: 'House', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Trance', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Dubstep', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Drum & Bass', source: 'spotify', parent_name: null, is_active: true },
  
  // Techno - Subgêneros
  { name: 'Minimal Techno', source: 'spotify', parent_name: 'Techno', is_active: true },
  { name: 'Detroit Techno', source: 'spotify', parent_name: 'Techno', is_active: true },
  { name: 'Acid Techno', source: 'spotify', parent_name: 'Techno', is_active: false },
  { name: 'Industrial Techno', source: 'spotify', parent_name: 'Techno', is_active: true },
  
  // House - Subgêneros
  { name: 'Deep House', source: 'spotify', parent_name: 'House', is_active: true },
  { name: 'Tech House', source: 'spotify', parent_name: 'House', is_active: true },
  { name: 'Progressive House', source: 'spotify', parent_name: 'House', is_active: true },
  { name: 'Tribal House', source: 'spotify', parent_name: 'House', is_active: false },
  { name: 'Afro House', source: 'spotify', parent_name: 'House', is_active: true },
  
  // Hip Hop & Urbano
  { name: 'Hip Hop', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Trap', source: 'spotify', parent_name: 'Hip Hop', is_active: true },
  { name: 'Rap', source: 'spotify', parent_name: 'Hip Hop', is_active: true },
  { name: 'R&B', source: 'spotify', parent_name: null, is_active: true },
  
  // Brasileiros
  { name: 'Funk Carioca', source: 'manual', parent_name: null, is_active: true },
  { name: 'MPB', source: 'manual', parent_name: null, is_active: true },
  { name: 'Samba', source: 'manual', parent_name: null, is_active: true },
  { name: 'Pagode', source: 'manual', parent_name: 'Samba', is_active: true },
  { name: 'Forró', source: 'manual', parent_name: null, is_active: true },
  { name: 'Axé', source: 'manual', parent_name: null, is_active: true },
  { name: 'Sertanejo', source: 'manual', parent_name: null, is_active: true },
  { name: 'Bossa Nova', source: 'manual', parent_name: null, is_active: true },
  
  // Rock & Alternativo
  { name: 'Rock', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Indie Rock', source: 'spotify', parent_name: 'Rock', is_active: true },
  { name: 'Alternative Rock', source: 'spotify', parent_name: 'Rock', is_active: true },
  { name: 'Punk Rock', source: 'spotify', parent_name: 'Rock', is_active: false },
  
  // Pop & Mainstream
  { name: 'Pop', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Indie Pop', source: 'spotify', parent_name: 'Pop', is_active: true },
  { name: 'Synth Pop', source: 'spotify', parent_name: 'Pop', is_active: false },
  
  // Experimentais & Nichados
  { name: 'Hyperpop', source: 'spotify', parent_name: 'Pop', is_active: true },
  { name: 'Vaporwave', source: 'spotify', parent_name: null, is_active: false },
  { name: 'Lo-Fi Hip Hop', source: 'spotify', parent_name: 'Hip Hop', is_active: true },
  { name: 'Breakcore', source: 'spotify', parent_name: null, is_active: false },
  
  // Reggae & Afrobeat
  { name: 'Reggae', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Dub', source: 'spotify', parent_name: 'Reggae', is_active: false },
  { name: 'Afrobeat', source: 'spotify', parent_name: null, is_active: true },
  
  // Latinos
  { name: 'Reggaeton', source: 'spotify', parent_name: null, is_active: true },
  { name: 'Latin Pop', source: 'spotify', parent_name: 'Pop', is_active: true },
  { name: 'Salsa', source: 'spotify', parent_name: null, is_active: false },
  
  // Gêneros Spotify mais nichados (inativos por padrão)
  { name: 'Ambient', source: 'spotify', parent_name: null, is_active: false },
  { name: 'IDM', source: 'spotify', parent_name: null, is_active: false },
  { name: 'Glitch', source: 'spotify', parent_name: null, is_active: false },
  { name: 'Future Bass', source: 'spotify', parent_name: null, is_active: false },
  { name: 'Tropical House', source: 'spotify', parent_name: 'House', is_active: false },
];

function toSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function upsertGenres(genres) {
  console.log(`🚀 Iniciando importação de ${genres.length} gêneros...`);
  
  // 1) Inserir gêneros pais primeiro
  const parents = genres
    .filter(g => !g.parent_name)
    .map(g => ({
      name: g.name.trim(),
      slug: toSlug(g.name),
      source: g.source || 'spotify',
      is_active: g.is_active ?? false,
      active: g.is_active ?? false // manter compatibilidade
    }));

  if (parents.length) {
    console.log(`📁 Inserindo ${parents.length} gêneros principais...`);
    const { error } = await supabase
      .from('genres')
      .upsert(parents, { onConflict: 'slug' });
    
    if (error) {
      console.error('❌ Erro ao inserir gêneros principais:', error);
      throw error;
    }
    console.log('✅ Gêneros principais inseridos');
  }

  // 2) Buscar todos os gêneros para mapear IDs
  const { data: allGenres, error: qErr } = await supabase
    .from('genres')
    .select('id, name, slug');
  
  if (qErr) {
    console.error('❌ Erro ao buscar gêneros:', qErr);
    throw qErr;
  }

  const genreByName = new Map(
    allGenres.map(g => [g.name.toLowerCase(), g])
  );

  // 3) Inserir gêneros filhos com parent_genre_id
  const children = genres
    .filter(g => g.parent_name)
    .map(g => {
      const parent = genreByName.get(g.parent_name.toLowerCase());
      if (!parent) {
        console.warn(`⚠️ Gênero pai "${g.parent_name}" não encontrado para "${g.name}"`);
      }
      
      return {
        name: g.name.trim(),
        slug: toSlug(g.name),
        source: g.source || 'spotify',
        is_active: g.is_active ?? false,
        active: g.is_active ?? false,
        parent_genre_id: parent?.id || null
      };
    });

  if (children.length) {
    console.log(`👶 Inserindo ${children.length} subgêneros...`);
    const { error } = await supabase
      .from('genres')
      .upsert(children, { onConflict: 'slug' });
    
    if (error) {
      console.error('❌ Erro ao inserir subgêneros:', error);
      throw error;
    }
    console.log('✅ Subgêneros inseridos');
  }

  // 4) Estatísticas finais
  const { count: totalCount } = await supabase
    .from('genres')
    .select('*', { count: 'exact', head: true });
  
  const { count: activeCount } = await supabase
    .from('genres')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log(`\n📊 ESTATÍSTICAS FINAIS:`);
  console.log(`   Total de gêneros: ${totalCount}`);
  console.log(`   Gêneros ativos: ${activeCount}`);
  console.log(`   Gêneros inativos: ${totalCount - activeCount}`);
}

async function importFromCSV(csvPath) {
  return new Promise((resolve, reject) => {
    const records = [];
    
    fs.createReadStream(csvPath)
      .pipe(parse({ 
        columns: true, 
        trim: true,
        skip_empty_lines: true 
      }))
      .on('data', record => {
        // Converter string boolean para boolean
        record.is_active = record.is_active?.toLowerCase() === 'true';
        records.push(record);
      })
      .on('end', () => resolve(records))
      .on('error', reject);
  });
}

async function main() {
  try {
    const csvPath = process.argv[2];
    
    let genresToImport;
    
    if (csvPath && fs.existsSync(csvPath)) {
      console.log(`📁 Carregando gêneros do arquivo: ${csvPath}`);
      genresToImport = await importFromCSV(csvPath);
    } else {
      console.log(`🎵 Usando dataset padrão com ${SPOTIFY_GENRES_DATASET.length} gêneros`);
      genresToImport = SPOTIFY_GENRES_DATASET;
    }
    
    await upsertGenres(genresToImport);
    
    console.log('\n🎉 Importação concluída com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Verifique os gêneros no admin v3');
    console.log('   2. Ative gêneros conforme necessário');
    console.log('   3. Configure hierarquias personalizadas');
    
  } catch (error) {
    console.error('\n❌ Erro na importação:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { upsertGenres, SPOTIFY_GENRES_DATASET };