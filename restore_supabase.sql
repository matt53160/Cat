-- ===========================================
-- Restauration du backup Pet'odex v2
-- A coller dans Supabase SQL Editor
-- ===========================================

-- 1. Drop existing objects (order matters: views first, then tables)
DROP VIEW IF EXISTS public.user_photo_stats;
DROP VIEW IF EXISTS public.recent_photos_with_metadata;
DROP TABLE IF EXISTS public.photo_metadata;
DROP TABLE IF EXISTS public.animal_breeds;
DROP SEQUENCE IF EXISTS public.animal_breeds_id_seq;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- 2. Create function
CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 3. Create tables
CREATE TABLE public.animal_breeds (
    id integer NOT NULL,
    animal_type text NOT NULL,
    breed_name text NOT NULL,
    breed_name_fr text,
    typical_colors text[],
    typical_patterns text[],
    size_category text,
    origin_country text,
    description text
);

CREATE SEQUENCE public.animal_breeds_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.animal_breeds_id_seq OWNED BY public.animal_breeds.id;
ALTER TABLE ONLY public.animal_breeds ALTER COLUMN id SET DEFAULT nextval('public.animal_breeds_id_seq'::regclass);

CREATE TABLE public.photo_metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    photo_path text NOT NULL,
    photo_url text,
    animal_type text,
    breed text,
    breed_confidence numeric(3,2),
    primary_color text,
    secondary_colors text[],
    coat_pattern text,
    eye_color text,
    size_category text,
    age_estimate text,
    ai_provider text DEFAULT 'openai'::text,
    ai_model text,
    ai_raw_response jsonb,
    ai_processed_at timestamp with time zone,
    ai_processing_time_ms integer,
    latitude numeric(10,8),
    longitude numeric(11,8),
    location_name text,
    custom_name text,
    custom_description text,
    is_favorite boolean DEFAULT false,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Primary keys
ALTER TABLE ONLY public.animal_breeds ADD CONSTRAINT animal_breeds_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.photo_metadata ADD CONSTRAINT photo_metadata_pkey PRIMARY KEY (id);

-- 5. Views
CREATE VIEW public.recent_photos_with_metadata AS
 SELECT pm.id,
    pm.user_id,
    pm.photo_path,
    pm.photo_url,
    pm.animal_type,
    pm.breed,
    pm.breed_confidence,
    pm.primary_color,
    pm.secondary_colors,
    pm.coat_pattern,
    pm.eye_color,
    pm.size_category,
    pm.age_estimate,
    pm.ai_provider,
    pm.ai_model,
    pm.ai_raw_response,
    pm.ai_processed_at,
    pm.ai_processing_time_ms,
    pm.latitude,
    pm.longitude,
    pm.location_name,
    pm.custom_name,
    pm.custom_description,
    pm.is_favorite,
    pm.tags,
    pm.created_at,
    pm.updated_at,
    ab.breed_name_fr,
    ab.origin_country
   FROM (public.photo_metadata pm
     LEFT JOIN public.animal_breeds ab ON ((pm.breed = ab.breed_name)))
  ORDER BY pm.created_at DESC;

CREATE VIEW public.user_photo_stats AS
 SELECT user_id,
    count(*) AS total_photos,
    count(DISTINCT animal_type) AS different_animals,
    count(
        CASE
            WHEN is_favorite THEN 1
            ELSE NULL::integer
        END) AS favorite_photos,
    min(created_at) AS first_photo,
    max(created_at) AS last_photo
   FROM public.photo_metadata
  GROUP BY user_id;

