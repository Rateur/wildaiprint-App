<div id="top"></div>

<h1 align="center">
  <img src="https://imgur.com/y9j7iMy.png" alt="WildAIprint logo" width="96" style="vertical-align: middle; margin-right: 12px;">
  WildAIprint – App Front & API
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Simplon%20x%20Microsoft-D%C3%A9veloppeur%20IA-ee2e5d?style=for-the-badge" alt="Simplon x Microsoft – Développeur IA">
  <img src="https://img.shields.io/github/stars/Rateur/wildaiprint-App.svg?style=for-the-badge&color=ffd700" alt="Étoiles GitHub">
</p>

<p align="center">
  Application WildAIprint complète (front web + API Flask) connectée au modèle de classification d’empreintes animales.<br>
  Soumission d’images, inférence en temps réel, stockage des traces et restitution des informations espèces.
</p>

> La documentation du projet est répartie sur deux README complémentaires :
> - **Ce dépôt – WildAIprint App** : application front/back (interface + API Flask).
> - **WildAIprint – Modèle IA** : entraînement et export du modèle (`model.keras`) – [github.com/Rateur/WildAIprint-Modele-CNN](https://github.com/Rateur/WildAIprint-Modele-CNN).

---

## Sommaire
1. [À propos](#a-propos)  
   1.1. [Pitch & objectifs](#pitch)  
   1.2. [Documentation projet](#documentation)  
2. [Technologies & outils](#technologies)  
3. [Architecture & modules](#architecture)  
4. [Installation & lancement](#installation)  
5. [API & intégration](#api)  
6. [Structure du dépôt](#structure)  
7. [CI/CD & qualité](#qualite)

---

## <a id="a-propos"></a>À propos

### <a id="pitch"></a>Pitch & objectifs
- Interface web permettant d’uploader une photo d’empreinte et d’obtenir une prédiction instantanée.
- Back-end Flask intégrant le modèle Keras pré-entraîné (ResNet50 fine-tuné).
- Persistance des observations (espèce, localisation, date, image) dans une base SQLite.
- API REST exposant les routes principales : `predict`, `tracks`, `animals`.
- Déploiement local simple via Docker Compose (2 services : front et api).

### <a id="documentation"></a>Documentation projet
- Documentation exhaustive (contexte, parcours utilisateur, choix techniques) :  
  [Notion – WildAIprint Documentation Projet](https://www.notion.so/WildAIprint-Documentation-Projet-261b73b4f1d480ed8a6ef05ea84e85f3?source=copy_link)
- Complément côté IA : voir le dépôt [WildAIprint – Modèle IA](https://github.com/Rateur/WildAIprint-Modele-CNN).

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
      <sub><strong>Python 3.10+</strong></sub>
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

- **Inference IA** : chargement du modèle `model.keras` (TensorFlow/Keras), mapping `class_names.json`.
- **Suivi** : scripts de tests (`test_api.py`) + pipeline `.gitlab-ci.yml`.

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="architecture"></a>Architecture & modules

- **Front (HTML/CSS/JS)** : formulaire d’upload, aperçu de l’image, affichage des prédictions et informations espèces.
- **API Flask** :
  - route `/predict` : traitement de l’image, préprocess, inference, réponse JSON enrichie,
  - routes `/tracks` (POST/GET) : sauvegarde et lecture des observations,
  - route `/animals` : catalogue des espèces avec métadonnées (`infos_especes.csv`).
- **Persistance** : base SQLite `wildprint.db` initialisée via `connection_db.py`.
- **Containerisation** : services `frontend` et `api` orchestrés par `docker-compose.yml`.

```text
utilisateur → front (formulaire, fetch) → API Flask → modèle Keras → réponse JSON → affichage + stockage
```

<details><summary>Schéma répertoire</summary>

```text
/
├── api/
│   ├── app.py
│   ├── connection_db.py
│   ├── class_names.json
│   ├── infos_especes.csv
│   ├── model.keras
│   ├── requirements.txt
│   ├── test_api.py
│   └── Dockerfile
├── front/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── assets/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
</details>

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="installation"></a>Installation & lancement

### 1. Pré-requis
- Python **3.10+**
- Docker (optionnel mais recommandé pour un lancement rapide)
- Navigateur récent (Chrome/Firefox)

### 2. Cloner le dépôt
```bash
git clone https://github.com/Rateur/wildaiprint-App.git
cd wildaiprint-App
```

### 3. Lancement via Docker Compose
```bash
docker-compose build
docker-compose up
```
- Front disponible sur `http://localhost:8080`
- API accessible sur `http://localhost:5000`

### 4. Lancement manuel (sans Docker)
```bash
# Back-end
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py

# Front-end (depuis la racine ou front/)
python -m http.server 8080
```
- Adapter le champ `API_URL` dans `front/script.js` si l’API tourne sur une autre adresse/port.

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="api"></a>API & intégration

| Méthode | Endpoint                        | Content-Type        | Corps / Description |
|---------|---------------------------------|---------------------|---------------------|
| `POST`  | `/predict`                      | `multipart/form-data` | Champ `image` (`JPEG/PNG`). Retourne l’espèce prédite + métadonnées. |
| `POST`  | `/tracks`                       | `application/json`    | `{ "species": "...", "location": "...", "date": "...", "picture": "..." }` |
| `GET`   | `/tracks`                       | `application/json`    | Liste paginable des observations stockées dans SQLite. |
| `GET`   | `/animals`                      | `application/json`    | Catalogue des espèces connues (nom, famille, habitat, anecdote). |

<details><summary>Exemple de réponse <code>/predict</code></summary>

```json
{
  "animal": {
    "species": "Chat",
    "name": "Felis silvestris",
    "family": "Mammifère",
    "region": "Amérique, Europe, Asie occidentale et Afrique",
    "size": "46 à 51 cm sans la queue",
    "picture": "chat.jpg",
    "description": "Le Chat (Felis silvestris) est une espèce de félins présent dans divers types d'habitats.",
    "funfact": "Un chat ne peut pas voir directement sous son nez !"
  },
  "confidence": 0.87,
  "class_id": 2
}
```
</details>

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="structure"></a>Structure du dépôt

```text
/
├── api/                  # API Flask + modèle IA + tests
├── front/                # Interface web statique
├── docker-compose.yml    # Orchestration front/api
└── README.md             # Ce guide
```

- Les artefacts lourds (`model.keras`, `class_names.json`, `mlruns/`) sont ignorés via `.gitignore`.
- Les notebooks et scripts d’entraînement sont disponibles dans le dépôt IA compagnon.

<p align="right"><a href="#top">Retour en haut</a></p>

---

## <a id="qualite"></a>CI/CD & qualité
- `.gitlab-ci.yml` : pipeline de build/test (Docker) utilisé sur l’infrastructure GitLab d’origine.
- `api/test_api.py` : test d’intégration simulant un appel complet à l’API `/predict`.
- Recommandé : lancer des tests après toute modification backend (`pytest api/test_api.py`).

<p align="right"><a href="#top">Retour en haut</a></p>
