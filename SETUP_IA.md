# 🤖 Configuration de la Reconnaissance IA

## 🎯 Objectif
Cette application utilise GPT-4o mini d'OpenAI pour analyser automatiquement les photos d'animaux et identifier :
- Type d'animal (chat, chien, etc.)
- Race probable
- Couleurs du pelage
- Motifs (tigré, uni, etc.)
- Âge estimé
- Caractéristiques physiques

## ⚙️ Configuration nécessaire

### 1. Créer un compte OpenAI
1. Allez sur [https://platform.openai.com/](https://platform.openai.com/)
2. Créez un compte ou connectez-vous
3. Ajoutez un moyen de paiement (requis pour l'API)

### 2. Générer une clé API
1. Dans votre dashboard OpenAI, allez dans **API Keys**
2. Cliquez sur **Create new secret key**
3. Donnez un nom à votre clé (ex: "PhotoApp")
4. Copiez la clé générée (format: `sk-proj-...`)

### 3. Configurer l'application
1. Ouvrez le fichier `src/config/apiConfig.ts`
2. Remplacez la ligne :
   ```typescript
   API_KEY: 'sk-proj-your-openai-api-key-here',
   ```
   Par :
   ```typescript
   API_KEY: 'sk-proj-VOTRE-VRAIE-CLE-API-ICI',
   ```

### 4. Créer la table dans Supabase
1. Ouvrez Supabase Dashboard
2. Allez dans **SQL Editor**
3. Exécutez le contenu du fichier `supabase_setup.sql`

## 💰 Coûts
- **GPT-4o mini** : ~$0.15 pour 1000 images analysées
- Très abordable pour un usage personnel
- Facturé uniquement à l'utilisation

## 🔒 Sécurité
⚠️ **Important** : Ne jamais commiter votre clé API dans Git !
- La clé doit rester dans votre fichier local
- En production, utilisez des variables d'environnement

## 🧪 Test
Une fois configuré :
1. Prenez une photo d'un animal
2. L'application affichera automatiquement :
   - "Analyse de l'animal avec l'IA..."
   - Puis les caractéristiques détectées
3. Les informations apparaîtront dans la galerie

## 🆘 Dépannage

### "Configuration manquante"
- Vérifiez que votre clé API est correctement copiée
- Format attendu : `sk-proj-...` (pas `sk-...`)

### "Network request failed"
- Vérifiez votre connexion internet
- Vérifiez que votre compte OpenAI a des crédits

### "Réponse IA invalide"
- Le modèle peut parfois échouer sur des images floues
- Retentez avec une photo plus claire

## 📊 Format de données IA
Les informations détectées sont sauvegardées dans la table `photo_metadata` :
```json
{
  "animal_type": "chat",
  "breed": "Maine Coon", 
  "primary_color": "roux",
  "coat_pattern": "tigré mackerel",
  "breed_confidence": 0.85
}
```

## 🚀 Fonctionnalités futures possibles
- Géolocalisation des photos
- Cartes interactives des animaux
- Reconnaissance de plusieurs animaux sur une photo
- Base de données collaborative
- Partage de photos avec la communauté

---
**Bon développement ! 🐾**