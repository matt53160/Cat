// Service pour gérer les métadonnées des photos dans Supabase
import { supabase } from '../lib/supabase';
import { AnimalAnalysisResult } from './aiAnalysisService';

export interface PhotoMetadata {
  id?: string;
  user_id?: string;
  photo_path: string;
  photo_url?: string;

  // Données IA
  animal_type?: string;
  breed?: string;
  breed_confidence?: number;
  primary_color?: string;
  secondary_colors?: string[];
  coat_pattern?: string;
  eye_color?: string;
  size_category?: string;
  age_estimate?: string;

  // Métadonnées IA
  ai_provider?: string;
  ai_model?: string;
  ai_raw_response?: any;
  ai_processed_at?: string;
  ai_processing_time_ms?: number;

  // Métadonnées utilisateur
  custom_name?: string;
  custom_description?: string;
  is_favorite?: boolean;
  tags?: string[];

  // Géolocalisation
  latitude?: number;
  longitude?: number;
  location_name?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

class PhotoMetadataService {
  /**
   * Sauvegarde les métadonnées d'une photo avec les résultats d'analyse IA
   */
  async savePhotoMetadata(
    photoPath: string,
    photoUrl: string,
    aiResult: AnimalAnalysisResult,
    processingTimeMs: number
  ): Promise<{ success: boolean; error?: string; data?: PhotoMetadata }> {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utilisateur non connecté');
      }

      // Préparer les données à sauvegarder
      const metadata: Partial<PhotoMetadata> = {
        user_id: user.id,
        photo_path: photoPath,
        photo_url: photoUrl,
        ai_provider: 'openai',
        ai_model: 'gpt-4o-mini',
        ai_processed_at: new Date().toISOString(),
        ai_processing_time_ms: processingTimeMs,
      };

      // Si un animal a été détecté, ajouter ses caractéristiques
      if (aiResult.hasAnimal && aiResult.data) {
        metadata.animal_type = aiResult.data.animal_type;
        metadata.breed = aiResult.data.breed;
        metadata.breed_confidence = aiResult.data.breed_confidence;
        metadata.primary_color = aiResult.data.primary_color;
        metadata.secondary_colors = aiResult.data.secondary_colors;
        metadata.coat_pattern = aiResult.data.coat_pattern;
        metadata.eye_color = aiResult.data.eye_color;
        metadata.size_category = aiResult.data.size_category;
        metadata.age_estimate = aiResult.data.age_estimate;
      }

      // Insérer dans Supabase
      const { data, error } = await supabase
        .from('photo_metadata')
        .insert([metadata])
        .select()
        .single();

      if (error) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      return { success: true, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      };
    }
  }

  /**
   * Récupère les métadonnées d'une photo par son chemin
   */
  async getPhotoMetadata(photoPath: string): Promise<{ success: boolean; metadata?: PhotoMetadata }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false };

      const { data, error } = await supabase
        .from('photo_metadata')
        .select('*')
        .eq('user_id', user.id)
        .eq('photo_path', photoPath)
        .maybeSingle();

      if (!data || error) {
        return { success: false };
      }

      return { success: true, metadata: data };
    } catch {
      return { success: false };
    }
  }

  /**
   * Récupère toutes les photos avec métadonnées pour l'utilisateur connecté
   */
  async getAllPhotosWithMetadata(): Promise<PhotoMetadata[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('photo_metadata')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * Met à jour les métadonnées personnalisées d'une photo
   */
  async updatePhotoMetadata(
    photoId: string,
    updates: Partial<PhotoMetadata>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('photo_metadata')
        .update(updates)
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (error) throw new Error('Erreur lors de la mise à jour');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      };
    }
  }

  /**
   * Supprime les métadonnées d'une photo
   */
  async deletePhotoMetadata(photoId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('photo_metadata')
        .delete()
        .eq('id', photoId)
        .eq('user_id', user.id);

      if (error) throw new Error('Erreur lors de la suppression');

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression'
      };
    }
  }

  /**
   * Recherche des photos par type d'animal
   */
  async searchPhotosByAnimalType(animalType: string): Promise<PhotoMetadata[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('photo_metadata')
        .select('*')
        .eq('user_id', user.id)
        .eq('animal_type', animalType)
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * Obtient des statistiques sur les photos de l'utilisateur
   */
  async getPhotoStatistics(): Promise<{
    totalPhotos: number;
    totalAnimals: number;
    animalTypes: { [key: string]: number };
    favoritePhotos: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalPhotos: 0, totalAnimals: 0, animalTypes: {}, favoritePhotos: 0 };

      const { data, error } = await supabase
        .from('photo_metadata')
        .select('animal_type, is_favorite')
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);

      const stats = {
        totalPhotos: data.length,
        totalAnimals: data.filter(item => item.animal_type).length,
        animalTypes: {} as { [key: string]: number },
        favoritePhotos: data.filter(item => item.is_favorite).length,
      };

      data.forEach(item => {
        if (item.animal_type) {
          stats.animalTypes[item.animal_type] = (stats.animalTypes[item.animal_type] || 0) + 1;
        }
      });

      return stats;
    } catch {
      return { totalPhotos: 0, totalAnimals: 0, animalTypes: {}, favoritePhotos: 0 };
    }
  }
}

// Instance singleton
export const photoMetadataService = new PhotoMetadataService();
