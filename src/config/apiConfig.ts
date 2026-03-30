// Configuration des API keys et endpoints
// Les clés sont lues depuis les variables d'environnement (.env)
import Config from 'react-native-config';

export const OPENAI_CONFIG = {
  API_KEY: Config.OPENAI_API_KEY || '',
  BASE_URL: Config.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  MODEL: 'gpt-4o-mini',
};

// Fonction pour vérifier si l'API est configurée
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_CONFIG.API_KEY && OPENAI_CONFIG.API_KEY !== 'your_openai_api_key_here';
}

