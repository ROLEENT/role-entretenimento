-- Adicionar o TUPY ao evento PROBLEMÓN #2
INSERT INTO agenda_item_artists (agenda_id, artist_id, role, position, headliner)
VALUES ('40c87b95-8e91-468a-8772-d6bc9b125961', '2594b03f-45a7-45b5-8113-a0594ba1718e', 'performer', 1, false)
ON CONFLICT DO NOTHING;