-- =======================================================
-- CONFIGURATION SUPABASE POUR PHOTOAPP - RECONNAISSANCE IA
-- =======================================================
-- À exécuter dans Supabase Dashboard > SQL Editor
-- =======================================================

-- 1. CRÉER LA TABLE PRINCIPALE : photo_metadata
-- Cette table stocke toutes les métadonnées des photos avec reconnaissance IA
CREATE TABLE photo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_path TEXT NOT NULL, -- chemin dans Storage (ex: user-photos/user@email.com/123456.jpg)
  photo_url TEXT, -- URL publique de la photo
  
  -- === INFORMATIONS ANIMAUX DÉTECTÉES PAR IA ===
  animal_type TEXT, -- chat, chien, oiseau, lapin, etc.
  breed TEXT, -- race détectée (Maine Coon, Golden Retriever, etc.)
  breed_confidence DECIMAL(3,2), -- niveau de confiance IA (0.00 à 1.00)
  
  -- === COULEURS ET MOTIFS ===
  primary_color TEXT, -- couleur principale (roux, noir, blanc, etc.)
  secondary_colors TEXT[], -- couleurs secondaires sous forme de tableau
  coat_pattern TEXT, -- motif : tigré, tacheté, uni, bicolore, tricolore, etc.
  
  -- === CARACTÉRISTIQUES PHYSIQUES ===
  eye_color TEXT, -- couleur des yeux
  size_category TEXT, -- petit, moyen, grand
  age_estimate TEXT, -- chiot/chaton, jeune, adulte, senior
  
  -- === MÉTADONNÉES IA ===
  ai_provider TEXT DEFAULT 'openai', -- fournisseur IA : openai, claude, google, etc.
  ai_model TEXT, -- modèle utilisé : gpt-4-vision-preview, claude-3, etc.
  ai_raw_response JSONB, -- réponse JSON complète de l'IA
  ai_processed_at TIMESTAMPTZ, -- quand l'analyse IA a été faite
  ai_processing_time_ms INTEGER, -- temps de traitement en millisecondes
  
  -- === GÉOLOCALISATION (OPTIONNEL POUR LA CARTE) ===
  latitude DECIMAL(10,8), -- latitude GPS
  longitude DECIMAL(11,8), -- longitude GPS
  location_name TEXT, -- nom du lieu (Paris, France)
  
  -- === MÉTADONNÉES UTILISATEUR ===
  custom_name TEXT, -- nom donné par l'utilisateur à l'animal
  custom_description TEXT, -- description personnalisée
  is_favorite BOOLEAN DEFAULT FALSE, -- photo favorite
  tags TEXT[], -- tags personnalisés
  
  -- === TIMESTAMPS ===
  created_at TIMESTAMPZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- 2. CRÉER LES INDEX POUR OPTIMISER LES PERFORMANCES
-- =======================================================

-- Index principal par utilisateur (le plus important)
CREATE INDEX idx_photo_metadata_user_id ON photo_metadata(user_id);

-- Index pour filtrer par type d'animal
CREATE INDEX idx_photo_metadata_animal_type ON photo_metadata(animal_type);

