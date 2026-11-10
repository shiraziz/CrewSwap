# CrewSwap

Application de covoiturage et d'échange d'équipages.

## Technologies utilisées
- **Frontend :** React Native, Expo, Expo Router
- **Backend :** Node.js, Express, TypeScript
- **Base de données :** PostgreSQL
- **ORM :** Prisma
- **Authentification :** JWT

## Prérequis
- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Expo Go (pour tester sur mobile)

## Installation et lancement

### 1. Cloner le projet
```bash
git clone https://github.com/eyamelki/CrewSwap.git
cd CrewSwap
```

### 2. Configurer le backend
```bash
cd backend
npm install
```

Créer un fichier `.env` à partir de `.env.example` et configurer la connexion PostgreSQL :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/crewswap?schema=public"
PORT=5000
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

Initialiser la base de données :
```bash
npx prisma migrate dev
npx prisma generate
```

Lancer le backend :
```bash
npm run dev
```

API disponible sur : `http://localhost:5000`

### 3. Configurer le frontend

Ouvrir un deuxième terminal :

```bash
cd frontend
npm install
npx expo start
```

Pour lancer la version Web, appuyer sur `w`.

## Structure du projet

```text
CrewSwap/
├── backend/
│   ├── prisma/
│   └── src/
├── frontend/
│   ├── app/
│   ├── components/
│   └── assets/
└── README.md
```

## Commandes utiles

| Commande | Description |
|---|---|
| `npm run dev` | Lancer le backend |
| `npx prisma studio` | Explorer la base de données |
| `npx prisma migrate dev` | Appliquer les migrations |
| `npx expo start` | Lancer le frontend |

## Sécurité
- Ne jamais partager le fichier `.env`.
- Utiliser des clés JWT sécurisées.
- Ne pas publier les mots de passe dans Git.

## Licence
Projet privé – CrewSwap. Tous droits réservés.