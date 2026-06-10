import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { Match } from '@/types/match';

interface ScoreBoardProps {
  match: Match;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ match }) => {
  const { homeTeam, awayTeam, period, totalPeriods, currentTime, timeouts, tournament, venue } = match;

  const renderTimeoutDots = (count: number, max: number) => {
    return Array.from({ length: max }, (_, i) => (
      <View
        key={i}
        className={`${styles.dot} ${i < count ? styles.active : ''}`}
      />
    ));
  };

  return (
    <View className={styles.scoreBoard}>
      <View className={styles.header}>
        <Text className={styles.tournamentName}>{tournament}</Text>
        <Text className={styles.venue}>{venue}</Text>
      </View>

      <View className={styles.teams}>
        <View className={styles.team}>
          <View className={styles.teamColor} style={{ background: homeTeam.color }} />
          <Text className={styles.teamName}>{homeTeam.name}</Text>
        </View>

        <View className={styles.score}>
          <Text className={styles.scoreValue}>{homeTeam.score}</Text>
          <Text className={styles.vs}>VS</Text>
          <Text className={styles.scoreValue}>{awayTeam.score}</Text>
        </View>

        <View className={styles.team}>
          <View className={styles.teamColor} style={{ background: awayTeam.color }} />
          <Text className={styles.teamName}>{awayTeam.name}</Text>
        </View>
      </View>

      <View className={styles.meta}>
        <Text className={styles.periodInfo}>第{period}/{totalPeriods}节</Text>
        <Text className={styles.timeInfo}>{currentTime}</Text>
      </View>

      <View className={styles.timeouts}>
        <View className={styles.timeoutBox}>
          <Text className={styles.label}>暂停</Text>
          <View className={styles.dots}>
            {renderTimeoutDots(timeouts.home, 3)}
          </View>
        </View>
        <View className={styles.timeoutBox}>
          <View className={styles.dots}>
            {renderTimeoutDots(timeouts.away, 3)}
          </View>
          <Text className={styles.label}>暂停</Text>
        </View>
      </View>
    </View>
  );
};

export default ScoreBoard;
