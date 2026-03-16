# Guide de Configuration PhotoApp

## Pr\u00e9requis

- Node.js 18+ install\u00e9
- npm ou yarn
- Android Studio (pour Android)
- Xcode (pour iOS, Mac uniquement)
- Un compte Supabase

## \u00c9tapes de configuration

### 1. Configuration Supabase

1. **Cr\u00e9ez un compte sur [Supabase](https://supabase.com)**

2. **Cr\u00e9ez un nouveau projet** avec :
   - Nom du projet : PhotoApp
   - Mot de passe de base de donn\u00e9es : (notez-le bien)
   - R\u00e9gion : Choisissez la plus proche

3. **R\u00e9cup\u00e9rez vos identifiants** :
   - Allez dans Settings > API
   - Copiez l'URL du projet
   - Copiez la cl\u00e9 anon (public)

4. **Configurez le Storage** :
   - Dans le menu lat\u00e9ral, cliquez sur Storage
   - Cliquez sur "New bucket"
   - Nom : `photos`
   - Public : Activez si vous voulez que les photos soient accessibles publiquement

5. **Mettez \u00e0 jour le fichier de configuration** :
   - Ouvrez `src/lib/supabase.ts`
   - Remplacez `YOUR_SUPABASE_URL` par votre URL
   - Remplacez `YOUR_SUPABASE_ANON_KEY` par votre cl\u00e9

### 2. Installation des d\u00e9pendances

```bash
cd PhotoApp
npm install
```

### 3. Configuration sp\u00e9cifique Android

Aucune configuration suppl\u00e9mentaire n\u00e9cessaire, les permissions sont d\u00e9j\u00e0 configur\u00e9es.

### 4. Configuration sp\u00e9cifique iOS

1. **Installez les pods** :
```bash
cd ios
pod install
cd ..
```

2. **Ajoutez les permissions cam\u00e9ra** dans `ios/PhotoApp/Info.plist` :
```xml
<key>NSCameraUsageDescription</key>
<string>PhotoApp a besoin d'acc\u00e9der \u00e0 votre cam\u00e9ra pour prendre des photos</string>
```

### 5. Lancer l'application

#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

## Troubleshooting

### Erreur "Metro bundler"
```bash
npx react-native start --reset-cache
```

### Erreur de build Android
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Erreur de build iOS
```bash
cd ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

## Test de l'application

1. **Cr\u00e9ation de compte** :
   - Lancez l'app
   - Entrez un email valide
   - Entrez un mot de passe (minimum 6 caract\u00e8res)
   - Cliquez sur "Cr\u00e9er un compte"
   - V\u00e9rifiez votre email pour confirmer

2. **Connexion** :
   - Utilisez vos identifiants
   - Cliquez sur "Se connecter"

3. **Prise de photo** :
   - Une fois connect\u00e9, cliquez sur "Prendre une photo"
   - Autorisez l'acc\u00e8s \u00e0 la cam\u00e9ra
   - Appuyez sur le bouton de capture
   - La photo sera automatiquement upload\u00e9e vers Supabase

## Structure des donn\u00e9es Supabase

### Authentication
- Table `auth.users` g\u00e9r\u00e9e automatiquement par Supabase

### Storage
- Bucket : `photos`
- Structure : `/user-photos/[timestamp].jpg`