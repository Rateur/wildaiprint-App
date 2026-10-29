<div id="top"></div>

<h1 align="center">
  <img src="https://imgur.com/y9j7iMy.png" alt="WildAIprint logo" width="96" style="vertical-align: middle; margin-right: 12px;">
  WildAIprint – App Front & API
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Simplon%20x%20Microsoft-D%C3%A9veloppeur%20IA-ee2e5d?style=for-the-badge" alt="Simplon x Microsoft – Développeur IA">
  <img src="https://img.shields.io/github/stars/Rateur/wildaiprint-App.svg?style=for-the-badge&color=ffd700" alt="Étoiles GitHub">
  <img src="https://img.shields.io/github/actions/workflow/status/Rateur/wildaiprint-App/tests.yml?branch=main&style=for-the-badge&label=tests" alt="Tests">
</p>

<p align="center">
  Application WildAIprint : un front web et une API Flask branchés sur un classifieur d'empreintes animales.<br>
  Envoi d'une photo, prédiction parmi 13 espèces, fiche de l'espèce, enregistrement du relevé.
</p>

> **Démo de chaîne complète, pas un outil fiable sur le terrain.** Le modèle trouve la bonne espèce dans 26 % des cas, mesuré sur 38 photos de test jamais vues (voir [Le modèle](#modele)).
>
> La documentation est répartie sur deux dépôts :
> - **Ce dépôt, WildAIprint App** : interface et API Flask.
> - **WildAIprint, Modèle IA** : entraînement, évaluation et export de `model.keras`. [github.com/Rateur/WildAIprint-Modele-CNN](https://github.com/Rateur/WildAIprint-Modele-CNN)

---

## Sommaire
1. [À propos](#a-propos)  
   1.1. [Pitch & objectifs](#pitch)  
   1.2. [Documentation projet](#documentation)  
2. [Technologies & outils](#technologies)  
3. [Architecture & modules](#architecture)  
4. [Le modèle](#modele)  
5. [Installation & lancement](#installation)  
6. [API & intégration](#api)  
7. [Structure du dépôt](#structure)  
8. [CI/CD & qualité](#qualite)

---

## <a id="a-propos"></a>À propos

### <a id="pitch"></a>Pitch & objectifs
- Interface web : prendre ou choisir une photo d'empreinte, obtenir une espèce et sa fiche.
- Back-end Flask : charge `api/model.keras` (ResNet50 ajusté, Keras) et classe l'image en 13 espèces.
- Base SQLite `wildprint.db` : fiches espèces (table `animals`, issue de `infos_especes.csv`) et relevés (table `tracks` : lieu, date, espèce). L'image n'est pas enregistrée.
- API REST : `/predict`, `/tracks`, `/animals`.
- Docker Compose : deux services, `flask` et `front`.

### <a id="documentation"></a>Documentation projet
- Contexte, parcours utilisateur, choix techniques :  
  [Notion – WildAIprint Documentation Projet](https://www.notion.so/WildAIprint-Documentation-Projet-261b73b4f1d480ed8a6ef05ea84e85f3?source=copy_link)
- Entraînement et évaluation : dépôt [WildAIprint – Modèle IA](https://github.com/Rateur/WildAIprint-Modele-CNN).

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="technologies"></a>Technologies & outils

<table align="center">
  <tr>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" alt="HTML5" height="48"><br>
      <sub><strong>HTML5</strong></sub>
    </td>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" alt="CSS3" height="48"><br>
      <sub><strong>CSS3</strong></sub>
    </td>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="JavaScript" height="48"><br>
      <sub><strong>Vanilla JS</strong></sub>
    </td>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" height="48"><br>
      <sub><strong>Python 3.11</strong></sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/flask/flask-original.svg" alt="Flask" height="48"><br>
      <sub><strong>Flask</strong></sub>
    </td>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" height="48"><br>
      <sub><strong>Docker</strong></sub>
    </td>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/sqlite/sqlite-original.svg" alt="SQLite" height="48"><br>
      <sub><strong>SQLite</strong></sub>
    </td>
    <td align="center" width="120">
      <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" alt="Git" height="48"><br>
      <sub><strong>Git & CI</strong></sub>
    </td>
  </tr>
</table>

- **Inférence** : `model.keras` chargé par Keras 3.11.3 et TensorFlow 2.20, à la première prédiction. `class_names.json` donne les 13 noms d'espèces.
- **API** : Flask 3.1.1, `flask-cors`, Pillow pour le redimensionnement.
- **Front** : HTML, CSS et JavaScript sans framework, servis par Nginx dans Docker.
- **Python** : 3.11 (image `python:3.11.9-slim` et CI sur `python:3.11`).
- **Suivi** : `api/test_api.py` (pytest), `.gitlab-ci.yml` et GitHub Actions (`.github/workflows/tests.yml`).

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="architecture"></a>Architecture & modules

```text
utilisateur → front (fetch) → API Flask → modèle Keras → fiche espèce (SQLite) → affichage
                                   ↑
                    le front enregistre ensuite le relevé via POST /tracks
```

- **Front** (`front/`) : une page, deux vues (`#accueil`, `#especes`).
  - Photo par caméra ou par fichier, aperçu, bouton « Identifier l'empreinte ».
  - Lieu : géolocalisation du navigateur, puis géocodage inverse par Nominatim (OpenStreetMap), avec un délai de 600 ms. Sinon `Unknown`.
  - Fenêtre de consentement au stockage, mémorisée dans le `localStorage`.
  - Grille des espèces avec recherche.
- **API Flask** (`api/app.py`) :
  - `/predict` : redimensionne l'image en 256 × 256, prédit, renvoie la fiche de l'espèce.
  - `/tracks` (POST, GET) : écrit et lit les relevés.
  - `/animals` : liste les fiches de `infos_especes.csv`.
- **Persistance** : `wildprint.db`, créée par `connection_db.py` à partir de `infos_especes.csv`.
- **Conteneurs** : `docker-compose.yml` lance `flask` (port 5000) et `front` (port 8080).

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="modele"></a>Le modèle

Le modèle vient du dépôt [WildAIprint-Modele-CNN](https://github.com/Rateur/WildAIprint-Modele-CNN). Ce dépôt-ci ne l'entraîne pas.

**Modèle retenu**
- ResNet50 pré-entraîné sur ImageNet, sans sa tête. Tête ajoutée : GlobalAveragePooling2D, Dropout 0,5, Dense 128 (ReLU), Dropout 0,3, softmax sur 13 classes.
- Notebook de Yasmine Sayad, choisi par l'équipe de quatre parce que c'était le plus performant.
- Données : 250 photos d'origine, 13 espèces, 1 500 images après augmentation.
- Entrée : 256 × 256. L'API redimensionne la photo et envoie les pixels bruts (0 à 255), sans `preprocess_input`, comme à l'entraînement.

**Le vrai score**

| | Score annoncé au départ | Évaluation refaite (octobre 2026) |
|---|---|---|
| Séparation | 80/20 sur les 1 500 images : des variantes d'une même photo des deux côtés | Par photo d'origine, avant l'augmentation : 70 % entraînement, 15 % validation, 15 % test |
| Données de mesure | 300 images de validation | 38 photos de test jamais vues |
| Exactitude | 83 % | **26 %** (intervalle à 95 % : 13 % à 39 %) |
| F1 macro | 0,83 | 0,26 (0,11 à 0,33) |

- Le 83 % était optimiste : le modèle avait déjà vu des variantes de ces photos.
- Au hasard, sur 13 espèces : 8 %.
- Exactitude d'entraînement vers 70 %, validation jamais au-dessus de 35 %.
- Même architecture, même recette, modèle réentraîné. Seule la séparation change. L'évaluation a été refaite par Valentin Périès (notebook `split_par_photo.ipynb` du dépôt du modèle).
- Piste testée : ajouter `preprocess_input`. Résultat : 24 % (intervalle 11 % à 37 %), aucun gain mesurable.
- Piste suivante : au moins une cinquantaine de photos par espèce, puis une validation croisée par groupes.

**Ce que cela change pour cette application**
- C'est une démo de la chaîne complète : photo, prédiction, fiche, relevé. Ce n'est pas un outil fiable sur le terrain.
- L'API ne renvoie aucun score de confiance et n'applique aucun seuil. Toute image reçoit une des 13 espèces, même sans empreinte.
- Le jeu de photos n'est pas distribué.

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="installation"></a>Installation & lancement

### 1. Pré-requis
- Docker avec Compose.
- Git LFS : `api/model.keras` est suivi par LFS (`.gitattributes`). Sans LFS, vous récupérez un fichier pointeur et non le modèle.
- Navigateur récent (Chrome ou Firefox).

### 2. Cloner le dépôt
```bash
git lfs install
git clone https://github.com/Rateur/wildaiprint-App.git
cd wildaiprint-App
```

### 3. Lancement via Docker Compose
```bash
docker-compose build
docker-compose up
```
- Front : `http://localhost:8080`
- API : `http://localhost:5000`
- Le front appelle `http://localhost:5000` (adresse écrite en dur dans `front/script.js`, sans variable `API_URL`). L'API n'accepte les appels que depuis `http://localhost:8080` (CORS).
- `app.py` lit `model.keras`, `class_names.json` et `wildprint.db` dans son propre dossier, quel que soit le dossier courant.

### 4. Sans Docker
Depuis la racine :
```bash
pip install -r api/requirements.txt
flask --app api/app.py run
```
Le modèle se charge à la première prédiction : quelques secondes.

Pour le front seul : `cd front && python -m http.server 8080`.

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="api"></a>API & intégration

| Méthode | Endpoint | Corps | Réponse |
|---------|----------|-------|---------|
| `GET` | `/` | | Texte `API Flask ✅` |
| `POST` | `/predict` | `multipart/form-data`, champ `image` (`jpg`, `jpeg`, `png`) | `200` : `{"animal": {...}}`. `400` sans image. `404` si l'espèce n'est pas en base. |
| `POST` | `/tracks` | JSON `{"loc": "...", "date": "...", "species": "..."}`, trois champs obligatoires | `201` `track added successfully`. `400` `missing data ...` si un champ manque. |
| `GET` | `/tracks` | | Tous les relevés : `id`, `path`, `loc`, `date`, `animal_sp`. Pas de pagination. |
| `GET` | `/animals` | | Toutes les fiches espèces. |

- `path` vaut toujours `track.jpg` : l'image n'est pas enregistrée.
- Une extension non autorisée n'a pas de réponse dédiée : la route ne retourne rien, Flask renvoie une erreur `500`.

<details><summary>Exemple de format de réponse <code>/predict</code></summary>

Les champs sont les colonnes de `infos_especes.csv`. Les valeurs viennent de la ligne `Chat`, le texte de `description` est abrégé. La réponse ne contient ni confiance ni identifiant de classe.

```json
{
  "animal": {
    "species": "Chat",
    "name": "Felis silvestris",
    "family": "Mammifère",
    "region": "Amérique, Europe, Asie occidentale et Afrique",
    "size": "46 à 51 cm sans la queue",
    "picture": "chat.jpg",
    "housing": null,
    "description": "Le Chat sauvage4 (Felis silvestris) est une espèce de félins…",
    "funfact": "Un chat ne peut pas voir directement sous son nez !"
  }
}
```
</details>

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="structure"></a>Structure du dépôt

```text
/
├── api/
│   ├── app.py                # API Flask
│   ├── connection_db.py      # recrée wildprint.db (demande pandas, absent de requirements.txt)
│   ├── class_names.json      # 13 espèces
│   ├── infos_especes.csv     # fiches espèces
│   ├── model.keras           # Git LFS
│   ├── wildprint.db          # SQLite
│   ├── requirements.txt
│   ├── test_api.py
│   └── Dockerfile
├── front/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── assets/               # logo, caméra, fond, animals/ (13 photos)
│   └── Dockerfile            # Nginx
├── docker-compose.yml
├── .gitattributes            # api/model.keras en LFS
├── .gitlab-ci.yml
└── README.md
```

- `class_names.json` et `wildprint.db` figurent dans le `.gitignore` mais sont versionnés dans le dépôt.
- Notebooks, entraînement et évaluation : dépôt du modèle.

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="qualite"></a>CI/CD & qualité

**`.gitlab-ci.yml`** (branche `main` seulement)
- `test` : installe `api/requirements.txt`, récupère le modèle par Git LFS, lance `python -m pytest api/test_api.py`.
- `build` et `push` : construisent les images `api` et `front`, les poussent dans le registre GitLab avec le SHA court du commit, puis en `latest`.

**GitHub Actions** (`.github/workflows/tests.yml`, à chaque push sur `main` et chaque pull request)
- Les mêmes tests, sur Python 3.11. Le modèle reste un pointeur Git LFS : le test du vrai modèle est sauté.

**Tests** (`api/test_api.py`, 7 tests)
- `/predict` : avec un faux modèle (entrée 256 × 256 × 3, fiche de l'espèce prédite), sans image (400), et avec le vrai modèle quand Git LFS l'a récupéré.
- `/tracks` : ajout d'un relevé, donnée manquante (400), liste vide au départ.
- `/animals` : une fiche pour chacune des 13 classes du modèle.
- Chaque test travaille sur une copie de `wildprint.db` : la vraie base n'est jamais modifiée.
- Lancement : `python -m pytest api/test_api.py`, depuis la racine. Les 7 passent, vrai modèle compris (octobre 2026).

**Limites connues**
- Les images Docker n'ont pas été reconstruites depuis la correction des chemins (octobre 2026).
- Aucun temps de réponse n'a été mesuré.

<p align="right"><a href="#top">Retour en haut</a></p>
