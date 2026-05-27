Résumé
Pour la partie A.1, j'ai opté pour une section Liquid contenant le bouton de comparaison. La partie logique est gérée en JavaScript : au clic, le bouton est chargé de vérifier le nombre de produits stockés (4 maximum), de sauvegarder dans le localStorage les données du produit et de notifier les changements effectués.
De même, pour le tiroir flottant, j'ai préféré l'ajouter via une section plutôt que de l'intégrer directement au fichier theme.liquid. Il permet de gérer le contenu du localStorage sans avoir à passer par les différentes pages produits. Il est aussi rétractable afin de permettre une meilleure accessibilité.
Pour la page de comparaison, un template personnalisé récupère la liste des produits du localStorage au chargement (il vérifie si la liste contient au moins 2 produits pour afficher le tableau), puis, via GraphQL, récupère les données complètes des produits.

Difficultés rencontrées 
Pour ce projet, j'ai dû partir de zéro et apprendre rapidement le fonctionnement de Shopify. La première difficulté a été de comprendre l'étape d'installation, notamment la configuration des thèmes et la sécurisation de la connexion avec mon application (via l'authentification OAuth) puis de m'habituer à son architecture spécifique : il ne s'agit pas d'un site web classique, mais d'une application intégrée (embedded) directement dans le tableau de bord de Shopify via App Bridge, ce qui demande une gestion complexe de l'installation et de la sécurité (authentification OAuth). 
La plus grande complexité a ensuite été l'utilisation de l'API GraphQL. Contrairement à un projet traditionnel, on ne gère pas de base de données classique comme MySQL. Il faut obligatoirement passer par l'architecture de données de Shopify pour lire ou stocker des informations, ce qui impose une logique totalement différente. J'ai dû faire face aux limites de requêtes imposées par la plateforme, m'obligeant à optimiser mon code pour éviter les blocages. De plus, la gestion des listes de produits et la synchronisation en temps réel ont rendu le développement difficile.

implémentation/amélioration
Avec plus de temps, j'aurais d'abord amélioré le design en utilisant Tailwind CSS pour rendre le site plus moderne et plus facile à modifier par la suite. Ensuite, j'aurais voulu rendre le tableau de comparaison plus interactif en ajoutant un menu simple pour que l'utilisateur puisse choisir lui-même les critères qu'il souhaite afficher ou masquer.
Enfin, le dernier axe important concernait la finalisation de l'application embarquée. N'ayant pas encore toutes les compétences techniques nécessaires dans ce domaine précis, l'apprentissage des bases m'a demandé beaucoup de temps. Je n'ai malheureusement pas pu terminer cette partie dans les délais impartis.


Journal d'usage de l'IA
Outil : Gemini
Tâche : créer la requête GrapQL permettant de récupérer les informations des produits via une liste d'IDS
Output : ma retourner une requête fonctionnelle
Delta : optimisation de la requête et des données retourneés
Valeur : environ 40 minutes.

Outil : Gemini
Tâche : intégration d'un tiroir flottant en bas de page de mon site Shopify contenant des images de produits
Output : architecture quasi complete du tiroir flottant (HTML et JS, un peu de CSS)
Delta : adaptation du code javascript retourné, ajouts du CSS
Valeur : environ 2 heures.

Outil : Gemini
Tâche : intégration d'un tiroir flottant en bas de page de mon site Shopify contenant des images de produits
Output : architecture quasi complete du tiroir flottant (HTML et JS, un peu de CSS)
Delta : adaptation du code javascript retourné, ajouts du CSS
Valeur : environ 2 heures.