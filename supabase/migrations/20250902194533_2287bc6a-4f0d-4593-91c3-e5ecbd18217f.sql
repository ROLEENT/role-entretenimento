-- Fix genres table structure and populate with comprehensive music genres
ALTER TABLE public.genres 
ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS slug text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS genres_slug_idx ON public.genres(slug);

-- Insert comprehensive list of music genres
INSERT INTO public.genres (name, slug, active) VALUES
-- Electronic Music
('House', 'house', true),
('Techno', 'techno', true),
('Trance', 'trance', true),
('Dubstep', 'dubstep', true),
('Drum & Bass', 'drum-and-bass', true),
('Ambient', 'ambient', true),
('Breakbeat', 'breakbeat', true),
('Garage', 'garage', true),
('Hardstyle', 'hardstyle', true),
('Progressive House', 'progressive-house', true),
('Deep House', 'deep-house', true),
('Tech House', 'tech-house', true),
('Minimal Techno', 'minimal-techno', true),
('Future Bass', 'future-bass', true),
('Trap', 'trap', true),

-- Rock & Alternative
('Rock', 'rock', true),
('Pop Rock', 'pop-rock', true),
('Alternative Rock', 'alternative-rock', true),
('Indie Rock', 'indie-rock', true),
('Hard Rock', 'hard-rock', true),
('Punk Rock', 'punk-rock', true),
('Classic Rock', 'classic-rock', true),
('Progressive Rock', 'progressive-rock', true),
('Grunge', 'grunge', true),
('Post-Rock', 'post-rock', true),
('Shoegaze', 'shoegaze', true),

-- Metal
('Heavy Metal', 'heavy-metal', true),
('Death Metal', 'death-metal', true),
('Black Metal', 'black-metal', true),
('Thrash Metal', 'thrash-metal', true),
('Power Metal', 'power-metal', true),
('Doom Metal', 'doom-metal', true),
('Gothic Metal', 'gothic-metal', true),
('Symphonic Metal', 'symphonic-metal', true),

-- Pop & Mainstream
('Pop', 'pop', true),
('Synth-pop', 'synth-pop', true),
('Dance Pop', 'dance-pop', true),
('Teen Pop', 'teen-pop', true),
('Electropop', 'electropop', true),
('Indie Pop', 'indie-pop', true),
('Art Pop', 'art-pop', true),

-- Hip-Hop & Rap
('Hip-Hop', 'hip-hop', true),
('Rap', 'rap', true),
('Old School Hip-Hop', 'old-school-hip-hop', true),
('Conscious Hip-Hop', 'conscious-hip-hop', true),
('Gangsta Rap', 'gangsta-rap', true),
('Alternative Hip-Hop', 'alternative-hip-hop', true),
('Boom Bap', 'boom-bap', true),

-- R&B & Soul
('R&B', 'r-and-b', true),
('Soul', 'soul', true),
('Neo-Soul', 'neo-soul', true),
('Contemporary R&B', 'contemporary-r-and-b', true),
('Motown', 'motown', true),
('Funk', 'funk', true),

-- Jazz & Blues
('Jazz', 'jazz', true),
('Blues', 'blues', true),
('Smooth Jazz', 'smooth-jazz', true),
('Bebop', 'bebop', true),
('Big Band', 'big-band', true),
('Fusion', 'fusion', true),
('Swing', 'swing', true),
('Acid Jazz', 'acid-jazz', true),

-- Country & Folk
('Country', 'country', true),
('Folk', 'folk', true),
('Bluegrass', 'bluegrass', true),
('Americana', 'americana', true),
('Alt-Country', 'alt-country', true),
('Folk Rock', 'folk-rock', true),
('Indie Folk', 'indie-folk', true),

-- Latin Music
('Latin', 'latin', true),
('Salsa', 'salsa', true),
('Reggaeton', 'reggaeton', true),
('Bachata', 'bachata', true),
('Merengue', 'merengue', true),
('Cumbia', 'cumbia', true),
('Latin Pop', 'latin-pop', true),
('Latin Rock', 'latin-rock', true),

-- Brazilian Music
('MPB', 'mpb', true),
('Samba', 'samba', true),
('Bossa Nova', 'bossa-nova', true),
('Forró', 'forro', true),
('Axé', 'axe', true),
('Pagode', 'pagode', true),
('Sertanejo', 'sertanejo', true),
('Sertanejo Universitário', 'sertanejo-universitario', true),
('Funk Carioca', 'funk-carioca', true),
('Tropicália', 'tropicalia', true),
('Choro', 'choro', true),
('Maracatu', 'maracatu', true),
('Frevo', 'frevo', true),
('Baião', 'baiao', true),
('Xote', 'xote', true),
('Piseiro', 'piseiro', true),
('Arrocha', 'arrocha', true),

-- Reggae & Caribbean
('Reggae', 'reggae', true),
('Dancehall', 'dancehall', true),
('Ska', 'ska', true),
('Dub', 'dub', true),
('Roots Reggae', 'roots-reggae', true),

-- Classical & Orchestral
('Classical', 'classical', true),
('Orchestral', 'orchestral', true),
('Opera', 'opera', true),
('Chamber Music', 'chamber-music', true),
('Baroque', 'baroque', true),
('Romantic', 'romantic', true),
('Contemporary Classical', 'contemporary-classical', true),

-- World Music
('World Music', 'world-music', true),
('African', 'african', true),
('Celtic', 'celtic', true),
('Flamenco', 'flamenco', true),
('Indian Classical', 'indian-classical', true),
('Middle Eastern', 'middle-eastern', true),

-- Alternative & Experimental
('Alternative', 'alternative', true),
('Experimental', 'experimental', true),
('Noise', 'noise', true),
('Industrial', 'industrial', true),
('Avant-garde', 'avant-garde', true),
('New Wave', 'new-wave', true),
('Post-Punk', 'post-punk', true),

-- Soundtrack & Instrumental
('Soundtrack', 'soundtrack', true),
('Instrumental', 'instrumental', true),
('New Age', 'new-age', true),
('Meditation', 'meditation', true),
('Lo-fi', 'lo-fi', true),

-- Niche & Modern
('Vaporwave', 'vaporwave', true),
('Synthwave', 'synthwave', true),
('Chillwave', 'chillwave', true),
('Witch House', 'witch-house', true),
('Phonk', 'phonk', true),
('Drill', 'drill', true),
('Afrobeat', 'afrobeat', true),
('Afrobeats', 'afrobeats', true),
('K-Pop', 'k-pop', true),
('J-Pop', 'j-pop', true)

ON CONFLICT (slug) DO NOTHING;