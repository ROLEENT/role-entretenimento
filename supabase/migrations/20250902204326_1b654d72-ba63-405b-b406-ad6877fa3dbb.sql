-- Add policies for authenticated users with editor/admin roles to manage artist genres
CREATE POLICY "Editors can manage artist genres relationships" 
ON public.artists_genres 
FOR ALL 
TO authenticated
USING (check_user_is_editor_or_admin())
WITH CHECK (check_user_is_editor_or_admin());

-- Add policies for authenticated users with editor/admin roles to manage artist types
CREATE POLICY "Editors can manage artist types relationships" 
ON public.artists_artist_types 
FOR ALL 
TO authenticated
USING (check_user_is_editor_or_admin())
WITH CHECK (check_user_is_editor_or_admin());