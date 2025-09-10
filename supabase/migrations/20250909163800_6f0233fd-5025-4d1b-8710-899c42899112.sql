-- Remove the duplicate TUPY entry from PROBLEMÓN #2 (keep the headliner one)
DELETE FROM event_lineup_slot_artists 
WHERE slot_id = '38a780e0-8e0d-4b29-b858-d911ec93a53f' 
  AND artist_id = '2594b03f-45a7-45b5-8113-a0594ba1718e' 
  AND position = 1;