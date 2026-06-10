import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import { getStatusText } from '@/utils/format';
import classnames from 'classnames';
import type { Player } from '@/types/match';

type RankTab = 'goals' | 'assists' | 'cards';

const StatisticsPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const [activeTab, setActiveTab] = useState<RankTab>('goals');

  const { homeTeam, awayTeam } = currentMatch;

  const teamStats = useMemo(() => {
    const homeGoals = homeTeam.players.reduce((sum, p) => sum + p.goals, 0);
    const awayGoals = awayTeam.players.reduce((sum, p) => sum + p.goals, 0);
    const totalGoals = homeGoals + awayGoals || 1;

    const homeYellow = homeTeam.players.reduce((sum, p) => sum + p.yellowCards, 0);
    const awayYellow = awayTeam.players.reduce((sum, p) => sum + p.yellowCards, 0);
    const totalYellow = homeYellow + awayYellow || 1;

    const homeRed = homeTeam.players.reduce((sum, p) => sum + p.redCards, 0);
    const awayRed = awayTeam.players.reduce((sum, p) => sum + p.redCards, 0);
    const totalRed = homeRed + awayRed || 1;

    return [
      { name: '进球', home: homeGoals, away: awayGoals, total: totalGoals, homeColor: '#3B82F6', awayColor: '#F97316' },
      { name: '黄牌', home: homeYellow, away: awayYellow, total: totalYellow, homeColor: '#EAB308', awayColor: '#EAB308' },
      { name: '红牌', home: homeRed, away: awayRed, total: totalRed, homeColor: '#EF4444', awayColor: '#EF4444' }
    ];
  }, [homeTeam, awayTeam]);

  const allPlayers = useMemo(() => {
    const players: (Player & { teamName: string; teamColor: string })[] = [];
    
    homeTeam.players.forEach(p => {
      players.push({ ...p, teamName: homeTeam.name, teamColor: homeTeam.color });
    });
    awayTeam.players.forEach(p => {
      players.push({ ...p, teamName: awayTeam.name, teamColor: awayTeam.color });
    });
    
    return players;
  }, [homeTeam, awayTeam]);

  const goalRank = useMemo(() => {
    return allPlayers
      .filter(p => p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10);
  }, [allPlayers]);

  const assistRank = useMemo(() => {
    return allPlayers
      .filter(p => p.assists > 0)
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 10);
  }, [allPlayers]);

  const cardRank = useMemo(() => {
    return allPlayers
      .filter(p => p.yellowCards > 0 || p.redCards > 0)
      .sort((a, b) => (b.yellowCards + b.redCards * 2) - (a.yellowCards + a.redCards * 2))
      .slice(0, 10);
  }, [allPlayers]);

  const getCurrentRankList = () => {
    switch (activeTab) {
      case 'goals':
        return goalRank.map(p => ({ ...p, value: p.goals, unit: '球' }));
      case 'assists':
        return assistRank.map(p => ({ ...p, value: p.assists, unit: '次' }));
      case 'cards':
        return cardRank.map(p => ({ 
          ...p, 
          value: p.yellowCards + p.redCards, 
          unit: '张',
          detail: `黄${p.yellowCards}/红${p.redCards}` 
        }));
      default:
        return [];
    }
  };

  const getStatusClass = () => {
    const map: Record<string, string> = {
      upcoming: styles.statusUpcoming,
      ongoing: styles.statusOngoing,
      finished: styles.statusFinished
    };
    return map[currentMatch.status] || styles.statusUpcoming;
  };

  const handleExport = () => {
    Taro.navigateTo({
      url: '/pages/score-report/index'
    });
  };

  const handleConfirm = () => {
    Taro.navigateTo({
      url: '/pages/confirm/index'
    });
  };

  const rankList = getCurrentRankList();

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.scoreOverview}>
        <View className={classnames(styles.matchStatus, getStatusClass())}>
          <Text>{getStatusText(currentMatch.status)}</Text>
        </View>
        
        <View className={styles.scoreRow}>
          <View className={styles.teamInfo}>
            <Text className={styles.teamName}>{homeTeam.name}</Text>
            <Text className={styles.teamScore} style={{ color: homeTeam.color }}>
              {homeTeam.score}
            </Text>
          </View>
          
          <View className={styles.vsDivider}>
            <Text className={styles.vsText}>VS</Text>
          </View>
          
          <View className={styles.teamInfo}>
            <Text className={styles.teamName}>{awayTeam.name}</Text>
            <Text className={styles.teamScore} style={{ color: awayTeam.color }}>
              {awayTeam.score}
            </Text>
          </View>
        </View>
        
        <Text className={styles.matchMeta}>
          {currentMatch.tournament} · 第{currentMatch.period}/{currentMatch.totalPeriods}节
        </Text>
      </View>

      <View className={styles.statsSection}>
        <Text className={styles.sectionTitle}>球队数据对比</Text>
        
        {teamStats.map((stat, index) => (
          <View key={index} className={styles.statItem}>
            <View className={styles.statLabels}>
              <Text className={styles.statValue}>{stat.home}</Text>
              <Text className={styles.statName}>{stat.name}</Text>
              <Text className={styles.statValue}>{stat.away}</Text>
            </View>
            <View className={styles.statBar}>
              <View
                className={styles.homeBar}
                style={{ width: `${(stat.home / stat.total) * 100}%` }}
              />
              <View
                className={styles.awayBar}
                style={{ width: `${(stat.away / stat.total) * 100}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      <View className={styles.playersSection}>
        <View className={styles.rankTabs}>
          <View
            className={classnames(styles.rankTab, activeTab === 'goals' && styles.active)}
            onClick={() => setActiveTab('goals')}
          >
            <Text>射手榜</Text>
          </View>
          <View
            className={classnames(styles.rankTab, activeTab === 'assists' && styles.active)}
            onClick={() => setActiveTab('assists')}
          >
            <Text>助攻榜</Text>
          </View>
          <View
            className={classnames(styles.rankTab, activeTab === 'cards' && styles.active)}
            onClick={() => setActiveTab('cards')}
          >
            <Text>红黄牌</Text>
          </View>
        </View>

        <ScrollView scrollY className={styles.rankList}>
          {rankList.length === 0 ? (
            <View style={{ textAlign: 'center', padding: '40rpx 0' }}>
              <Text style={{ fontSize: '24rpx', color: '#64748B' }}>暂无数据</Text>
            </View>
          ) : (
            rankList.map((player, index) => (
              <View key={player.id} className={styles.rankItem}>
                <Text className={classnames(styles.rankNumber, index < 3 && styles.rankTop)}>
                  {index + 1}
                </Text>
                <View className={styles.playerInfo}>
                  <View className={styles.playerNumber} style={{ background: player.teamColor + '30' }}>
                    <Text style={{ color: player.teamColor }}>{player.number}</Text>
                  </View>
                  <View>
                    <Text className={styles.playerName}>{player.name}</Text>
                    <Text className={styles.teamName}>{player.teamName}</Text>
                  </View>
                </View>
                <Text className={styles.rankValue}>
                  {player.value}{(player as any).unit}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View className={styles.bottomActions}>
        <Button className={classnames(styles.actionBtn, styles.exportBtn)} onClick={handleExport}>
          📄 导出成绩单
        </Button>
        <Button className={classnames(styles.actionBtn, styles.confirmBtn)} onClick={handleConfirm}>
          ✓ 赛后确认
        </Button>
      </View>
    </ScrollView>
  );
};

export default StatisticsPage;
