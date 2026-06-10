export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeWithPeriod = (time: string, period: number, totalPeriods: number): string => {
  return `第${period}/${totalPeriods}节 ${time}`;
};

export const getEventColor = (type: string): string => {
  const colors: Record<string, string> = {
    goal: '#22C55E',
    assist: '#22C55E',
    yellowCard: '#EAB308',
    redCard: '#EF4444',
    substitution: '#0EA5E9',
    timeout: '#8B5CF6',
    period: '#F97316'
  };
  return colors[type] || '#64748B';
};

export const getEventLabel = (type: string): string => {
  const labels: Record<string, string> = {
    goal: '进球',
    assist: '助攻',
    yellowCard: '黄牌',
    redCard: '红牌',
    substitution: '换人',
    timeout: '暂停',
    period: '节次',
    dispute: '争议',
    scoreDeduct: '扣分'
  };
  return labels[type] || type;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    upcoming: '未开始',
    ongoing: '进行中',
    finished: '已结束'
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    upcoming: '#64748B',
    ongoing: '#22C55E',
    finished: '#0EA5E9'
  };
  return colorMap[status] || '#64748B';
};
