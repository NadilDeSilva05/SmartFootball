// Shared options for federation modals

export const LEAGUES_OPTIONS = [
  { id: '1', name: 'Premier League' },
  { id: '2', name: 'Division One' },
  { id: '3', name: 'Regional Cup' },
  { id: '4', name: 'Super League' }
]

export const TEAMS_OPTIONS = [
  { id: 'city-fc', name: 'City FC' },
  { id: 'united-sc', name: 'United SC' },
  { id: 'rovers-fc', name: 'Rovers FC' },
  { id: 'athletic-club', name: 'Athletic Club' },
  { id: 'stars-fc', name: 'Stars FC' },
  { id: 'dynamo-fc', name: 'Dynamo FC' }
]

export const LICENSE_LEVEL_OPTIONS = [
  { id: 'grassroots', label: 'Grassroots/Class 3' },
  { id: 'district-regional', label: 'District/Regional' },
  { id: 'national', label: 'National (Class 1/Grade 1)' },
  { id: 'fifa-elite', label: 'Elite FIFA-listed referees' }
]

export const REFEREES_OPTIONS = [
  { id: '1', fullName: 'John Silva', licenseLevelLabel: 'Elite FIFA-listed referees' },
  { id: '2', fullName: 'Maria Perera', licenseLevelLabel: 'National (Class 1/Grade 1)' },
  { id: '3', fullName: 'David Fernando', licenseLevelLabel: 'District/Regional' },
  { id: '4', fullName: 'Sarah Gomes', licenseLevelLabel: 'National (Class 1/Grade 1)' },
  { id: '5', fullName: 'James Wilson', licenseLevelLabel: 'Grassroots/Class 3' }
]

export const REFEREES_OPTIONS_SIMPLE = [
  { id: '1', name: 'John Silva' },
  { id: '2', name: 'Maria Perera' },
  { id: '3', name: 'David Fernando' },
  { id: '4', name: 'Sarah Gomes' }
]

export const REFEREE_ROLES = [
  { key: 'mainReferee', label: 'Main Referee' },
  { key: 'assistant1', label: 'Assistant Referee 1' },
  { key: 'assistant2', label: 'Assistant Referee 2' },
  { key: 'fourthOfficial', label: 'Fourth Official' }
]

export const SCHEDULED_MATCHES = [
  { id: 'm1', homeTeamName: 'City FC', awayTeamName: 'United SC', leagueName: 'Premier League', venue: 'National Stadium', date: '2025-02-15' },
  { id: 'm2', homeTeamName: 'Rovers FC', awayTeamName: 'Athletic Club', leagueName: 'Premier League', venue: 'City Arena', date: '2025-02-16' },
  { id: 'm3', homeTeamName: 'Stars FC', awayTeamName: 'Dynamo FC', leagueName: 'Division One', venue: 'Regional Ground', date: '2025-02-18' },
  { id: 'm4', homeTeamName: 'City FC', awayTeamName: 'Rovers FC', leagueName: 'Premier League', venue: 'National Stadium', date: '2025-02-20' },
  { id: 'm5', homeTeamName: 'United SC', awayTeamName: 'Dynamo FC', leagueName: 'Premier League', venue: 'City Arena', date: '2025-02-22' }
]

export const GOAL_TYPES = [
  { id: 'open_play', label: 'Open play' },
  { id: 'penalty', label: 'Penalty' },
  { id: 'free_kick', label: 'Free kick' },
  { id: 'own_goal', label: 'Own goal' }
]
