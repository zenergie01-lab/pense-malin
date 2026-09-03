# Coach Pense Malin — workflow n8n

Agent orchestrateur qui analyse tes données Pense Malin : **synthèse quotidienne**
automatique + **réponses à la demande**. Tourne sur ton n8n auto-hébergé, via
**OpenRouter** (tu choisis le modèle : Claude, GPT…).

## Contenu

`pense-malin-coach.workflow.json` — un workflow, deux flux :

| Flux | Déclencheur | Rôle |
|------|-------------|------|
| **Réponse à la demande** | `Webhook Coach` (POST) | reçoit `{ question, state }`, l'agent répond, renvoie `{ answer }` |
| **Synthèse du soir** | `Chaque soir 21h` (cron) | lit `app_state` dans Supabase, l'agent résume la journée, écrit dans `pm_insights` |

## Installation (≈ 5 min)

### 1. Importer
n8n → **Workflows → Import from File** → choisis `pense-malin-coach.workflow.json`.

### 2. Credential OpenRouter
- Crée une clé sur https://openrouter.ai/keys
- Sur les deux nœuds **« Modèle (OpenRouter) »**, ajoute une credential *OpenRouter API* avec ta clé.
- Choisis le modèle dans le champ **Model** (ex. `anthropic/claude-3.7-sonnet` pour les réponses, un modèle plus léger comme `anthropic/claude-3.5-haiku` pour la synthèse).

### 3. Credential Supabase (pour le flux du soir)
- Dans Supabase → **Project Settings → API** : copie l'**URL du projet** et la clé **`service_role`** (secrète — elle reste dans n8n, jamais dans l'app).
- Sur les nœuds **« Lire les états »** et **« Enregistrer la synthèse »**, ajoute une credential *Supabase API* (Host = l'URL, Service Role Secret = la clé).

### 4. Activer
Active le workflow (toggle en haut à droite). Le webhook passe en mode *production*.

### 5. Brancher l'app
- Ouvre le nœud **« Webhook Coach »**, copie l'**URL de production** (`https://ton-n8n/webhook/pense-malin-coach`).
- Dans l'app Pense Malin → onglet **🧭 Coach** → colle l'URL dans **« Adresse du coach »**.
  (Ou définis la variable d'env `VITE_N8N_WEBHOOK_URL` au build pour la figer.)

## Test
Onglet Coach → pose une question (« Résume ma semaine »). Si le workflow est actif et
les credentials OK, la réponse s'affiche et s'archive dans l'historique.

## Synthèse quotidienne vs bilan hebdomadaire

Deux niveaux, comme demandé (jour par jour, puis bilan de semaine) :

- **Synthèse du jour** (`pense-malin-coach.workflow.json`, tous les soirs 21h) : l'agent
  ne regarde QUE l'activité **datée d'aujourd'hui**. Si tu as importé une ancienne
  version qui « résumait tout », remplace le *System Message* et le *Prompt* du nœud
  **« Agent synthèse »** par ceux du fichier à jour (ils recadrent l'agent sur la date
  du jour).
- **Bilan de la semaine** (`pense-malin-bilan-hebdo.workflow.json`, chaque **dimanche 21h**) :
  lit les **7 synthèses quotidiennes** de la semaine (`pm_insights`, kind `daily`) et en
  fait une **analyse** (fils récurrents, schémas, cap, focus de la semaine suivante),
  enregistrée en `pm_insights` avec kind `weekly`.

### Installer le bilan hebdo
1. **Import** de `pense-malin-bilan-hebdo.workflow.json`.
2. Assigne les **mêmes credentials** que le premier workflow : *Supabase pense-malin (cloud)*
   sur « Lire les synthèses du jour » et « Enregistrer le bilan », *OpenRouter* sur le nœud « Modèle bilan ».
3. Vérifie le nœud « Enregistrer le bilan » : **Operation = Create**, **Data to Send = Define Below**.
4. **Active** le workflow.

Les deux niveaux s'affichent dans l'app, onglet **🧭 Coach** : *Synthèse du jour* en haut,
*Bilan de la semaine* juste en dessous, puis l'historique.

## Notes
- Le projet Supabase gratuit se met en pause après ~7 j d'inactivité : pour que la
  synthèse du soir tourne, le projet doit être actif.
- Les données restent privées : le flux à la demande ne reçoit que l'état envoyé par
  l'app ; le flux du soir lit via la `service_role` (côté serveur, RLS contournée
  uniquement dans ton n8n).
