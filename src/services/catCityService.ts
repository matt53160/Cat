import { supabase } from '../lib/supabase';
import { PlacedFurniture } from '../components/catcity/engine/types';

export interface RoomData {
  id: string;
  user_id: string;
  map_id: string;
  furniture: PlacedFurniture[];
  is_public: boolean;
  room_name?: string;
  updated_at: string;
  created_at: string;
}

class CatCityService {
  /**
   * Sauvegarde (upsert) le salon de l'utilisateur connecté.
   * Utilise ON CONFLICT sur (user_id, map_id) pour éviter les doublons.
   */
  async saveRoom(
    mapId: string,
    furniture: PlacedFurniture[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('cat_city_rooms')
        .upsert(
          {
            user_id: user.id,
            map_id: mapId,
            furniture: JSON.parse(JSON.stringify(furniture)),
          },
          { onConflict: 'user_id,map_id' },
        );

      if (error) throw new Error(error.message);
      return { success: true };
    } catch (error) {
      console.warn('[CatCity] save failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur sauvegarde',
      };
    }
  }

  /**
   * Charge le salon de l'utilisateur connecté.
   * Retourne null si aucun salon n'est sauvegardé.
   */
  async loadRoom(mapId: string): Promise<RoomData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('cat_city_rooms')
        .select('*')
        .eq('user_id', user.id)
        .eq('map_id', mapId)
        .maybeSingle();

      if (error || !data) return null;
      return data as RoomData;
    } catch {
      return null;
    }
  }

  /**
   * Bascule la visibilité publique du salon.
   */
  async setPublic(
    mapId: string,
    isPublic: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('cat_city_rooms')
        .update({ is_public: isPublic })
        .eq('user_id', user.id)
        .eq('map_id', mapId);

      if (error) throw new Error(error.message);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur mise à jour',
      };
    }
  }

  /**
   * Liste les salons publics (pour la future feature de visite).
   */
  async listPublicRooms(limit = 20): Promise<RoomData[]> {
    try {
      const { data, error } = await supabase
        .from('cat_city_rooms')
        .select('*')
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) return [];
      return (data || []) as RoomData[];
    } catch {
      return [];
    }
  }
}

export const catCityService = new CatCityService();
