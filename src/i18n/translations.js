/**
 * RemoteTeam Manager — Translation Dictionary
 * Languages: English (en), French (fr), Kinyarwanda (rw)
 *
 * Usage:
 *   import { useT } from '../i18n';
 *   const t = useT();
 *   t('login.title')  →  "Sign in to your account"
 */

const translations = {
  // ─── Auth ──────────────────────────────────────────────────
  'auth.login.title': {
    en: 'Sign in to your account',
    fr: 'Connexion à votre compte',
    rw: 'Injira muri konti yawe',
  },
  'auth.login.subtitle': {
    en: 'Welcome back! Enter your credentials to continue.',
    fr: 'Bienvenue ! Entrez vos identifiants pour continuer.',
    rw: 'Murakaza neza! Injiza amakuru yawe kugira ngo ukomeze.',
  },
  'auth.login.email': {
    en: 'Email address',
    fr: 'Adresse e-mail',
    rw: 'Aderesi ya imeli',
  },
  'auth.login.password': {
    en: 'Password',
    fr: 'Mot de passe',
    rw: 'Ijambo ryibanga',
  },
  'auth.login.submit': {
    en: 'Sign In',
    fr: 'Se connecter',
    rw: 'Injira',
  },
  'auth.login.forgot': {
    en: 'Forgot password?',
    fr: 'Mot de passe oublié ?',
    rw: 'Wibagiwe ijambo ryibanga?',
  },
  'auth.login.no_account': {
    en: "Don't have an account?",
    fr: "Vous n'avez pas de compte ?",
    rw: 'Nta konti ufite?',
  },
  'auth.login.sign_up': {
    en: 'Sign up',
    fr: "S'inscrire",
    rw: 'Iyandikishe',
  },

  // ─── Register ──────────────────────────────────────────────
  'auth.register.title': {
    en: 'Create your account',
    fr: 'Créer votre compte',
    rw: 'Fungura konti yawe',
  },
  'auth.register.first_name': {
    en: 'First name',
    fr: 'Prénom',
    rw: 'Izina rya mbere',
  },
  'auth.register.last_name': {
    en: 'Last name',
    fr: 'Nom de famille',
    rw: 'Izina ry\'umuryango',
  },
  'auth.register.username': {
    en: 'Username',
    fr: "Nom d'utilisateur",
    rw: 'Izina rya korisitaji',
  },
  'auth.register.confirm_password': {
    en: 'Confirm password',
    fr: 'Confirmer le mot de passe',
    rw: 'Emeza ijambo ryibanga',
  },
  'auth.register.submit': {
    en: 'Create Account',
    fr: 'Créer un compte',
    rw: 'Fungura konti',
  },
  'auth.register.have_account': {
    en: 'Already have an account?',
    fr: 'Vous avez déjà un compte ?',
    rw: 'Usanganywe konti?',
  },
  'auth.register.subtitle': {
    en: 'Join thousands of distributed teams today.',
    fr: 'Rejoignez des milliers d\'équipes distribuées.',
    rw: 'Injira mu itsinda ry\'ibihumbi by\'abakozi b\'amahanga.',
  },
  'auth.register.add_photo': {
    en: 'Add Photo',
    fr: 'Ajouter une photo',
    rw: 'Ongeraho ifoto',
  },
  'auth.register.choose_role': {
    en: 'Your Role',
    fr: 'Votre rôle',
    rw: 'Uruhare rwawe',
  },
  'auth.register.creating': {
    en: 'Creating account…',
    fr: 'Création du compte…',
    rw: 'Gufungura konti…',
  },

  // ─── Navigation / Sidebar ──────────────────────────────────
  'nav.dashboard': {
    en: 'Dashboard',
    fr: 'Tableau de bord',
    rw: 'Ikibaho',
  },
  'nav.workspaces': {
    en: 'Workspaces',
    fr: 'Espaces de travail',
    rw: 'Ibibanza by\'akazi',
  },
  'nav.projects': {
    en: 'Projects',
    fr: 'Projets',
    rw: 'Imishinga',
  },
  'nav.tasks': {
    en: 'Tasks',
    fr: 'Tâches',
    rw: 'Imirimo',
  },
  'nav.team': {
    en: 'Team',
    fr: 'Équipe',
    rw: 'Itsinda',
  },
  'nav.chat': {
    en: 'Chat',
    fr: 'Discussion',
    rw: 'Ikiganiro',
  },
  'nav.schedule': {
    en: 'Schedule',
    fr: 'Planning',
    rw: 'Gahunda',
  },
  'nav.analytics': {
    en: 'Analytics',
    fr: 'Analytique',
    rw: 'Isesengura',
  },
  'nav.files': {
    en: 'Files',
    fr: 'Fichiers',
    rw: 'Inyandiko',
  },
  'nav.calendar': {
    en: 'Calendar',
    fr: 'Calendrier',
    rw: 'Kalendari',
  },
  'nav.wiki': {
    en: 'Wiki',
    fr: 'Wiki',
    rw: 'Wiki',
  },
  'nav.settings': {
    en: 'Settings',
    fr: 'Paramètres',
    rw: 'Igenamiterere',
  },
  'nav.logout': {
    en: 'Log out',
    fr: 'Se déconnecter',
    rw: 'Sohoka',
  },
  'nav.notifications': {
    en: 'Notifications',
    fr: 'Notifications',
    rw: 'Intangazo',
  },
  'nav.search': {
    en: 'Search',
    fr: 'Rechercher',
    rw: 'Shakisha',
  },
  'nav.ai_assistant': {
    en: 'AI Assistant',
    fr: 'Assistant IA',
    rw: 'Umufasha wa AI',
  },
  'nav.integrations': {
    en: 'Integrations',
    fr: 'Intégrations',
    rw: 'Guhuza',
  },
  'nav.audit': {
    en: 'Audit Logs',
    fr: 'Journaux d\'audit',
    rw: 'Inyandiko',
  },
  'nav.hr': {
    en: 'HR',
    fr: 'RH',
    rw: 'Abakozi',
  },

  // ─── Dashboard ─────────────────────────────────────────────
  'dashboard.title': {
    en: 'Dashboard',
    fr: 'Tableau de bord',
    rw: 'Ikibaho',
  },
  'dashboard.welcome': {
    en: 'Welcome back',
    fr: 'Bienvenue',
    rw: 'Murakaza neza',
  },
  'dashboard.total_tasks': {
    en: 'Total Tasks',
    fr: 'Total des tâches',
    rw: 'Imirimo yose',
  },
  'dashboard.completed': {
    en: 'Completed',
    fr: 'Terminé',
    rw: 'Byarangiye',
  },
  'dashboard.in_progress': {
    en: 'In Progress',
    fr: 'En cours',
    rw: 'Birimo bikorwa',
  },
  'dashboard.team_members': {
    en: 'Team Members',
    fr: "Membres de l'équipe",
    rw: 'Abagize itsinda',
  },
  'dashboard.recent_activity': {
    en: 'Recent Activity',
    fr: 'Activité récente',
    rw: 'Ibikorwa bya vuba',
  },
  'dashboard.upcoming_tasks': {
    en: 'Upcoming Tasks',
    fr: 'Tâches à venir',
    rw: 'Imirimo iri imbere',
  },
  'dashboard.no_workspace': {
    en: 'Select or create a workspace to get started.',
    fr: "Sélectionnez ou créez un espace de travail pour commencer.",
    rw: 'Hitamo cyangwa fungura ikibuzo cy\'akazi kugira ngo utangire.',
  },

  // ─── Tasks ─────────────────────────────────────────────────
  'tasks.title': {
    en: 'Tasks',
    fr: 'Tâches',
    rw: 'Imirimo',
  },
  'tasks.create': {
    en: 'Create Task',
    fr: 'Créer une tâche',
    rw: 'Shiraho akazi',
  },
  'tasks.no_tasks': {
    en: 'No tasks yet. Create your first task!',
    fr: "Aucune tâche. Créez votre première tâche !",
    rw: 'Nta mirimo. Shiraho akazi kawe ka mbere!',
  },
  'tasks.status.todo': {
    en: 'To Do',
    fr: 'À faire',
    rw: 'Bikora',
  },
  'tasks.status.in_progress': {
    en: 'In Progress',
    fr: 'En cours',
    rw: 'Birimo bikorwa',
  },
  'tasks.status.done': {
    en: 'Done',
    fr: 'Terminé',
    rw: 'Byarangiye',
  },
  'tasks.status.blocked': {
    en: 'Blocked',
    fr: 'Bloqué',
    rw: 'Byaburiwe',
  },
  'tasks.priority.urgent': {
    en: 'Urgent',
    fr: 'Urgent',
    rw: 'Byihutirwa',
  },
  'tasks.priority.high': {
    en: 'High',
    fr: 'Haute',
    rw: 'Hejuru',
  },
  'tasks.priority.medium': {
    en: 'Medium',
    fr: 'Moyenne',
    rw: 'Hagati',
  },
  'tasks.priority.low': {
    en: 'Low',
    fr: 'Basse',
    rw: 'Hasi',
  },
  'tasks.due_date': {
    en: 'Due Date',
    fr: "Date d'échéance",
    rw: 'Itariki yo kurangiza',
  },
  'tasks.assigned_to': {
    en: 'Assigned to',
    fr: 'Attribué à',
    rw: 'Yahawe',
  },

  // ─── Projects ──────────────────────────────────────────────
  'projects.title': {
    en: 'Projects',
    fr: 'Projets',
    rw: 'Imishinga',
  },
  'projects.create': {
    en: 'New Project',
    fr: 'Nouveau projet',
    rw: 'Umushinga mushya',
  },
  'projects.no_projects': {
    en: 'No projects yet. Start your first project!',
    fr: "Aucun projet. Commencez votre premier projet !",
    rw: 'Nta mishinga. Tangira umushinga wawe wa mbere!',
  },

  // ─── Team ──────────────────────────────────────────────────
  'team.title': {
    en: 'Team',
    fr: 'Équipe',
    rw: 'Itsinda',
  },
  'team.invite': {
    en: 'Invite Member',
    fr: 'Inviter un membre',
    rw: 'Garagaza umunyamuryango',
  },
  'team.search': {
    en: 'Search team members...',
    fr: "Rechercher des membres d'équipe...",
    rw: 'Shakisha abagize itsinda...',
  },
  'team.role.owner': {
    en: 'Owner',
    fr: 'Propriétaire',
    rw: 'Nyir\'ikibuzo',
  },
  'team.role.manager': {
    en: 'Manager',
    fr: 'Gestionnaire',
    rw: 'Umuyobozi',
  },
  'team.role.developer': {
    en: 'Developer',
    fr: 'Développeur',
    rw: 'Umunyamakuru',
  },
  'team.role.viewer': {
    en: 'Viewer',
    fr: 'Observateur',
    rw: 'Umurebera',
  },
  'team.role.designer': {
    en: 'Designer',
    fr: 'Designer',
    rw: 'Umunyeshusho',
  },
  'team.role.developer_desc': {
    en: 'Create & update tasks, manage projects',
    fr: 'Créer et mettre à jour des tâches, gérer des projets',
    rw: 'Kora no guhindura imirimo, gucunga imishinga',
  },
  'team.role.manager_desc': {
    en: 'Manage projects, team members & sprints',
    fr: 'Gérer les projets, membres et sprints',
    rw: 'Gucunga imishinga, abagize itsinda na sprints',
  },
  'team.role.designer_desc': {
    en: 'Design assets, collaborate on UI/UX',
    fr: 'Créer des éléments de design, collaborer sur UI/UX',
    rw: 'Gukora ibikoresho bya design, gukorana ku UI/UX',
  },
  'team.role.viewer_desc': {
    en: 'Read-only access to projects & tasks',
    fr: 'Accès en lecture seule aux projets et tâches',
    rw: 'Gusoma gusa imishinga n\'imirimo',
  },

  // ─── Chat ──────────────────────────────────────────────────
  'chat.title': {
    en: 'Chat',
    fr: 'Discussion',
    rw: 'Ikiganiro',
  },
  'chat.new_channel': {
    en: 'New Channel',
    fr: 'Nouveau canal',
    rw: 'Umuyoboro mushya',
  },
  'chat.direct_messages': {
    en: 'Direct Messages',
    fr: 'Messages directs',
    rw: 'Ubutumwa bwa kera',
  },
  'chat.type_message': {
    en: 'Type a message...',
    fr: 'Tapez un message...',
    rw: 'Andika ubutumwa...',
  },
  'chat.send': {
    en: 'Send',
    fr: 'Envoyer',
    rw: 'Ohereza',
  },
  'chat.reply': {
    en: 'Reply',
    fr: 'Répondre',
    rw: 'Subiza',
  },
  'chat.edit': {
    en: 'Edit',
    fr: 'Modifier',
    rw: 'Hindura',
  },
  'chat.delete': {
    en: 'Delete',
    fr: 'Supprimer',
    rw: 'Siba',
  },
  'chat.pin': {
    en: 'Pin',
    fr: 'Épingler',
    rw: 'Shyira hejuru',
  },
  'chat.reactions': {
    en: 'React',
    fr: 'Réagir',
    rw: 'Subiza',
  },
  'chat.typing': {
    en: 'is typing...',
    fr: 'est en train d\'écrire...',
    rw: 'arimo andika...',
  },
  'chat.no_channels': {
    en: 'No channels yet. Create one!',
    fr: "Aucun canal. Créez-en un !",
    rw: 'Nta miyoboro. Tangira umwe!',
  },

  // ─── Files ─────────────────────────────────────────────────
  'files.title': {
    en: 'Files',
    fr: 'Fichiers',
    rw: 'Inyandiko',
  },
  'files.upload': {
    en: 'Upload File',
    fr: 'Télécharger un fichier',
    rw: 'Shyira inyandiko',
  },
  'files.drag_drop': {
    en: 'Drag and drop files here, or click to browse',
    fr: 'Glissez-déposez des fichiers ici, ou cliquez pour parcourir',
    rw: 'Kururura inyandiko hano, cyangwa kanda kugira ngo urebe',
  },

  // ─── Notifications ─────────────────────────────────────────
  'notifications.title': {
    en: 'Notifications',
    fr: 'Notifications',
    rw: 'Intangazo',
  },
  'notifications.mark_read': {
    en: 'Mark as read',
    fr: 'Marquer comme lu',
    rw: 'Shyira nk\'ibisomwe',
  },
  'notifications.mark_all_read': {
    en: 'Mark all as read',
    fr: 'Tout marquer comme lu',
    rw: 'Shyira byose nk\'ibisomwe',
  },
  'notifications.no_notifications': {
    en: 'No notifications yet.',
    fr: 'Aucune notification pour l\'instant.',
    rw: 'Nta ntangazo.',
  },
  'notifications.new_invite': {
    en: 'You have a new invitation',
    fr: 'Vous avez une nouvelle invitation',
    rw: 'Ufite inzabitso nshya',
  },

  // ─── Analytics ─────────────────────────────────────────────
  'analytics.title': {
    en: 'Analytics',
    fr: 'Analytique',
    rw: 'Isesengura',
  },
  'analytics.productivity': {
    en: 'Team Productivity',
    fr: "Productivité de l'équipe",
    rw: 'Ubuziranenge bw\'itsinda',
  },
  'analytics.completion_rate': {
    en: 'Completion Rate',
    fr: "Taux d'achèvement",
    rw: 'Ijanisha ry\'ikererwa',
  },
  'analytics.tasks_by_status': {
    en: 'Tasks by Status',
    fr: 'Tâches par statut',
    rw: 'Imirimo hashingiwe ku miterere',
  },
  'analytics.this_week': {
    en: 'This Week',
    fr: 'Cette semaine',
    rw: 'Iki cyumweru',
  },
  'analytics.this_month': {
    en: 'This Month',
    fr: 'Ce mois',
    rw: 'Uku kwezi',
  },
  'analytics.all_time': {
    en: 'All Time',
    fr: 'Toujours',
    rw: 'Igihe cyose',
  },

  // ─── Settings ──────────────────────────────────────────────
  'settings.title': {
    en: 'Settings',
    fr: 'Paramètres',
    rw: 'Igenamiterere',
  },
  'settings.language': {
    en: 'Language',
    fr: 'Langue',
    rw: 'Ururimi',
  },
  'settings.theme': {
    en: 'Theme',
    fr: 'Thème',
    rw: 'Ishusho',
  },
  'settings.theme.dark': {
    en: 'Dark',
    fr: 'Sombre',
    rw: 'Umukara',
  },
  'settings.theme.light': {
    en: 'Light',
    fr: 'Clair',
    rw: 'Mweru',
  },
  'settings.profile': {
    en: 'Profile',
    fr: 'Profil',
    rw: 'Umwirondoro',
  },
  'settings.save': {
    en: 'Save Changes',
    fr: 'Enregistrer les modifications',
    rw: 'Bika impinduka',
  },

  // ─── Workspace ─────────────────────────────────────────────
  'workspace.create': {
    en: 'Create Workspace',
    fr: 'Créer un espace de travail',
    rw: 'Fungura ikibuzo cy\'akazi',
  },
  'workspace.invite': {
    en: 'Invite Members',
    fr: 'Inviter des membres',
    rw: 'Garagaza abagize itsinda',
  },
  'workspace.name': {
    en: 'Workspace Name',
    fr: "Nom de l'espace de travail",
    rw: 'Izina ry\'ikibuzo cy\'akazi',
  },
  'workspace.description': {
    en: 'Description',
    fr: 'Description',
    rw: 'Ibisobanuro',
  },
  'workspace.members': {
    en: 'Members',
    fr: 'Membres',
    rw: 'Abagize',
  },
  'workspace.projects': {
    en: 'Projects',
    fr: 'Projets',
    rw: 'Imishinga',
  },

  // ─── Common / Shared ───────────────────────────────────────
  'common.loading': {
    en: 'Loading...',
    fr: 'Chargement...',
    rw: 'Gutangira...',
  },
  'common.save': {
    en: 'Save',
    fr: 'Enregistrer',
    rw: 'Bika',
  },
  'common.cancel': {
    en: 'Cancel',
    fr: 'Annuler',
    rw: 'Hagarika',
  },
  'common.delete': {
    en: 'Delete',
    fr: 'Supprimer',
    rw: 'Siba',
  },
  'common.edit': {
    en: 'Edit',
    fr: 'Modifier',
    rw: 'Hindura',
  },
  'common.create': {
    en: 'Create',
    fr: 'Créer',
    rw: 'Shiraho',
  },
  'common.search': {
    en: 'Search...',
    fr: 'Rechercher...',
    rw: 'Shakisha...',
  },
  'common.filter': {
    en: 'Filter',
    fr: 'Filtrer',
    rw: 'Shungura',
  },
  'common.all': {
    en: 'All',
    fr: 'Tous',
    rw: 'Byose',
  },
  'common.none': {
    en: 'None',
    fr: 'Aucun',
    rw: 'Nta na kimwe',
  },
  'common.success': {
    en: 'Success!',
    fr: 'Succès !',
    rw: 'Byagenze neza!',
  },
  'common.error': {
    en: 'Something went wrong. Please try again.',
    fr: "Une erreur s'est produite. Veuillez réessayer.",
    rw: 'Habaye ikibazo. Ongera ugerageze.',
  },
  'common.confirm': {
    en: 'Confirm',
    fr: 'Confirmer',
    rw: 'Emeza',
  },
  'common.close': {
    en: 'Close',
    fr: 'Fermer',
    rw: 'Funga',
  },
  'common.no_results': {
    en: 'No results found.',
    fr: 'Aucun résultat trouvé.',
    rw: 'Nta bisubizo bibonetse.',
  },
  'common.see_all': {
    en: 'See all',
    fr: 'Voir tout',
    rw: 'Reba byose',
  },
  'common.back': {
    en: 'Back',
    fr: 'Retour',
    rw: 'Garuka',
  },
  'common.active': {
    en: 'Active',
    fr: 'Actif',
    rw: 'Birakora',
  },
  'common.inactive': {
    en: 'Inactive',
    fr: 'Inactif',
    rw: 'Ntibirakora',
  },
  'common.online': {
    en: 'Online',
    fr: 'En ligne',
    rw: 'Kuri interineti',
  },
  'common.offline': {
    en: 'Offline',
    fr: 'Hors ligne',
    rw: 'Ntibarahuza',
  },
  'common.name': {
    en: 'Name',
    fr: 'Nom',
    rw: 'Izina',
  },
  'common.email': {
    en: 'Email',
    fr: 'E-mail',
    rw: 'Imeli',
  },
  'common.role': {
    en: 'Role',
    fr: 'Rôle',
    rw: 'Uruhare',
  },
  'common.date': {
    en: 'Date',
    fr: 'Date',
    rw: 'Itariki',
  },
  'common.today': {
    en: 'Today',
    fr: "Aujourd'hui",
    rw: 'Uyu munsi',
  },
  'common.yesterday': {
    en: 'Yesterday',
    fr: 'Hier',
    rw: 'Ejo hashize',
  },

  // ─── Errors / Validation ───────────────────────────────────
  'error.required': {
    en: 'This field is required.',
    fr: 'Ce champ est obligatoire.',
    rw: 'Iri soko rirakenewe.',
  },
  'error.invalid_email': {
    en: 'Please enter a valid email address.',
    fr: 'Veuillez entrer une adresse e-mail valide.',
    rw: 'Injiza aderesi ya imeli ikwiriye.',
  },
  'error.password_mismatch': {
    en: 'Passwords do not match.',
    fr: 'Les mots de passe ne correspondent pas.',
    rw: 'Amagambo y\'ibanga ntabwo ahuye.',
  },
  'error.too_short': {
    en: 'Too short (minimum 8 characters).',
    fr: 'Trop court (minimum 8 caractères).',
    rw: 'Biraruhitse cyane (byibuze inyuguti 8).',
  },
  'error.network': {
    en: 'Network error. Please check your connection.',
    fr: 'Erreur réseau. Veuillez vérifier votre connexion.',
    rw: 'Ikosa rya reseau. Reba iyunganira ryawe.',
  },
  'error.unauthorized': {
    en: 'You are not authorized to perform this action.',
    fr: "Vous n'êtes pas autorisé à effectuer cette action.",
    rw: 'Ntabwo uemerewe gukora iyi ntego.',
  },
  'error.not_found': {
    en: 'The requested resource was not found.',
    fr: "La ressource demandée n'a pas été trouvée.",
    rw: 'Ibirebwa byasabwe ntibibonetse.',
  },

  // ─── Invitations ───────────────────────────────────────────
  'invite.title': {
    en: 'Invite to Workspace',
    fr: "Inviter à l'espace de travail",
    rw: "Garagaza mu kibuzo cy'akazi",
  },
  'invite.email_label': {
    en: 'Email address',
    fr: 'Adresse e-mail',
    rw: 'Aderesi ya imeli',
  },
  'invite.role_label': {
    en: 'Role',
    fr: 'Rôle',
    rw: 'Uruhare',
  },
  'invite.send': {
    en: 'Send Invitation',
    fr: "Envoyer l'invitation",
    rw: 'Ohereza inzabitso',
  },
  'invite.link': {
    en: 'Or share invite link',
    fr: "Ou partager le lien d'invitation",
    rw: 'Cyangwa sangira aho bajya',
  },
  'invite.copy_link': {
    en: 'Copy Link',
    fr: 'Copier le lien',
    rw: 'Kopi ya aho bajya',
  },
  'invite.success': {
    en: 'Invitation sent successfully!',
    fr: 'Invitation envoyée avec succès !',
    rw: 'Inzabitso yoherejwe neza!',
  },
  'invite.join': {
    en: 'Join Workspace',
    fr: "Rejoindre l'espace de travail",
    rw: "Injira mu kibuzo cy'akazi",
  },
  'invite.accept': {
    en: 'Accept Invitation',
    fr: "Accepter l'invitation",
    rw: 'Emera inzabitso',
  },
};

export default translations;