-- 7. Trigger
CREATE TRIGGER update_photo_metadata_updated_at BEFORE UPDATE ON public.photo_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Insert animal_breeds data
INSERT INTO public.animal_breeds (id, animal_type, breed_name, breed_name_fr, typical_colors, typical_patterns, size_category) VALUES
(1, 'chat', 'Maine Coon', 'Maine Coon', '{roux,noir,blanc,crème}', '{tigré,uni}', 'grand'),
(2, 'chat', 'Persian', 'Persan', '{blanc,crème,argenté}', '{uni,colorpoint}', 'moyen'),
(3, 'chat', 'Siamese', 'Siamois', '{crème,chocolat,lilas}', '{colorpoint}', 'moyen'),
(4, 'chat', 'British Shorthair', 'British Shorthair', '{gris,bleu,crème}', '{uni}', 'moyen'),
(5, 'chat', 'Ragdoll', 'Ragdoll', '{crème,chocolat,lilas}', '{colorpoint,bicolore}', 'grand'),
(6, 'chien', 'Golden Retriever', 'Golden Retriever', '{doré,crème}', '{uni}', 'grand'),
(7, 'chien', 'Labrador', 'Labrador', '{noir,chocolat,sable}', '{uni}', 'grand'),
(8, 'chien', 'German Shepherd', 'Berger Allemand', '{noir,feu}', '{bicolore}', 'grand'),
(9, 'chien', 'French Bulldog', 'Bouledogue Français', '{fauve,bringé,blanc}', '{uni,bringé}', 'petit'),
(10, 'chien', 'Border Collie', 'Border Collie', '{noir,blanc}', '{bicolore}', 'moyen');

SELECT setval('public.animal_breeds_id_seq', 10);

