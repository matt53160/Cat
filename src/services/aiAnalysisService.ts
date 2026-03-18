// Service d'analyse IA pour la reconnaissance d'animaux avec GPT-4o mini
import { OPENAI_CONFIG, isOpenAIConfigured } from '../config/apiConfig';

export interface AnimalAnalysisResult {
  success: boolean;
  hasAnimal: boolean;
  data?: {
    animal_type: string;
    breed: string | null;
    breed_confidence: number;
    primary_color: string;
    secondary_colors: string[];
    coat_pattern: string;
    eye_color: string | null;
    size_category: 'petit' | 'moyen' | 'grand' | null;
    age_estimate: 'chiot/chaton' | 'jeune' | 'adulte' | 'senior' | null;
    characteristics: string[];
  };
  error?: string;
}

class AIAnalysisService {
  private readonly API_URL = `${OPENAI_CONFIG.BASE_URL}/chat/completions`;

  // Prompt système optimisé pour GPT-4o mini
  private readonly SYSTEM_PROMPT = `Tu es un expert vétérinaire et spécialiste en reconnaissance d'animaux.

MISSION : Analyser une photo et identifier l'animal présent avec ses caractéristiques.

RÈGLES STRICTES :
1. Si AUCUN animal n'est visible, réponds EXACTEMENT : {"hasAnimal": false}
2. Si un animal est présent, analyse-le en détail
3. Sois précis mais honnête sur ton niveau de confiance
4. Utilise UNIQUEMENT le format JSON demandé, rien d'autre

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement) :
{
  "hasAnimal": true/false,
  "animal_type": "chat|chien|oiseau|lapin|hamster|autre",
  "breed": "race spécifique ou null si incertain",
  "breed_confidence": 0.0-1.0,
  "primary_color": "couleur dominante",
  "secondary_colors": ["couleur2", "couleur3"],
  "coat_pattern": "uni|tigré|tacheté|bicolore|tricolore|bringé|colorpoint|autre",
  "eye_color": "couleur des yeux ou null",
  "size_category": "petit|moyen|grand",
  "age_estimate": "chiot/chaton|jeune|adulte|senior",
  "characteristics": ["trait1", "trait2", "trait3"]
}

VOCABULAIRE FRANÇAIS AUTORISÉ :
- Couleurs : noir, blanc, gris, roux, fauve, marron, crème, argenté, chocolat, sable
- Motifs : uni, tigré, tacheté, bicolore, tricolore, bringé, colorpoint
- Tailles : petit, moyen, grand
- Ages : chiot/chaton, jeune, adulte, senior

IMPORTANT : Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`;

  /**
   * Convertit une image en base64 pour l'envoyer à l'API
   */
  private async imageToBase64(imagePath: string): Promise<string> {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      throw new Error('Impossible de lire l\'image');
    }
  }

  /**
   * Analyse une image avec GPT-4o mini
   */
  async analyzeImage(imagePath: string): Promise<AnimalAnalysisResult> {
    try {
      // Convertir l'image en base64
      const base64Image = await this.imageToBase64(imagePath);

      // Préparer la requête pour GPT-4o mini
      const payload = {
        model: OPENAI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content: this.SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse cette photo et identifie l\'animal présent avec ses caractéristiques. Réponds uniquement en JSON comme spécifié.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      };

      // Appeler l'API OpenAI
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec le service d\'analyse');
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('Aucune réponse du service d\'analyse');
      }

      // Parser la réponse JSON
      let parsedData;
      try {
        const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        parsedData = JSON.parse(cleanedResponse);
      } catch {
        return {
          success: false,
          hasAnimal: false,
          error: 'Réponse IA invalide (format JSON incorrect)',
        };
      }

      // Valider la structure de la réponse
      if (typeof parsedData.hasAnimal !== 'boolean') {
        return {
          success: false,
          hasAnimal: false,
          error: 'Structure de réponse IA invalide',
        };
      }

      // Si aucun animal détecté
      if (!parsedData.hasAnimal) {
        return {
          success: true,
          hasAnimal: false,
        };
      }

      // Animal détecté, formater les données
      return {
        success: true,
        hasAnimal: true,
        data: {
          animal_type: parsedData.animal_type || 'inconnu',
          breed: parsedData.breed,
          breed_confidence: parsedData.breed_confidence || 0,
          primary_color: parsedData.primary_color || 'inconnu',
          secondary_colors: parsedData.secondary_colors || [],
          coat_pattern: parsedData.coat_pattern || 'inconnu',
          eye_color: parsedData.eye_color,
          size_category: parsedData.size_category,
          age_estimate: parsedData.age_estimate,
          characteristics: parsedData.characteristics || []
        },
      };

    } catch (error) {
      return {
        success: false,
        hasAnimal: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'analyse',
      };
    }
  }

  /**
   * Valide si l'API key est configurée
   */
  isConfigured(): boolean {
    return isOpenAIConfigured();
  }

  /**
   * Teste la connexion à l'API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_CONFIG.API_KEY}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Instance singleton
export const aiAnalysisService = new AIAnalysisService();

// Fonction helper pour formater les couleurs en français
export function formatColors(primary: string, secondary: string[] = []): string {
  if (secondary.length === 0) {
    return primary;
  }
  if (secondary.length === 1) {
    return `${primary} et ${secondary[0]}`;
  }
  return `${primary}, ${secondary.join(', ')}`;
}

// Fonction helper pour formater la race avec confiance
export function formatBreedWithConfidence(breed: string | null, confidence: number): string {
  if (!breed) return 'Race non identifiée';
  if (confidence >= 0.8) return breed;
  if (confidence >= 0.5) return `${breed} (probable)`;
  return `${breed} (incertain)`;
}
