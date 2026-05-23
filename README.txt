# FitZone Frontend

FitZone est une application Angular de gestion d'une salle de sport. Elle permet de consulter les cours, les coachs, les plans, de gérer les inscriptions et d'accéder aux espaces membre et admin.

## Technologies

- Angular 20
- TypeScript
- Angular Material
- RxJS
- Stockage local via `localStorage`

## Prérequis

- Node.js 18+ recommandé
- npm

## Installation

```bash
npm install
```

## Lancement

```bash
npm start
```

L'application est généralement accessible sur `http://localhost:4200/`.

## Build

```bash
npm run build
```

## Arborescence utile

- `src/app/pages` : pages de l'application
- `src/app/core/services` : services métier et stockage
- `src/app/shared/components` : composants partagés
- `public/assets/images` : images utilisées par l'interface

## Fonctionnalités principales

- Page d'accueil avec présentation des services
- Consultation des coachs et des cours
- Gestion des plans et des inscriptions
- Espace membre et espace admin
- Tableau de bord admin avec gestion des données locales

## Notes

Les données sont stockées côté navigateur pour faciliter la démonstration et les tests.

## Vidéo de démonstration

Lien YouTube de la vidéo de l'application : https://youtu.be/SSkGUXhIBX0