-- 9. Insert photo_metadata data
INSERT INTO public.photo_metadata (id, user_id, photo_path, photo_url, animal_type, breed, breed_confidence, primary_color, secondary_colors, coat_pattern, eye_color, size_category, age_estimate, ai_provider, ai_model, ai_raw_response, ai_processed_at, ai_processing_time_ms, latitude, longitude, location_name, custom_name, custom_description, is_favorite, tags, created_at, updated_at) VALUES
('f4be367e-978c-4e79-b2e7-4520fac2647e', 'c10de1c7-26db-4539-b043-09a323780d39', 'user-photos/matteodjerbi@icloud.com/imported_1757578614970.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/matteodjerbi@icloud.com/imported_1757578614970.jpg', 'chat', NULL, 0.00, 'marron', '{noir,gris}', 'tigré', 'vert', 'petit', 'chaton', 'openai', 'gpt-4o-mini', '{"breed": "null", "eye_color": "vert", "hasAnimal": true, "animal_type": "chat", "age_estimate": "chaton", "coat_pattern": "tigré", "primary_color": "marron", "size_category": "petit", "characteristics": ["curieux", "joueur", "actif"], "breed_confidence": 0, "secondary_colors": ["noir", "gris"]}', '2025-09-11 08:17:07.217+00', 11979, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 08:16:44.431957+00', '2025-09-11 08:16:44.431957+00'),
('fdbd272f-cf2a-4f94-bf12-53b459aae65d', 'c10de1c7-26db-4539-b043-09a323780d39', 'user-photos/matteodjerbi@icloud.com/imported_1757581367835.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/matteodjerbi@icloud.com/imported_1757581367835.jpg', 'oiseau', NULL, 0.00, 'marron', '{noir,blanc}', 'uni', NULL, 'moyen', 'adulte', 'openai', 'gpt-4o-mini', '{"breed": "null", "eye_color": "null", "hasAnimal": true, "animal_type": "oiseau", "age_estimate": "adulte", "coat_pattern": "uni", "primary_color": "marron", "size_category": "moyen", "characteristics": ["aquatique", "sociable", "herbivore"], "breed_confidence": 0, "secondary_colors": ["noir", "blanc"]}', '2025-09-11 09:03:41.728+00', 53501, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 09:03:18.763746+00', '2025-09-11 09:03:18.763746+00'),
('30571921-dc00-4717-93ad-516de18b286c', 'c10de1c7-26db-4539-b043-09a323780d39', 'user-photos/matteodjerbi@icloud.com/imported_1757581480306.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/matteodjerbi@icloud.com/imported_1757581480306.jpg', 'chat', NULL, 0.00, 'gris', '{noir}', 'tigré', 'jaune', 'moyen', 'jeune', 'openai', 'gpt-4o-mini', '{"breed": "null", "eye_color": "jaune", "hasAnimal": true, "animal_type": "chat", "age_estimate": "jeune", "coat_pattern": "tigré", "primary_color": "gris", "size_category": "moyen", "characteristics": ["joueur", "curieux", "affectueux"], "breed_confidence": 0, "secondary_colors": ["noir"]}', '2025-09-11 09:05:07.392+00', 26749, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 09:04:44.118961+00', '2025-09-11 09:04:44.118961+00'),
('30926560-f07f-4ca9-b2da-90a525b623cf', 'c10de1c7-26db-4539-b043-09a323780d39', 'user-photos/matteodjerbi@icloud.com/imported_1757581692347.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/matteodjerbi@icloud.com/imported_1757581692347.jpg', 'chat', NULL, 0.00, 'gris', '{noir}', 'tigré', 'jaune', 'moyen', 'adulte', 'openai', 'gpt-4o-mini', '{"breed": "null", "eye_color": "jaune", "hasAnimal": true, "animal_type": "chat", "age_estimate": "adulte", "coat_pattern": "tigré", "primary_color": "gris", "size_category": "moyen", "characteristics": ["calme", "affectueux", "curieux"], "breed_confidence": 0, "secondary_colors": ["noir"]}', '2025-09-11 09:08:44.968+00', 32346, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 09:08:21.672364+00', '2025-09-11 09:08:21.672364+00'),
('0bc95432-5332-422e-a9a0-a96a26f86547', 'c10de1c7-26db-4539-b043-09a323780d39', 'user-photos/matteodjerbi@icloud.com/imported_1757581755352.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/matteodjerbi@icloud.com/imported_1757581755352.jpg', 'chat', NULL, 0.00, 'gris', '{noir}', 'tigré', NULL, 'moyen', 'jeune', 'openai', 'gpt-4o-mini', '{"breed": "null", "eye_color": "null", "hasAnimal": true, "animal_type": "chat", "age_estimate": "jeune", "coat_pattern": "tigré", "primary_color": "gris", "size_category": "moyen", "characteristics": ["curieux", "actif", "joueur"], "breed_confidence": 0, "secondary_colors": ["noir"]}', '2025-09-11 09:09:41.729+00', 25998, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 09:09:18.418557+00', '2025-09-11 09:09:18.418557+00'),
('ec281761-a825-41a6-a0f4-d323afef27c3', '7ddcd81d-9a02-4d23-b84a-b22343f831d0', 'user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/1757595364167.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/1757595364167.jpg', 'chien', 'Berger Bernois', 0.90, 'noir', '{blanc,roux}', 'bicolore', NULL, 'grand', 'adulte', 'openai', 'gpt-4o-mini', '{"breed": "Berger Bernois", "eye_color": null, "hasAnimal": true, "animal_type": "chien", "age_estimate": "adulte", "coat_pattern": "bicolore", "primary_color": "noir", "size_category": "grand", "characteristics": ["poil long", "calme", "sociable"], "breed_confidence": 0.9, "secondary_colors": ["blanc", "roux"]}', '2025-09-11 12:56:14.503+00', 10181, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 12:56:15.268481+00', '2025-09-11 12:56:15.268481+00'),
('6cdd643f-c33b-46fe-9aff-79c5dd68fa4b', '7ddcd81d-9a02-4d23-b84a-b22343f831d0', 'user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/1757605236073.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/1757605236073.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'openai', 'gpt-4o-mini', '{"hasAnimal": false}', '2025-09-11 15:40:46.905+00', 10347, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 15:40:47.351029+00', '2025-09-11 15:40:47.351029+00'),
('31fff4c1-b5e0-459d-970c-23953845307d', '7ddcd81d-9a02-4d23-b84a-b22343f831d0', 'user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/imported_1757607414526.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/imported_1757607414526.jpg', 'chien', 'Berger Bernois', 0.80, 'noir', '{blanc,fauve}', 'bicolore', NULL, 'grand', 'jeune', 'openai', 'gpt-4o-mini', '{"breed": "Berger Bernois", "eye_color": "null", "hasAnimal": true, "animal_type": "chien", "age_estimate": "jeune", "coat_pattern": "bicolore", "primary_color": "noir", "size_category": "grand", "characteristics": ["joueur", "affectueux", "sociable"], "breed_confidence": 0.8, "secondary_colors": ["blanc", "fauve"]}', '2025-09-11 16:16:58.751+00', 4074, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 16:16:59.204946+00', '2025-09-11 16:16:59.204946+00'),
('08b30f2e-5d60-42c7-91dc-cc09c23d838d', '7ddcd81d-9a02-4d23-b84a-b22343f831d0', 'user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/1757609611220.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/7ddcd81d-9a02-4d23-b84a-b22343f831d0/1757609611220.jpg', 'chat', NULL, 0.00, 'gris', '{blanc}', 'tigré', NULL, 'moyen', 'adulte', 'openai', 'gpt-4o-mini', '{"breed": null, "eye_color": null, "hasAnimal": true, "animal_type": "chat", "age_estimate": "adulte", "coat_pattern": "tigré", "primary_color": "gris", "size_category": "moyen", "characteristics": ["curieux", "actif", "sociable"], "breed_confidence": 0, "secondary_colors": ["blanc"]}', '2025-09-11 16:53:59.881+00', 28446, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-11 16:54:00.312231+00', '2025-09-11 16:54:00.312231+00'),
('42a59936-7ce1-4e3d-8f21-1c6282096fc7', 'c10de1c7-26db-4539-b043-09a323780d39', 'user-photos/matteodjerbi@icloud.com/imported_1757681674526.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/matteodjerbi@icloud.com/imported_1757681674526.jpg', 'oiseau', NULL, 0.00, 'gris', '{noir,blanc}', 'uni', NULL, 'moyen', 'adulte', 'openai', 'gpt-4o-mini', '{"breed": "null", "eye_color": "null", "hasAnimal": true, "animal_type": "oiseau", "age_estimate": "adulte", "coat_pattern": "uni", "primary_color": "gris", "size_category": "moyen", "characteristics": ["plumage gris", "tête noire", "cou blanc"], "breed_confidence": 0, "secondary_colors": ["noir", "blanc"]}', '2025-09-12 12:55:03.813+00', 28983, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-12 12:54:32.73607+00', '2025-09-12 12:54:32.73607+00'),
('c787a275-b259-4d89-b037-a21b10a88a3d', 'c10de1c7-26db-4539-b043-09a323780d39', 'user-photos/matteodjerbi@icloud.com/imported_1757681802859.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/matteodjerbi@icloud.com/imported_1757681802859.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'openai', 'gpt-4o-mini', '{"hasAnimal": false}', '2025-09-12 12:56:47.903+00', 4874, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-12 12:56:16.813526+00', '2025-09-12 12:56:16.813526+00'),
('87445117-3461-4b20-8795-bd5f3965dbe1', 'fb00975d-68b0-4ae2-ae0e-ec0a64f031b5', 'user-photos/fb00975d-68b0-4ae2-ae0e-ec0a64f031b5/imported_1758134068821.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/fb00975d-68b0-4ae2-ae0e-ec0a64f031b5/imported_1758134068821.jpg', 'chat', NULL, 0.00, 'marron', '{gris}', 'tigré', 'vert', 'moyen', 'adulte', 'openai', 'gpt-4o-mini', '{"breed": "null", "eye_color": "vert", "hasAnimal": true, "animal_type": "chat", "age_estimate": "adulte", "coat_pattern": "tigré", "primary_color": "marron", "size_category": "moyen", "characteristics": ["calme", "curieux", "affectueux"], "breed_confidence": 0, "secondary_colors": ["gris"]}', '2025-09-17 18:34:33.916+00', 4967, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-17 18:34:34.478528+00', '2025-09-17 18:34:34.478528+00'),
('d7984026-5ac3-4051-9270-31964456fff7', '68016c23-6da0-4938-9801-122336aaa992', 'user-photos/djerbi.h2@gmail.com/imported_1758453961240.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/djerbi.h2@gmail.com/imported_1758453961240.jpg', 'autre', NULL, 0.00, 'marron', '{}', 'uni', NULL, 'moyen', 'jeune', 'openai', 'gpt-4o-mini', '{"breed": null, "eye_color": null, "hasAnimal": true, "animal_type": "autre", "age_estimate": "jeune", "coat_pattern": "uni", "primary_color": "marron", "size_category": "moyen", "characteristics": ["animal sauvage", "pattes fines", "corps élancé"], "breed_confidence": 0, "secondary_colors": []}', '2025-09-21 11:26:06.434+00', 5077, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-21 11:26:07.030135+00', '2025-09-21 11:26:07.030135+00'),
('661a0081-d72c-4b93-af09-deca134ffb78', '68016c23-6da0-4938-9801-122336aaa992', 'user-photos/djerbi.h2@gmail.com/1758454020056.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/djerbi.h2@gmail.com/1758454020056.jpg', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'openai', 'gpt-4o-mini', '{"hasAnimal": false}', '2025-09-21 11:27:08.921+00', 8782, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-21 11:27:09.102388+00', '2025-09-21 11:27:09.102388+00'),
('7c6f079d-b9f1-452c-a570-6e249e32e5b4', '68016c23-6da0-4938-9801-122336aaa992', 'user-photos/djerbi.h2@gmail.com/1758454037472.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/djerbi.h2@gmail.com/1758454037472.jpg', 'chat', NULL, 0.00, 'gris', '{noir,blanc}', 'tigré', 'noir', 'petit', 'chaton', 'openai', 'gpt-4o-mini', '{"breed": null, "eye_color": "noir", "hasAnimal": true, "animal_type": "chat", "age_estimate": "chaton", "coat_pattern": "tigré", "primary_color": "gris", "size_category": "petit", "characteristics": ["curieux", "joueur", "mignon"], "breed_confidence": 0, "secondary_colors": ["noir", "blanc"]}', '2025-09-21 11:27:25.879+00', 8322, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-21 11:27:26.026343+00', '2025-09-21 11:27:26.026343+00'),
('67f4fa6d-69eb-4a44-9341-91531cf1c9c1', '68016c23-6da0-4938-9801-122336aaa992', 'user-photos/djerbi.h2@gmail.com/1758454080855.jpg', 'https://jglrgibqrjxzvcornaxg.supabase.co/storage/v1/object/public/photos/user-photos/djerbi.h2@gmail.com/1758454080855.jpg', 'chat', 'Maine Coon', 0.90, 'gris', '{marron,noir}', 'tigré', 'vert', 'grand', 'adulte', 'openai', 'gpt-4o-mini', '{"breed": "Maine Coon", "eye_color": "vert", "hasAnimal": true, "animal_type": "chat", "age_estimate": "adulte", "coat_pattern": "tigré", "primary_color": "gris", "size_category": "grand", "characteristics": ["poils longs", "grande taille", "oreilles tuftées"], "breed_confidence": 0.9, "secondary_colors": ["marron", "noir"]}', '2025-09-21 11:28:13.686+00', 12750, NULL, NULL, NULL, NULL, NULL, false, NULL, '2025-09-21 11:28:13.802413+00', '2025-09-21 11:28:13.802413+00');

-- 10. Enable RLS
ALTER TABLE public.animal_breeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_metadata ENABLE ROW LEVEL SECURITY;

-- 11. RLS Policies
CREATE POLICY "Anyone can view animal breeds" ON public.animal_breeds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can delete their own photo metadata" ON public.photo_metadata FOR DELETE USING ((auth.uid() = user_id));
CREATE POLICY "Users can insert their own photo metadata" ON public.photo_metadata FOR INSERT WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "Users can update their own photo metadata" ON public.photo_metadata FOR UPDATE USING ((auth.uid() = user_id));
CREATE POLICY "Users can view their own photo metadata" ON public.photo_metadata FOR SELECT USING ((auth.uid() = user_id));

-- 12. Grants
GRANT ALL ON TABLE public.animal_breeds TO anon;
GRANT ALL ON TABLE public.animal_breeds TO authenticated;
GRANT ALL ON TABLE public.animal_breeds TO service_role;
GRANT ALL ON SEQUENCE public.animal_breeds_id_seq TO anon;
GRANT ALL ON SEQUENCE public.animal_breeds_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.animal_breeds_id_seq TO service_role;
GRANT ALL ON TABLE public.photo_metadata TO anon;
GRANT ALL ON TABLE public.photo_metadata TO authenticated;
GRANT ALL ON TABLE public.photo_metadata TO service_role;
GRANT ALL ON TABLE public.recent_photos_with_metadata TO anon;
GRANT ALL ON TABLE public.recent_photos_with_metadata TO authenticated;
GRANT ALL ON TABLE public.recent_photos_with_metadata TO service_role;
GRANT ALL ON TABLE public.user_photo_stats TO anon;
GRANT ALL ON TABLE public.user_photo_stats TO authenticated;
GRANT ALL ON TABLE public.user_photo_stats TO service_role;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;
