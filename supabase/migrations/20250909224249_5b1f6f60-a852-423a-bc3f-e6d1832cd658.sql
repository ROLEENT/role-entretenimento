-- Criar entrada manual na agenda_itens para o evento e associar os artistas
INSERT INTO agenda_itens (
    id, title, slug, subtitle, summary, city, starts_at, end_at, 
    status, cover_url, location_name, organizer_id, created_at, updated_at,
    artists_names, is_published, published_at
) 
VALUES (
    'b395a531-11c7-4fc8-a54e-935fc78cacc5',
    'FINAL DRAG RACE BR – Watch Party',
    'final-drag-race-br-watch-party',
    'A grande final da segunda temporada exibida na Workroom com performances e DJ set',
    'A Workroom recebe a final de Drag Race BR com telão, performances drags, DJ set e torcida.',
    'Porto Alegre',
    '2025-09-11 22:00:00+00',
    '2025-09-12 05:00:00+00',
    'published',
    'https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/agenda-images/events/cover-images/db338f0a-dffd-439a-98f1-450e2fbf771c/1757451988295-r553g0c.png',
    'Workroom',
    'a082dcaa-2e4e-4d19-9fe0-43ff89309d2a',
    NOW(),
    NOW(),
    ARRAY['Tristan Soledade', 'Dylan Summers', 'Katrina Addams'],
    true,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    artists_names = EXCLUDED.artists_names,
    is_published = true,
    published_at = NOW(),
    organizer_id = EXCLUDED.organizer_id;

-- Associar os artistas ao agenda item
INSERT INTO agenda_item_artists (agenda_id, artist_id, position, headliner, role)
VALUES 
    ('b395a531-11c7-4fc8-a54e-935fc78cacc5', '7c55ac4c-9989-4de5-a175-928fa872f51b', 0, true, 'headliner'),
    ('b395a531-11c7-4fc8-a54e-935fc78cacc5', '10f43aca-e8c5-4913-b0fb-9673bbc229ff', 1, false, 'support'),
    ('b395a531-11c7-4fc8-a54e-935fc78cacc5', 'a0f57ad4-0f91-4f3b-bc45-03018d626c7f', 2, false, 'support')
ON CONFLICT DO NOTHING;