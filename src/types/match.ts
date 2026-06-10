export interface Player {
  id: string;
  number: number;
  name: string;
  position?: string;
  isStarter?: boolean;
  yellowCards: number;
  redCards: number;
  goals: number;
  assists: number;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  color: string;
  players: Player[];
  score: number;
  fouls: number;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'assist' | 'yellowCard' | 'redCard' | 'substitution' | 'timeout' | 'period';
  teamId: string;
  playerId?: string;
  playerName?: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  time: string;
  period: number;
  description: string;
  photoUrl?: string;
}

export interface Match {
  id: string;
  tournament: string;
  venue: string;
  date: string;
  time: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  homeTeam: Team;
  awayTeam: Team;
  period: number;
  totalPeriods: number;
  periodDuration: number;
  currentTime: string;
  events: MatchEvent[];
  isRunning: boolean;
  timeouts: {
    home: number;
    away: number;
  };
}

export interface Tournament {
  id: string;
  name: string;
  logo?: string;
}

export interface Venue {
  id: string;
  name: string;
  address?: string;
}

export interface Statistics {
  totalShots: number;
  shotsOnTarget: number;
  possession: number;
  fouls: number;
  corners: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
}
