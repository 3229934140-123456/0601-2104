import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import { getStatusText } from '@/utils/format';
import classnames from 'classnames';

const MatchDetailPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const { homeTeam, awayTeam } = currentMatch;

  const homeStarters = useMemo(() => homeTeam.players.filter(p => p.isStarter), [homeTeam]);
  const awayStarters = useMemo(() => awayTeam.players.filter(p => p.isStarter), [awayTeam]);
  const homeSubs = useMemo(() => homeTeam.players.filter(p => !p.isStarter), [homeTeam]);
  const awaySubs = useMemo(() => awayTeam.players.filter(p => !p.isStarter), [awayTeam]);

  const getStatusClass = () => {
    const map: Record<string, string> = {
      upcoming: styles.statusUpcoming,
      ongoing: styles.statusOngoing,
      finished: styles.statusFinished
    };
    return map[currentMatch.status] || styles.statusUpcoming;
  };

  const handleAdjustStarters = () => {
    Taro.navigateTo({
      url: '/pages/player-list/index'
    });
  };

  const renderTeamSection = (
    team: typeof homeTeam,
    starters: typeof homeStarters,
    subs: typeof homeSubs,
    label: string
  ) => (
    <View className={styles.teamSection}>
      <View className={styles.sectionHeader}>
        <View className={styles.sectionTitle}>
          <View className={styles.teamColorDot} style={{ background: team.color }} />
          <Text>{team.name}</Text>
        </View>
        <View className={classnames(styles.checkStatus, starters.length >= 5 ? styles.checkOk : styles.checkPending)}>
          <Text className={styles.checkIcon}>{starters.length >= 5 ? '✓' : '!'}</Text>
          <Text>{starters.length >= 5 ? '首发已确认' : '首发未确认'}</Text>
        </View>
      </View>

      <Text className={styles.startersCount}>首发 {starters.length} 人</Text>
      <View className={styles.playerList}>
        {starters.map((player) => (
          <View key={player.id} className={styles.playerRow}>
            <View className={classnames(styles.playerNumber, styles.starterNumber)}>
              <Text className={styles.numberText}>{player.number}</Text>
            </View>
            <View className={styles.playerInfo}>
              <Text className={styles.playerName}>{player.name}</Text>
              <Text className={styles.playerPosition}>{player.position}</Text>
            </View>
            <View className={styles.starterTag}>
              <Text>首发</Text>
            </View>
          </View>
        ))}
      </View>

      {subs.length > 0 && (
        <>
          <View className={styles.divider} />
          <Text className={styles.startersCount}>替补 {subs.length} 人</Text>
          <View className={styles.playerList}>
            {subs.map((player) => (
              <View key={player.id} className={styles.playerRow}>
                <View className={classnames(styles.playerNumber, styles.subNumber)}>
                  <Text className={styles.numberText}>{player.number}</Text>
                </View>
                <View className={styles.playerInfo}>
                  <Text className={styles.playerName}>{player.name}</Text>
                  <Text className={styles.playerPosition}>{player.position}</Text>
                </View>
                <View className={styles.subTag}>
                  <Text>替补</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.infoCard}>
        <View className={styles.infoHeader}>
          <Text className={styles.matchTitle}>{currentMatch.tournament}</Text>
          <View className={classnames(styles.statusBadge, getStatusClass())}>
            <Text>{getStatusText(currentMatch.status)}</Text>
          </View>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>场地</Text>
          <Text className={styles.value}>{currentMatch.venue}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>日期</Text>
          <Text className={styles.value}>{currentMatch.date} {currentMatch.time}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>赛制</Text>
          <Text className={styles.value}>共{currentMatch.totalPeriods}节，每节{currentMatch.periodDuration}分钟</Text>
        </View>
      </View>

      <View className={styles.scoreCard}>
        <View className={styles.scoreRow}>
          <View className={styles.teamInfo}>
            <Text className={styles.teamName}>{homeTeam.name}</Text>
            <Text className={styles.teamScore} style={{ color: homeTeam.color }}>{homeTeam.score}</Text>
          </View>
          <View className={styles.vs}>
            <Text className={styles.vsText}>VS</Text>
          </View>
          <View className={styles.teamInfo}>
            <Text className={styles.teamName}>{awayTeam.name}</Text>
            <Text className={styles.teamScore} style={{ color: awayTeam.color }}>{awayTeam.score}</Text>
          </View>
        </View>
        <Text style={{ fontSize: '24rpx', color: '#64748B' }}>
          第{currentMatch.period}/{currentMatch.totalPeriods}节 · {currentMatch.currentTime}
        </Text>
      </View>

      {renderTeamSection(homeTeam, homeStarters, homeSubs, '主队')}
      {renderTeamSection(awayTeam, awayStarters, awaySubs, '客队')}

      <View className={styles.bottomAction}>
        <Button className={styles.adjustBtn} onClick={handleAdjustStarters}>
          ✏️ 调整首发阵容
        </Button>
      </View>
    </ScrollView>
  );
};

export default MatchDetailPage;
