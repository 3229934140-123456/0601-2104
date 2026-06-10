import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import { getEventLabel, getStatusText } from '@/utils/format';
import classnames from 'classnames';

const ScoreReportPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const { homeTeam, awayTeam, events } = currentMatch;

  const stats = useMemo(() => {
    const homeGoals = homeTeam.players.reduce((s, p) => s + p.goals, 0);
    const awayGoals = awayTeam.players.reduce((s, p) => s + p.goals, 0);
    const homeYellow = homeTeam.players.reduce((s, p) => s + p.yellowCards, 0);
    const awayYellow = awayTeam.players.reduce((s, p) => s + p.yellowCards, 0);
    const homeRed = homeTeam.players.reduce((s, p) => s + p.redCards, 0);
    const awayRed = awayTeam.players.reduce((s, p) => s + p.redCards, 0);
    const homeAssists = homeTeam.players.reduce((s, p) => s + p.assists, 0);
    const awayAssists = awayTeam.players.reduce((s, p) => s + p.assists, 0);
    return { homeGoals, awayGoals, homeYellow, awayYellow, homeRed, awayRed, homeAssists, awayAssists };
  }, [homeTeam, awayTeam]);

  const goalEvents = useMemo(() => events.filter(e => e.type === 'goal'), [events]);
  const cardEvents = useMemo(() => events.filter(e => e.type === 'yellowCard' || e.type === 'redCard'), [events]);
  const timeoutEvents = useMemo(() => events.filter(e => e.type === 'timeout'), [events]);
  const disputeEvents = useMemo(() => events.filter(e => e.type === 'dispute'), [events]);

  const getBadgeClass = (type: string) => {
    const map: Record<string, string> = {
      goal: styles.badgeGoal,
      yellowCard: styles.badgeYellow,
      redCard: styles.badgeRed
    };
    return map[type] || styles.badgeOther;
  };

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    Taro.showToast({ title: '请点击右上角分享', icon: 'none' });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.reportCard}>
        <View className={styles.reportHeader}>
          <Text className={styles.tournamentName}>{currentMatch.tournament}</Text>
          <Text className={styles.reportMeta}>
            {currentMatch.venue} · {currentMatch.date} {currentMatch.time}
          </Text>
        </View>

        <View className={styles.scoreSection}>
          <View className={styles.scoreRow}>
            <View className={styles.teamInfo}>
              <Text className={styles.teamName}>{homeTeam.name}</Text>
              <Text className={styles.teamScore} style={{ color: homeTeam.color }}>
                {homeTeam.score}
              </Text>
            </View>
            <View className={styles.vs}>
              <Text className={styles.vsText}>VS</Text>
            </View>
            <View className={styles.teamInfo}>
              <Text className={styles.teamName}>{awayTeam.name}</Text>
              <Text className={styles.teamScore} style={{ color: awayTeam.color }}>
                {awayTeam.score}
              </Text>
            </View>
          </View>
          <Text className={styles.reportMeta}>
            {getStatusText(currentMatch.status)} · 第{currentMatch.period}/{currentMatch.totalPeriods}节 · {currentMatch.currentTime}
          </Text>
        </View>
      </View>

      <View className={styles.reportCard}>
        <Text className={styles.sectionTitle}>技术统计</Text>
        <View className={styles.statGrid}>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队进球</Text>
            <Text className={styles.value}>{stats.homeGoals}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队进球</Text>
            <Text className={styles.value}>{stats.awayGoals}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队助攻</Text>
            <Text className={styles.value}>{stats.homeAssists}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队助攻</Text>
            <Text className={styles.value}>{stats.awayAssists}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队黄牌</Text>
            <Text className={styles.value}>{stats.homeYellow}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队黄牌</Text>
            <Text className={styles.value}>{stats.awayYellow}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队红牌</Text>
            <Text className={styles.value}>{stats.homeRed}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队红牌</Text>
            <Text className={styles.value}>{stats.awayRed}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队暂停</Text>
            <Text className={styles.value}>{currentMatch.timeouts.home}次剩余</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队暂停</Text>
            <Text className={styles.value}>{currentMatch.timeouts.away}次剩余</Text>
          </View>
        </View>
      </View>

      {goalEvents.length > 0 && (
        <View className={styles.reportCard}>
          <Text className={styles.sectionTitle}>进球明细</Text>
          <View className={styles.eventList}>
            {goalEvents.map(e => (
              <View key={e.id} className={styles.eventRow}>
                <Text className={styles.eventTime}>{e.time}</Text>
                <View className={classnames(styles.eventTypeBadge, styles.badgeGoal)}>
                  <Text>{getEventLabel(e.type)}</Text>
                </View>
                <Text className={styles.eventDesc}>{e.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {cardEvents.length > 0 && (
        <View className={styles.reportCard}>
          <Text className={styles.sectionTitle}>红黄牌明细</Text>
          <View className={styles.eventList}>
            {cardEvents.map(e => (
              <View key={e.id} className={styles.eventRow}>
                <Text className={styles.eventTime}>{e.time}</Text>
                <View className={classnames(styles.eventTypeBadge, getBadgeClass(e.type))}>
                  <Text>{getEventLabel(e.type)}</Text>
                </View>
                <Text className={styles.eventDesc}>{e.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {timeoutEvents.length > 0 && (
        <View className={styles.reportCard}>
          <Text className={styles.sectionTitle}>暂停记录</Text>
          <View className={styles.eventList}>
            {timeoutEvents.map(e => (
              <View key={e.id} className={styles.eventRow}>
                <Text className={styles.eventTime}>{e.time}</Text>
                <Text className={styles.eventDesc}>{e.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {disputeEvents.length > 0 && (
        <View className={styles.reportCard}>
          <Text className={styles.sectionTitle}>争议记录</Text>
          <View className={styles.eventList}>
            {disputeEvents.map(e => (
              <View key={e.id} className={styles.eventRow}>
                <Text className={styles.eventTime}>{e.time}</Text>
                <Text className={styles.eventDesc}>{e.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.reportCard}>
        <Text className={styles.sectionTitle}>确认信息</Text>
        <View className={styles.confirmInfo}>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>比赛编号</Text>
            <Text className={styles.value}>{currentMatch.id}</Text>
          </View>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>比赛状态</Text>
            <Text className={styles.value}>{getStatusText(currentMatch.status)}</Text>
          </View>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>最终比分</Text>
            <Text className={styles.value}>{homeTeam.name} {homeTeam.score} - {awayTeam.score} {awayTeam.name}</Text>
          </View>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>事件总数</Text>
            <Text className={styles.value}>{events.length} 条</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomActions}>
        <Button className={classnames(styles.actionBtn, styles.backBtn)} onClick={handleBack}>
          返回
        </Button>
        <Button className={classnames(styles.actionBtn, styles.shareBtn)} onClick={handleShare}>
          📤 分享成绩单
        </Button>
      </View>
    </ScrollView>
  );
};

export default ScoreReportPage;
