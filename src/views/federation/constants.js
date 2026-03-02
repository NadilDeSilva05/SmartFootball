// Shared options for federation modals
// Leagues, clubs, matches come from API – pass as props to federation components.

export const LICENSE_LEVEL_OPTIONS = [
  { id: 'grassroots', label: 'Grassroots/Class 3' },
  { id: 'district-regional', label: 'District/Regional' },
  { id: 'national', label: 'National (Class 1/Grade 1)' },
  { id: 'fifa-elite', label: 'Elite FIFA-listed referees' }
]

// Referees come from /api/referees – pass as prop to assign-referees, add-result, etc.

export const REFEREE_ROLES = [
  { key: 'mainReferee', label: 'Main Referee' },
  { key: 'assistant1', label: 'Assistant Referee 1' },
  { key: 'assistant2', label: 'Assistant Referee 2' },
  { key: 'fourthOfficial', label: 'Fourth Official' }
]

export const GOAL_TYPES = [
  { id: 'open_play', label: 'Open play' },
  { id: 'penalty', label: 'Penalty' },
  { id: 'free_kick', label: 'Free kick' },
  { id: 'own_goal', label: 'Own goal' }
]
