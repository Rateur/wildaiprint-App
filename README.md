# WildAIprintApp – Front & API

## Description
Ce dépôt regroupe :
- le **front-end** (HTML/CSS/JS) pour l’interface utilisateur,
- le **back-end / API Flask** (dossier `api/`) pour servir le modèle IA, gérer la base de données et exposer les endpoints REST.

Il permet de soumettre une image d’empreinte animale, de recevoir la prédiction du modèle et de stocker les traces (espèce, date, localisation).

---

## Table des matières

- [Documentation complète](#documentation-complète)
- [Architecture et structure du projet](#architecture-et-structure-du-projet)
- [Installation et lancement](#installation-et-lancement)
- [API endpoints](#api-endpoints)
- [Licences et crédits](#licences-et-crédits)

---

## Documentation complète

Consulter la documentation complète du projet ici :  
[WildAIprint Documentation Projet](https://www.notion.so/WildAIprint-Documentation-Projet-261b73b4f1d480ed8a6ef05ea84e85f3?source=copy_link)

---

## Architecture et structure du projet
```
/
├── api/
│ ├── app.py
│ ├── connection_db.py
│ ├── class_names.json
│ ├── infos_especes.csv
│ ├── model.keras
│ ├── requirements.txt
│ ├── test_api.py
│ └── Dockerfile
├── front/
│ ├── index.html
│ ├── script.js
│ ├── style.css
│ ├── assets/
│ └── Dockerfile
├── .gitattributes
├── .gitlab-ci.yml
├── docker-compose.yml
└── README.md
```


- **api/** : API Flask servant le modèle IA, fichiers de configuration, base SQLite, test d’intégration (`test_api.py`).  
- **front/** : interface HTML/JS/CSS, gestion des appels API.  
- **docker-compose.yml** : orchestration front + back.  
- **.gitlab-ci.yml** : pipeline CI pour build/test.  

<details><summary>Contenu détaillé du dossier api</summary>

- `app.py` : point d’entrée de l’API Flask, définition des routes `/predict`, `/trace`, `/species/<id>`.
- `connection_db.py` : gestion des accès à la base SQLite `wildprint.db`.
- `class_names.json` : correspondance id → nom d’espèce.
- `infos_especes.csv` : métadonnées sur les espèces.
- `model.keras` : modèle IA ResNet50 entraîné et fine-tuné.
- `test_api.py` : test d’intégration qui simule un appel d’API avec localisation, date et image fictive.
</details>

<details><summary>Contenu détaillé du dossier front</summary>

- `index.html` : page principale, formulaire d’upload.
- `script.js` : envoi de l’image au back-end, gestion des réponses JSON.
- `style.css` : styles.
- `assets/` : images, logos, icônes.
</details>

---

## Installation et lancement

### Prérequis

- Python 3.x
- Docker (facultatif)
- Navigateur web pour le front-end

### Installation

```bash
git clone git@gitlab.com:yasmine-sayad-group/wildaiprintapp.git
cd wildaiprintapp
```
* #### Lancer sur docker :
```bash
docker-compose build
docker-compose up
```
* #### API : 
Ouvrir `http://localhost:5000` dans un navigateur ou servir avec un petit serveur local.

* #### Front : 
Ouvrir `http://localhost:8080/` dans un navigateur ou servir avec un petit serveur local.

## API endpoints
| Méthode | Endpoint                             | 
| ------- | ------------------------------------ |
| POST    | `http://localhost:5000/predict`      | 

<details><summary>Exemple de requête / réponse</summary>

**Requête :**

- Méthode: POST 
- Endpoint: http://localhost:5000/predict
- Content-Type: application/json
- Body > raw > Json :

```json
{
  "image": [[0, 1, 2], [3, 4, 5], [6, 7, 8]],
  "path": "/uploads/img123.jpg",
  "loc": "Paris, France",
  "date": "2025-09-17"
}

```


**Réponse :**
```json
{
	"description": "Le Chat(Felis silvestris) est une espèce de félins présent dans divers types d'habitats."
	"family": "Mammifère"
	"funfact": "Un chat ne peut pas voir directement sous son nez !"
	"housing": null
	"name": "Felis silvestris"
	"picture": "chat.jpg"
	"region": "Amérique, Europe, Asie occidentale et Afrique"
	"size": "46 à 51 cm sans la queue"
	"species": "Chat"
}
```
</details>

## Licences et crédits
* Code : Licence MIT (Exemple)
* Images, dataset : WildAIprint + sources (NatureTracking, iNaturalist, etc.)
* Remerciements à l’équipe pédagogique et à tous les contributeurs