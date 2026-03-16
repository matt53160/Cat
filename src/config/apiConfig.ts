// Configuration des API keys et endpoints

// ⚠️ IMPORTANT : Clé API OpenAI configurée
export const OPENAI_CONFIG = {
  API_KEY: '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',
  BASE_URL: 'https://api.openai.com/v1',
  MODEL: 'gpt-4o-mini',
};

// Fonction pour vérifier si l'API est configurée
export function isOpenAIConfigured(): boolean {
  return OPENAI_CONFIG.API_KEY && OPENAI_CONFIG.API_KEY !== 'sk-proj-your-openai-api-key-here';
}

// Instructions pour configurer l'API
export const SETUP_INSTRUCTIONS = `
🔑 CONFIGURATION OPENAI REQUISE

Pour activer la reconnaissance d'animaux par IA :

1. Créez un compte sur https://platform.openai.com/
2. Générez une clé API dans la section "API Keys"
3. Remplacez la clé dans src/config/apiConfig.ts :
   - Ligne OPENAI_CONFIG.API_KEY
   - Remplacer 'sk-proj-your-openai-api-key-here' par votre vraie clé

4. Assurez-vous d'avoir des crédits sur votre compte OpenAI

⚠️ Note : GPT-4o mini coûte environ $0.15 pour 1000 images analysées
`;