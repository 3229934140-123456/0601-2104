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
    homeTeam: { ...homeTeam },
    awayTeam: { ...awayTeam },
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
      players: generatePlayers('team-3', 15, 1),
      score: 0,
      fouls: 0
    },
    awayTeam: {
      id: 'team-4',
      name: '猛虎队',
      color: '#EF4444',
      players: generatePlayers('team-4', 15, 1),
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
      players: generatePlayers('team-5', 12, 0),
      score: 0,
      fouls: 0
    },
    awayTeam: {
      id: 'team-6',
      name: '神龙队',
      color: '#EC4899',
      players: generatePlayers('team-6', 12, 0),
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
      players: generatePlayers('team-7', 15, 1).map((p, i) => ({
        ...p,
        goals: i === 0 ? 2 : i === 3 ? 1 : 0,
        assists: i === 2 ? 2 : 0,
        yellowCards: i === 5 ? 1 : 0
      })),
      score: 2,
      fouls: 0
    },
    awayTeam: {
      id: 'team-8',
      name: '雄狮队',
      color: '#14B8A6',
      players: generatePlayers('team-8', 15, 1).map((p, i) => ({
        ...p,
        goals: i === 1 ? 1 : 0,
        assists: i === 4 ? 1 : 0,
        redCards: i === 7 ? 1 : 0
      })),
      score: 1,
      fouls: 0
    },
    period: 2,
    totalPeriods: 2,
    periodDuration: 45,
    currentTime: '90:00',
    events: [
      {
        id: 'e1',
        type: 'goal',
        teamId: 'team-7',
        playerId: 'team-7-player-1',
        playerName: '张伟',
        assistPlayerId: 'team-7-player-3',
        assistPlayerName: '王磊',
        time: '12:30',
        period: 1,
        description: '张伟接王磊边路传中头球破门'
      },
      {
        id: 'e2',
        type: 'yellowCard',
        teamId: 'team-7',
        playerId: 'team-7-player-6',
        playerName: '杨杰',
        time: '28:15',
        period: 1,
        description: '杨杰防守犯规吃到黄牌'
      },
      {
        id: 'e3',
        type: 'goal',
        teamId: 'team-8',
        playerId: 'team-8-player-2',
        playerName: '李强',
        assistPlayerId: 'team-8-player-5',
        assistPlayerName: '陈明',
        time: '35:00',
        period: 1,
        description: '李强禁区内推射远角得分'
      },
      {
        id: 'e4',
        type: 'timeout',
        teamId: 'team-7',
        time: '40:00',
        period: 1,
        description: '猎豹队请求暂停'
      },
      {
        id: 'e5',
        type: 'substitution',
        teamId: 'team-7',
        playerId: 'team-7-player-4',
        playerName: '刘洋',
        time: '55:20',
        period: 2,
        description: '刘洋替补登场'
      },
      {
        id: 'e6',
        type: 'redCard',
        teamId: 'team-8',
        playerId: 'team-8-player-8',
        playerName: '黄涛',
        time: '68:45',
        period: 2,
        description: '黄涛严重犯规被红牌罚下'
      },
      {
        id: 'e7',
        type: 'dispute',
        teamId: '',
        time: '70:00',
        period: 2,
        description: '【犯规争议】客队对红牌判罚不满，裁判维持原判',
        disputeType: 'foul',
        photos: []
      },
      {
        id: 'e8',
        type: 'goal',
        teamId: 'team-7',
        playerId: 'team-7-player-1',
        playerName: '张伟',
        assistPlayerId: 'team-7-player-3',
        assistPlayerName: '王磊',
        time: '82:10',
        period: 2,
        description: '张伟点球命中梅开二度'
      },
      {
        id: 'e9',
        type: 'scoreDeduct',
        teamId: 'team-7',
        time: '85:00',
        period: 2,
        description: '因球员抗议，裁判扣掉猎豹队1个进球'
      }
    ],
    isRunning: false,
    timeouts: { home: 0, away: 1 },
    confirmation: {
      homeCaptain: { name: '张伟', time: '16:45', signed: true },
      awayCaptain: { name: '李强', time: '16:48', signed: true },
      referee: { name: '王裁判', time: '16:50', confirmed: true },
      confirmedAt: '2024-06-16 16:50'
    }
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
      players: generatePlayers('team-9', 12, 0),
      score: 0,
      fouls: 0
    },
    awayTeam: {
      id: 'team-10',
      name: '勇士队',
      color: '#3B82F6',
      players: generatePlayers('team-10', 12, 0),
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
