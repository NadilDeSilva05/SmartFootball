/** KBar quick-nav targets — Smart Football routes only */
const data = [
  { id: 'sf-1', name: 'Login', url: '/login', icon: 'ri-login-box-line', section: 'Auth' },
  { id: 'sf-2', name: 'Register', url: '/register', icon: 'ri-user-add-line', section: 'Auth' },
  { id: 'sf-4', name: 'Federation dashboard', url: '/federation', icon: 'ri-dashboard-line', section: 'Federation' },
  { id: 'sf-5', name: 'Clubs', url: '/federation/clubs', icon: 'ri-building-line', section: 'Federation' },
  { id: 'sf-6', name: 'Referees', url: '/federation/referees', icon: 'ri-user-star-line', section: 'Federation' },
  { id: 'sf-7', name: 'Leagues', url: '/federation/leagues', icon: 'ri-trophy-line', section: 'Federation' },
  { id: 'sf-8', name: 'Schedule matches', url: '/federation/matches/schedule', icon: 'ri-calendar-line', section: 'Federation' },
  { id: 'sf-9', name: 'Assign referees', url: '/federation/matches/assign-referees', icon: 'ri-user-add-line', section: 'Federation' },
  { id: 'sf-10', name: 'Past results', url: '/federation/matches/past-results', icon: 'ri-football-line', section: 'Federation' },
  { id: 'sf-11', name: 'Player requests', url: '/federation/player-requests', icon: 'ri-user-add-line', section: 'Federation' },
  { id: 'sf-12', name: 'Coach requests', url: '/federation/coach-requests', icon: 'ri-user-search-line', section: 'Federation' },
  { id: 'sf-13', name: 'Club dashboard', url: '/club', icon: 'ri-dashboard-line', section: 'Club' },
  { id: 'sf-14', name: 'Players', url: '/club/players', icon: 'ri-user-line', section: 'Club' },
  { id: 'sf-15', name: 'Coaches', url: '/club/coaches', icon: 'ri-user-star-line', section: 'Club' },
  { id: 'sf-16', name: 'Upcoming matches', url: '/club/matches/upcoming', icon: 'ri-calendar-check-line', section: 'Club' },
  { id: 'sf-17', name: 'Past matches', url: '/club/matches/past', icon: 'ri-calendar-line', section: 'Club' },
  { id: 'sf-18', name: 'Live match', url: '/coach/live-dashboard', icon: 'ri-heart-pulse-line', section: 'Coach' },
  { id: 'sf-19', name: 'Substitutions', url: '/coach/substitutions', icon: 'ri-repeat-line', section: 'Coach' },
  { id: 'sf-20', name: 'Injury alerts', url: '/coach/injury-alerts', icon: 'ri-alarm-warning-line', section: 'Coach' },
  { id: 'sf-21', name: 'Coach performance history', url: '/coach/performance-history', icon: 'ri-bar-chart-line', section: 'Coach' },
  { id: 'sf-22', name: 'Player dashboard', url: '/player', icon: 'ri-dashboard-line', section: 'Player' },
  { id: 'sf-23', name: 'Player profile', url: '/player/profile', icon: 'ri-user-line', section: 'Player' },
  { id: 'sf-24', name: 'Player performance', url: '/player/performance', icon: 'ri-bar-chart-line', section: 'Player' },
  { id: 'sf-25', name: 'QR scanner', url: '/referee/qr-scanner', icon: 'ri-qr-scan-2-line', section: 'Referee' },
  { id: 'sf-26', name: 'Player verification', url: '/referee/player-verification', icon: 'ri-user-search-line', section: 'Referee' }
]

export default data