-- Index pour trier par date (photos récentes d'abord)
CREATE INDEX idx_photo_metadata_created_at ON photo_metadata(created_at DESC);

-- Index pour les photos favorites
CREATE INDEX idx_photo_metadata_favorites ON photo_metadata(user_id, is_favorite) WHERE is_favorite = true;

-- Index composé pour recherche rapide
CREATE INDEX idx_photo_metadata_user_animal ON photo_metadata(user_id, animal_type, created_at DESC);

-- =======================================================
-- 3. CRÉER UNE TABLE DE RÉFÉRENCE POUR LES RACES (OPTIONNEL)
-- =======================================================

CREATE TABLE animal_breeds (
  id SERIAL PRIMARY KEY,
  animal_type TEXT NOT NULL,
  breed_name TEXT NOT NULL,
  breed_name_fr TEXT, -- nom français de la race
  typical_colors TEXT[], -- couleurs typiques de cette race
  typical_patterns TEXT[], -- motifs typiques
  size_category TEXT, -- taille typique : petit, moyen, grand
  origin_country TEXT, -- pays d'origine
  description TEXT -- description de la race
);

-- Index pour recherche rapide des races
CREATE INDEX idx_animal_breeds_type ON animal_breeds(animal_type);
CREATE INDEX idx_animal_breeds_name ON animal_breeds(breed_name);

-- =======================================================
-- 4. INSÉRER QUELQUES DONNÉES DE RÉFÉRENCE (EXEMPLE)
-- =======================================================

INSERT INTO animal_breeds (animal_type, breed_name, breed_name_fr, typical_colors, typical_patterns, size_category) VALUES
-- Chats
('chat', 'Maine Coon', 'Maine Coon', ARRAY['roux', 'noir', 'blanc', 'crème'], ARRAY['tigré', 'uni'], 'grand'),
('chat', 'Persian', 'Persan', ARRAY['blanc', 'crème', 'argenté'], ARRAY['uni', 'colorpoint'], 'moyen'),
('chat', 'Siamese', 'Siamois', ARRAY['crème', 'chocolat', 'lilas'], ARRAY['colorpoint'], 'moyen'),
('chat', 'British Shorthair', 'British Shorthair', ARRAY['gris', 'bleu', 'crème'], ARRAY['uni'], 'moyen'),
('chat', 'Ragdoll', 'Ragdoll', ARRAY['crème', 'chocolat', 'lilas'], ARRAY['colorpoint', 'bicolore'], 'grand'),

-- Chiens
('chien', 'Golden Retriever', 'Golden Retriever', ARRAY['doré', 'crème'], ARRAY['uni'], 'grand'),
('chien', 'Labrador', 'Labrador', ARRAY['noir', 'chocolat', 'sable'], ARRAY['uni'], 'grand'),
('chien', 'German Shepherd', 'Berger Allemand', ARRAY['noir', 'feu'], ARRAY['bicolore'], 'grand'),
('chien', 'French Bulldog', 'Bouledogue Français', ARRAY['fauve', 'bringé', 'blanc'], ARRAY['uni', 'bringé'], 'petit'),
('chien', 'Border Collie', 'Border Collie', ARRAY['noir', 'blanc'], ARRAY['bicolore'], 'moyen');

-- =======================================================
-- 5. CONFIGURER LES POLITIQUES RLS (ROW LEVEL SECURITY)
-- =======================================================

-- Activer RLS sur la table
ALTER TABLE photo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_breeds ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : les utilisateurs peuvent voir leurs propres photos
CREATE POLICY "Users can view their own photo metadata" 
ON photo_metadata FOR SELECT 
USING (auth.uid() = user_id);

-- Politique d'insertion : les utilisateurs peuvent ajouter des métadonnées pour leurs photos
CREATE POLICY "Users can insert their own photo metadata" 
ON photo_metadata FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour : les utilisateurs peuvent modifier leurs métadonnées
CREATE POLICY "Users can update their own photo metadata" 
ON photo_metadata FOR UPDATE 
USING (auth.uid() = user_id);

-- Politique de suppression : les utilisateurs peuvent supprimer leurs métadonnées
CREATE POLICY "Users can delete their own photo metadata" 
ON photo_metadata FOR DELETE 
USING (auth.uid() = user_id);

-- Politique pour la table des races : lecture publique (tous peuvent voir les races)
CREATE POLICY "Anyone can view animal breeds" 
ON animal_breeds FOR SELECT 
TO authenticated 
USING (true);

-- =======================================================
-- 6. CRÉER UNE FONCTION POUR METTRE À JOUR updated_at
-- =======================================================

-- Fonction qui met automatiquement à jour le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger qui déclenche la fonction à chaque UPDATE
CREATE TRIGGER update_photo_metadata_updated_at 
BEFORE UPDATE ON photo_metadata
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =======================================================
-- 7. CRÉER DES VUES UTILES (OPTIONNEL)
-- =======================================================

-- Vue pour obtenir les statistiques par utilisateur
CREATE VIEW user_photo_stats AS
SELECT 
    user_id,
    COUNT(*) as total_photos,
    COUNT(DISTINCT animal_type) as different_animals,
    COUNT(CASE WHEN is_favorite THEN 1 END) as favorite_photos,
    MIN(created_at) as first_photo,
    MAX(created_at) as last_photo
FROM photo_metadata 
GROUP BY user_id;

-- Vue pour les photos récentes avec métadonnées complètes
CREATE VIEW recent_photos_with_metadata AS
SELECT 
    pm.*,
    ab.breed_name_fr,
    ab.origin_country
FROM photo_metadata pm
LEFT JOIN animal_breeds ab ON pm.breed = ab.breed_name
ORDER BY pm.created_at DESC;

-- =======================================================
-- 8. REQUÊTES D'EXEMPLE POUR TESTER
-- =======================================================

/*
-- Insérer une photo avec métadonnées (exemple)
INSERT INTO photo_metadata (
    user_id, 
    photo_path, 
    animal_type, 
    breed, 
    primary_color, 
    coat_pattern,
    ai_provider,
    ai_processed_at
) VALUES (
    auth.uid(),
    'user-photos/user@email.com/1234567890.jpg',
    'chat',
    'Maine Coon',
    'roux',
    'tigré mackerel',
    'openai',
    NOW()
);

-- Récupérer toutes les photos d'un utilisateur avec leurs métadonnées
SELECT 
    id,
    photo_path,
    animal_type,
    breed,
    primary_color,
    coat_pattern,
    created_at
FROM photo_metadata 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Rechercher des photos par type d'animal
SELECT * FROM photo_metadata 
WHERE user_id = auth.uid() 
AND animal_type = 'chat'
ORDER BY created_at DESC;

-- Compter les photos par race
SELECT breed, COUNT(*) as count
FROM photo_metadata 
WHERE user_id = auth.uid()
GROUP BY breed
ORDER BY count DESC;
*/

-- =======================================================
-- FIN DU SCRIPT - TOUT EST PRÊT POUR L'INTÉGRATION IA !
-- =======================================================

-- PROCHAINES ÉTAPES :
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Configurer la clé API OpenAI/Claude dans l'application
-- 3. Implémenter l'intégration IA dans le code React Native
-- 4. Tester l'upload et l'analyse des photos

-- NOTES :
-- - Toutes les colonnes sont optionnelles pour permettre une implémentation progressive
-- - Les index optimisent les requêtes pour de grandes quantités de photos
-- - Les politiques RLS assurent la sécurité des données utilisateur
-- - La structure est extensible pour ajouter d'autres types d'animaux