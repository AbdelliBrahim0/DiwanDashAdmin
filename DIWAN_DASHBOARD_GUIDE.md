# Dashboard Admin Diwan - Guide Complet

## 📋 Vue d'Ensemble

Le **Dashboard Admin Diwan** est une interface de gestion administrative complète et bilingue (FR/AR) pour votre plateforme e-commerce de luxe. Il offre une gestion complète des produits, catégories, collections et promotions.

## 🚀 Accès au Dashboard

### Identifiants de Démo
- **Email**: `admin@diwan.com`
- **Mot de passe**: `password123`

### Accès au Application
- **Dev**: http://localhost:3000
- **Production**: Voir votre déploiement Vercel

## 🎨 Thème Visuel

### Palette de Couleurs
- **Couleur Primaire**: Or/Gold (#d4af37) - Accent principal pour les actions
- **Fond**: Noir très foncé (#0f0f0f) - Ambiance luxe
- **Cartes**: Noir avec bordures subtiles (#1a1a1a)
- **Texte**: Blanc cassé (#f0f0f0) pour contraste optimal

### Style Design
- Thème **dark** élégant pour les boutiques de luxe
- Interface minimaliste et professionnelle
- Tous les éléments utilisent les variables de design CSS

## 📱 Structure du Dashboard

### Pages Principales

#### 1. **Tableau de Bord** (`/admin`)
- Affiche les statistiques clés
- Carte active des derniers produits
- Vue des promotions actives
- Métriques de vente et visiteurs

#### 2. **Gestion des Produits** (`/admin/products`)
- Liste complète des produits
- Ajouter/Modifier/Supprimer des produits
- Recherche instantanée
- Champs disponibles:
  - Nom (FR/AR)
  - Prix & Prix original
  - Description (FR/AR)
  - Catégorie et Sous-catégorie
  - SKU et Stock
  - Collections associées

#### 3. **Gestion des Catégories** (`/admin/categories`)
- Organiser les catégories produits
- Ajouter des icônes et slugs
- Tri personnalisé
- Support multilingue (FR/AR)

#### 4. **Gestion des Sous-Catégories** (`/admin/subcategories`)
- Créer hiérarchie de produits
- Lier aux catégories parent
- Descriptions bilingues

#### 5. **Gestion des Collections** (`/admin/collections`)
- Curated product groups
- Images de présentation
- Descriptions détaillées (FR/AR)
- Ordre d'affichage personnalisé

#### 6. **Codes de Promotion** (`/admin/discounts`)
- Codes promo avec réductions en % ou montant fixe
- Limite d'utilisations
- Dates d'activation/expiration
- Suivi des utilisations

#### 7. **Black Friday** (`/admin/black-friday`)
- Gérer les événements Black Friday
- Réductions temporaires
- Bannières promotionnelles
- Activation/Désactivation

#### 8. **Happy Hour** (`/admin/happy-hour`)
- Promotions récurrentes
- Horaires d'activation (heures spécifiques)
- Jours de la semaine sélectionnés
- Réductions pour les clients

## 🌍 Support Multilingue (FR/AR)

### Changement de Langue
- Cliquez le bouton de langue (FR/AR) en haut à droite
- Préférence sauvegardée dans localStorage
- Interface complètement traduite

### Support RTL (Droite à Gauche)
- Automatique en arabe
- Tous les composants réactifs au direction
- Texte et images bien alignés

## 💾 Données et Stockage

### Données Mockées
Le dashboard utilise des **données fictives** stockées en localStorage. Toutes les modifications sont conservées dans la session mais réinitialisées au rafraîchissement.

### Fichiers de Données
- `/lib/mock-data.ts` - Données mockées initiales
- Structures TypeScript complètes pour type-safety

### Gestion d'État
- Hook personnalisé `useCrudState` pour opérations CRUD
- Composants réutilisables pour modales et tableaux
- Recherche instantanée intégrée

## 🔐 Authentification

### Système de Login
- Email/Mot de passe simple
- Stockage de token en localStorage
- Redirection automatique si non authentifié

### Sécurité
- Validation côté client
- Les démonstrations utilisent des credentials fixes
- Pour la production: Implémenter backend auth

## 🛠️ Architecture Technique

### Stack Technologique
- **Framework**: Next.js 16 avec App Router
- **UI**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React
- **Langage**: TypeScript
- **Gestion d'État**: React Hooks

### Structure des Fichiers
```
/app
  /admin
    /page.tsx - Dashboard principal
    /products/page.tsx - Gestion produits
    /categories/page.tsx - Gestion catégories
    /subcategories/page.tsx - Gestion sous-catégories
    /collections/page.tsx - Gestion collections
    /discounts/page.tsx - Gestion codes promo
    /black-friday/page.tsx - Gestion Black Friday
    /happy-hour/page.tsx - Gestion Happy Hour
  /layout.tsx - Layout racine
  /page.tsx - Redirection vers /admin
  /globals.css - Variables de design dark/gold

/components
  /admin-sidebar.tsx - Navigation principale
  /admin-header.tsx - En-tête avec langue
  /login-page.tsx - Page de connexion
  /crud-modal.tsx - Modal réutilisable
  /crud-table.tsx - Tableau réutilisable

/lib
  /auth-context.tsx - Contexte d'authentification
  /mock-data.ts - Données de démonstration
  /use-crud-state.ts - Hook pour opérations CRUD
```

## 📖 Utilisation des Composants CRUD

### Ajouter un Élément
1. Cliquez le bouton "Ajouter" (+ Ajouter)
2. Remplissez le formulaire modal
3. Cliquez "Enregistrer"

### Modifier un Élément
1. Cliquez l'icône "Modifier" (crayon) dans le tableau
2. Modifiez les champs nécessaires
3. Cliquez "Enregistrer"

### Supprimer un Élément
1. Cliquez l'icône "Supprimer" (poubelle)
2. Confirmez la suppression

### Rechercher
- Utilisez la barre de recherche
- Recherche instantanée en temps réel
- Résultats mis à jour dynamiquement

## 🎯 Fonctionnalités Clés

### ✅ Complétement Implémenté
- Authentification avec login/logout
- Gestion complète CRUD pour 8 entités
- Interface responsive et mobile-friendly
- Support multilingue FR/AR
- Thème dark/gold élégant
- Recherche et filtrage
- Modales pour créer/modifier
- Tableaux de données interactifs
- Navigation sidebar
- Statistiques dashboard

### 🔄 Données Persistantes
- localStorage pour la session admin
- Données CRUD persistantes dans la session
- Réinitialisation au rechargement de page

## 🚀 Deployment

### Sur Vercel
1. Connectez votre repo GitHub
2. Sélectionnez ce projet
3. Les variables d'environnement sont optionnelles (demo mode)
4. Déployez en un clic

### Variables d'Environnement (Optionnel)
```env
# Aucune variable obligatoire pour le mode démo
# Pour production, ajouter:
# DATABASE_URL=...
# API_KEY=...
```

## 📝 Notes de Développement

### Modification des Données Mockées
Éditez `/lib/mock-data.ts` pour ajouter ou modifier:
- Catégories
- Produits
- Collections
- Promotions

### Ajout de Nouvelles Fonctionnalités
1. Créez une interface TypeScript dans `mock-data.ts`
2. Créez une nouvelle page dans `/app/admin/[feature]/page.tsx`
3. Utilisez `useCrudState` pour la gestion d'état
4. Utilisez `CrudModal` et `CrudTable` pour l'UI

### Changement du Thème
Éditez les variables CSS dans `/app/globals.css`:
- `--primary`: Couleur d'accent
- `--background`: Couleur de fond
- `--card`: Couleur des cartes

## 🐛 Dépannage

### Authentification échouée
- Vérifiez email: `admin@diwan.com`
- Vérifiez mot de passe: `password123`
- Videz le localStorage et reconnectez-vous

### Données réinitialisées
- C'est normal - les données sont en localStorage
- Rechargement de page réinitialise les données mockées
- Pour persistance réelle, implémenter un backend

### Langue ne change pas
- Videz le cache du navigateur
- Vérifiez localStorage → language
- Rechargez la page

### Composants manquants
- Assurez-vous que shadcn/ui est installé
- Exécutez `pnpm install`
- Rebuildez le projet

## 📞 Support

Pour toute question ou problème:
1. Vérifiez ce guide complet
2. Consultez les fichiers source (bien commentés)
3. Inspectez la console pour les erreurs

---

**Version**: 1.0  
**Dernière mise à jour**: Mai 2026  
**Thème**: Dark & Gold - Diwan Luxury Edition
