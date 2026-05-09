# 🚀 Guide de Deployment - Diwan Admin Dashboard

## Deployment sur Vercel

### Option 1: Via GitHub (Recommandé)

#### Étape 1: Préparer le projet
```bash
# Assurez-vous que tout compile correctement
cd /vercel/share/v0-project
pnpm install
pnpm build
```

#### Étape 2: Initialiser Git (si non fait)
```bash
git init
git add .
git commit -m "Initial commit: Diwan Admin Dashboard"
```

#### Étape 3: Créer repo GitHub
1. Aller à https://github.com/new
2. Créer un nouveau repo "diwan-admin-dashboard"
3. Pousser le code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/diwan-admin-dashboard.git
git branch -M main
git push -u origin main
```

#### Étape 4: Déployer sur Vercel
1. Aller à https://vercel.com/dashboard
2. Cliquer "Add New Project"
3. Sélectionner le repo GitHub créé
4. Configuration:
   - **Framework**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `pnpm build`
   - **Start Command**: `pnpm start`
   - **Install Command**: `pnpm install`

5. Cliquer "Deploy"

### Option 2: Deploy Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Login à Vercel
vercel login

# Deploy
vercel

# Ou deploy en production
vercel --prod
```

## Configuration après Deployment

### Variable d'Environnement (Optionnel)
Pour la démo frontend, aucune variable obligatoire.

Pour production avec backend:
```env
DATABASE_URL=postgresql://...
API_KEY=...
CLOUDINARY_CLOUD_NAME=...
```

### Custom Domain
1. Aller au projet Vercel
2. Settings → Domains
3. Ajouter votre domaine (ex: admin.diwan.com)
4. Configurer les DNS records

## Vérifications Post-Deployment

### ✅ À Vérifier
- [ ] App accessible sur URL Vercel
- [ ] Login fonctionne (admin@diwan.com / password123)
- [ ] Tous les modules CRUD accessibles
- [ ] Changement langue FR/AR fonctionne
- [ ] Design dark/gold visible
- [ ] Performance acceptable
- [ ] Pas de 404 errors
- [ ] Mobile responsive

### 🔍 Test Quick
```bash
# Accéder à l'app
https://[votre-vercel-url].vercel.app

# Tester login
Email: admin@diwan.com
Password: password123

# Vérifier les pages
- /admin (Dashboard)
- /admin/products (Produits)
- /admin/categories (Catégories)
- /admin/black-friday (Black Friday)
- /admin/happy-hour (Happy Hour)
- etc.
```

## Performance & Monitoring

### Vercel Analytics
1. Dashboard Vercel → Analytics
2. Vérifier:
   - Core Web Vitals
   - Performance metrics
   - Deployment status

### Error Tracking
```bash
# Voir les logs
vercel logs [your-project]

# Ou via Dashboard Vercel → Functions → Logs
```

## Mise à Jour du Code

### Mettre à jour depuis GitHub
```bash
# Localement
git add .
git commit -m "Description des changements"
git push origin main

# Vercel redéploie automatiquement
```

### Rollback à une version antérieure
1. Aller au projet Vercel
2. Deployments
3. Sélectionner la version
4. Cliquer "Rollback"

## Optimisations Production

### 1. Compression Images
Les images sont déjà optimisées via Next.js Image component.

### 2. Caching
Vercel gère le caching automatiquement.

### 3. CDN
Vercel utilise un CDN global - tout est optimisé.

### 4. SSL
HTTPS est automatique sur Vercel.

## Sauvegardes & Backup

### Code Source
- Hébergé sur GitHub ✅
- Versioning complet ✅
- Historique commits ✅

### Base de Données
Pour la démo: localStorage (automatique)  
Pour production: Implémenter votre stratégie

### Configuration
```bash
# Exporter la configuration
vercel env pull

# Cette commande crée un fichier .env.local
# À ne PAS committer sur GitHub
```

## Troubleshooting Deployment

### Error: "Build failed"
```bash
# Vérifier localement
pnpm install
pnpm build

# Si ça marche localement mais pas sur Vercel,
# vérifier que Node version est compatible
```

### Error: "Module not found"
```bash
# Vérifier que toutes les dépendances sont listées
pnpm list

# Installer manquantes
pnpm install [package-name]
```

### App charge lentement
- Vérifier Core Web Vitals
- Réduire la taille bundle (tree-shaking)
- Utiliser dynamic imports pour composants lourds

### Problème de langue/localStorage
- Vérifier cookies autorisés
- Vérifier localStorage activé
- Tester en mode incognito

## Maintenance Continue

### Updates Dépendances
```bash
# Vérifier les mises à jour
pnpm outdated

# Mettre à jour
pnpm update

# Ou spécifique
pnpm update [package]

# Tester après update
pnpm build
```

### Monitoring Logs
```bash
# Stream les logs en temps réel
vercel logs --follow

# Ou voir les logs passés
vercel logs --since 1h
```

## Environnements Multiples

### Staging
1. Créer branche `staging`
2. Aller à Settings → Git → Branches
3. Ajouter une preview deployment pour `staging`
4. Accéder via: https://staging.[projet].vercel.app

### Production
- Keep on `main` branch
- Preview deployments auto pour PRs

## Sécurité

### Best Practices
- [x] Pas de secrets dans le code ✓
- [x] Pas de API keys publiques ✓
- [x] HTTPS activé ✓
- [x] CSP headers configurés ✓

### Pour Production (à ajouter):
1. Implémenter real authentication (backend)
2. Sécuriser les API endpoints
3. Ajouter rate limiting
4. Implémenter validation serveur

## Support & Aide

- **Documentation Vercel**: https://vercel.com/docs
- **GitHub Discussions**: Poser des questions
- **Email Support**: Si vous avez un plan premium

## Checklist Final Deployment

- [ ] Code commité sur GitHub
- [ ] Build passe sans erreurs
- [ ] Authentification fonctionne
- [ ] Tous les modules CRUD accessibles
- [ ] Responsive test sur mobile
- [ ] Performance acceptable
- [ ] Domain configuré (si applicable)
- [ ] Analytics configuré
- [ ] Error monitoring en place
- [ ] Backup strategy définie
- [ ] Monitoring logs en place

## Post-Deployment Support

Pour éviter les problèmes:

1. **Monitorer les performances**
   - Vercel Analytics
   - Error tracking
   - Performance metrics

2. **Updates réguliers**
   - Dépendances chaque mois
   - Security patches ASAP
   - Feature updates as needed

3. **Maintenance**
   - Vérifier les logs régulièrement
   - Backups à jour
   - Documentation à jour

---

**Deployment Ready**: ✅ YES  
**Estimated Deployment Time**: 5 minutes  
**Downtime Expected**: None (zero-downtime deployments)

Good luck! 🎉
