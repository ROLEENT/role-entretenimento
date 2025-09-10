import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nutlcbnruabjsxecqpnd.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanupE2EData() {
  console.log('🧹 Cleaning up E2E test data...');

  try {
    // Clean up artists created during E2E tests
    const { data: artists, error: fetchError } = await supabase
      .from('artists')
      .select('id, stage_name')
      .ilike('stage_name', 'E2E -%');

    if (fetchError) {
      console.error('❌ Error fetching E2E artists:', fetchError);
      process.exit(1);
    }

    if (artists && artists.length > 0) {
      console.log(`🗑️ Found ${artists.length} E2E artists to clean up`);

      for (const artist of artists) {
        console.log(`  - Deleting: ${artist.stage_name}`);
      }

      // Delete artist relationships first
      const artistIds = artists.map(a => a.id);

      // Clean up artist categories
      const { error: categoriesError } = await supabase
        .from('artists_categories')
        .delete()
        .in('artist_id', artistIds);

      if (categoriesError) {
        console.warn('⚠️ Error cleaning artist categories:', categoriesError);
      }

      // Clean up artist genres
      const { error: genresError } = await supabase
        .from('artists_genres')
        .delete()
        .in('artist_id', artistIds);

      if (genresError) {
        console.warn('⚠️ Error cleaning artist genres:', genresError);
      }

      // Delete the artists
      const { error: deleteError } = await supabase
        .from('artists')
        .delete()
        .in('id', artistIds);

      if (deleteError) {
        console.error('❌ Error deleting E2E artists:', deleteError);
        process.exit(1);
      }

      console.log('✅ E2E artists cleaned up successfully');
    } else {
      console.log('✅ No E2E artists found to clean up');
    }

    // Clean up any test categories created during E2E tests
    const { data: categories } = await supabase
      .from('artist_categories')
      .select('id, name')
      .ilike('name', '%E2E%');

    if (categories && categories.length > 0) {
      console.log(`🗑️ Found ${categories.length} E2E categories to clean up`);
      
      const categoryIds = categories.map(c => c.id);
      
      const { error: deleteCategoriesError } = await supabase
        .from('artist_categories')
        .delete()
        .in('id', categoryIds);

      if (deleteCategoriesError) {
        console.warn('⚠️ Error cleaning E2E categories:', deleteCategoriesError);
      } else {
        console.log('✅ E2E categories cleaned up successfully');
      }
    }

    // Clean up any test genres created during E2E tests
    const { data: genres } = await supabase
      .from('genres')
      .select('id, name')
      .ilike('name', '%E2E%');

    if (genres && genres.length > 0) {
      console.log(`🗑️ Found ${genres.length} E2E genres to clean up`);
      
      const genreIds = genres.map(g => g.id);
      
      const { error: deleteGenresError } = await supabase
        .from('genres')
        .delete()
        .in('id', genreIds);

      if (deleteGenresError) {
        console.warn('⚠️ Error cleaning E2E genres:', deleteGenresError);
      } else {
        console.log('✅ E2E genres cleaned up successfully');
      }
    }

    console.log('🎉 E2E cleanup complete!');

  } catch (error) {
    console.error('❌ Unexpected error during cleanup:', error);
    process.exit(1);
  }
}

cleanupE2EData();