import type { Match, Tournament, Venue, Player, Team } from '@/types/match';

const generatePlayers = (teamId: string, count: number, startNumber: number): Player[] => {
  const names = ['张伟', '李强', '王磊', '刘洋', '陈明', '杨杰', '赵鹏', '黄涛', '周勇', '吴凯', '徐飞', '孙浩', '马超', '朱峰', '胡伟'];
  const positions = ['前锋', '中场', '后卫', '门将', '前锋', '中场', '后卫', '中场', '前锋', '后卫', '门将', '中场', '前锋', '后卫', '中场'];
  return Array.from({ length: count }, (_, i) => ({
    id: `${teamId}-player-${i + 1}`,
    number: startNumber + i,
    name: names[i % names.length],
    position: positions[i % positions.length],
    isStarter: i < 5,
    yellowCards: 0,
    redCards: 0,
    goals: 0,
    assists: 0
  }));
};

export const tournaments: Tournament[] = [
  { id: 't1', name: '2024城市业余足球联赛' },
  { id: 't2', name: '春季杯篮球邀请赛' },
  { id: 't3', name: '社区羽毛球赛' }
];

export const venues: Venue[] = [
  { id: 'v1', name: '市体育中心主场', address: '体育路1号' },
  { id: 'v2', name: '滨江公园球场', address: '滨江大道88号' },
  { id: 'v3', name: '大学城体育馆', address: '学府路99号' },
  { id: 'v4', name: '工人文化宫球场', address: '人民路56号' }
];

const homeTeam: Team = {
  id: 'team-home',
  name: '烈焰FC',
  color: '#3B82F6',
  players: generatePlayers('team-home', 15, 1),
  score: 0,
  fouls: 0
};

const awayTeam: Team = {
  id: 'team-away',
  name: '风暴联队',
  color: '#F97316',
  players: generatePlayers('team-away', 15, 1),
  score: 0,
  fouls: 0
};

export const currentMatch: Match = {
  id: 'match-001',
  tournament: '2024城市业余足球联赛',
  venue: '市体育中心主场',
  date: '2024-06-15',
  time: '14:00',
  status: 'upcoming',
  homeTeam,
  awayTeam,
  period: 1,
  totalPeriods: 2,
  periodDuration: 45,
  currentTime: '00:00',
  events: [],
  isRunning: false,
  timeouts: {
    home: 3,
    away: 3
  }
};

export const matchList: Match[] = [
  {
    id: 'match-001',
    tournament: '2024城市业余足球联赛',
    venue: '市体育中心主场',
    date: '2024-06-15',
    time: '14:00',
    status: 'upcoming',
    homeTeam: { ...homeTeam, players: [] },
    awayTeam: { ...awayTeam, players: [] },
    period: 1,
    totalPeriods: 2,
    periodDuration: 45,
    currentTime: '00:00',
    events: [],
    isRunning: false,
    timeouts: { home: 3, away: 3 }
  },
  {
    id: 'match-002',
    tournament: '2024城市业余足球联赛',
    venue: '滨江公园球场',
    date: '2024-06-15',
    time: '16:30',
    status: 'upcoming',
    homeTeam: {
      id: 'team-3',
      name: '闪电队',
      color: '#22C55E',
      players: [],
      score: 0,
      fouls: 0
    },
    awayTeam: {
      id: 'team-4',
      name: '猛虎队',
      color: '#EF4444',
      players: [],
      score: 0,
      fouls: 0
    },
    period: 1,
    totalPeriods: 2,
    periodDuration: 45,
    currentTime: '00:00',
    events: [],
    isRunning: false,
    timeouts: { home: 3, away: 3 }
  },
  {
    id: 'match-003',
    tournament: '春季杯篮球邀请赛',
    venue: '大学城体育馆',
    date: '2024-06-16',
    time: '09:00',
    status: 'upcoming',
    homeTeam: {
      id: 'team-5',
      name: '雄鹰队',
      color: '#8B5CF6',
      players: [],
      score: 0,
      fouls: 0
    },
    awayTeam: {
      id: 'team-6',
      name: '神龙队',
      color: '#EC4899',
      players: [],
      score: 0,
      fouls: 0
    },
    period: 1,
    totalPeriods: 4,
    periodDuration: 12,
    currentTime: '00:00',
    events: [],
    isRunning: false,
    timeouts: { home: 5, away: 5 }
  },
  {
    id: 'match-004',
    tournament: '2024城市业余足球联赛',
    venue: '工人文化宫球场',
    date: '2024-06-16',
    time: '15:00',
    status: 'finished',
    homeTeam: {
      id: 'team-7',
      name: '猎豹队',
      color: '#F59E0B',
      players: [],
      score: 2,
      fouls: 0
    },
    awayTeam: {
      id: 'team-8',
      name: '雄狮队',
      color: '#14B8A6',
      players: [],
      score: 1,
      fouls: 0
    },
    period: 2,
    totalPeriods: 2,
    periodDuration: 45,
    currentTime: '90:00',
    events: [],
    isRunning: false,
    timeouts: { home: 0, away: 1 }
  },
  {
    id: 'match-005',
    tournament: '春季杯篮球邀请赛',
    venue: '市体育中心主场',
    date: '2024-06-17',
    time: '19:00',
    status: 'upcoming',
    homeTeam: {
      id: 'team-9',
      name: '火箭队',
      color: '#EF4444',
      players: [],
      score: 0,
      fouls: 0
    },
    awayTeam: {
      id: 'team-10',
      name: '勇士队',
      color: '#3B82F6',
      players: [],
      score: 0,
      fouls: 0
    },
    period: 1,
    totalPeriods: 4,
    periodDuration: 12,
    currentTime: '00:00',
    events: [],
    isRunning: false,
    timeouts: { home: 5, away: 5 }
  }
];
