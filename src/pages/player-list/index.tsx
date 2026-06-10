import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import classnames from 'classnames';

const PlayerListPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const setStarter = useMatchStore((state) => state.setStarter);

  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');

  const currentTeam = useMemo(() => {
    return selectedTeam === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam;
  }, [selectedTeam, currentMatch]);

  const starters = useMemo(() => {
    return currentTeam.players.filter(p => p.isStarter);
  }, [currentTeam]);

  const substitutes = useMemo(() => {
    return currentTeam.players.filter(p => !p.isStarter);
  }, [currentTeam]);

  const handleToggleStarter = (playerId: string, isStarter: boolean) => {
    if (isStarter && starters.length <= 1) {
      Taro.showToast({
        title: '至少保留1名首发',
        icon: 'none'
      });
      return;
    }

    if (!isStarter && starters.length >= 11) {
      Taro.showToast({
        title: '首发最多11人',
        icon: 'none'
      });
      return;
    }

    setStarter(currentTeam.id, playerId, !isStarter);
    
    Taro.vibrateShort({ type: 'light' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.teamTabs}>
        <View
          className={classnames(styles.teamTab, selectedTeam === 'home' ? styles.tabActive : styles.tabInactive)}
          onClick={() => setSelectedTeam('home')}
        >
          <Text className={styles.tabName}>{currentMatch.homeTeam.name}</Text>
        </View>
        <View
          className={classnames(styles.teamTab, selectedTeam === 'away' ? styles.tabActive : styles.tabInactive)}
          onClick={() => setSelectedTeam('away')}
        >
          <Text className={styles.tabName}>{currentMatch.awayTeam.name}</Text>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>首发阵容</Text>
          <Text className={styles.playerCount}>{starters.length} 人</Text>
        </View>

        <View className={styles.playerList}>
          {starters.map((player) => (
            <View key={player.id} className={styles.playerCard}>
              <View className={classnames(styles.playerNumber, styles.starterBadge)}>
                <Text className={styles.numberText}>{player.number}</Text>
              </View>
              
              <View className={styles.playerInfo}>
                <Text className={styles.playerName}>{player.name}</Text>
                <Text className={styles.playerPosition}>{player.position}</Text>
              </View>

              <View className={styles.playerStats}>
                {player.goals > 0 && (
                  <View className={classnames(styles.statBadge, styles.goalBadge)}>
                    <Text>⚽ {player.goals}</Text>
                  </View>
                )}
                {player.yellowCards > 0 && (
                  <View className={classnames(styles.statBadge, styles.yellowBadge)}>
                    <Text>🟨 {player.yellowCards}</Text>
                  </View>
                )}
                {player.redCards > 0 && (
                  <View className={classnames(styles.statBadge, styles.redBadge)}>
                    <Text>🟥 {player.redCards}</Text>
                  </View>
                )}
              </View>

              <View className={styles.starterToggle}>
                <View
                  className={classnames(styles.switch, player.isStarter && styles.active)}
                  onClick={() => handleToggleStarter(player.id, player.isStarter)}
                >
                  <View className={styles.switchDot} />
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.substituteSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>替补球员</Text>
            <Text className={styles.playerCount}>{substitutes.length} 人</Text>
          </View>

          <View className={styles.playerList}>
            {substitutes.map((player) => (
              <View key={player.id} className={styles.playerCard}>
                <View className={styles.playerNumber}>
                  <Text className={styles.numberText}>{player.number}</Text>
                </View>
                
                <View className={styles.playerInfo}>
                  <Text className={styles.playerName}>{player.name}</Text>
                  <Text className={styles.playerPosition}>{player.position}</Text>
                </View>

                <View className={styles.playerStats}>
                  {player.goals > 0 && (
                    <View className={classnames(styles.statBadge, styles.goalBadge)}>
                      <Text>⚽ {player.goals}</Text>
                    </View>
                  )}
                  {player.yellowCards > 0 && (
                    <View className={classnames(styles.statBadge, styles.yellowBadge)}>
                      <Text>🟨 {player.yellowCards}</Text>
                    </View>
                  )}
                  {player.redCards > 0 && (
                    <View className={classnames(styles.statBadge, styles.redBadge)}>
                      <Text>🟥 {player.redCards}</Text>
                    </View>
                  )}
                </View>

                <View className={styles.starterToggle}>
                  <View
                    className={classnames(styles.switch, player.isStarter && styles.active)}
                    onClick={() => handleToggleStarter(player.id, player.isStarter)}
                  >
                    <View className={styles.switchDot} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlayerListPage;
