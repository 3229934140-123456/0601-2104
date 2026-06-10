import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { matchList, tournaments, venues } from '@/data/mockData';
import { getStatusText } from '@/utils/format';
import { useMatchStore } from '@/store/useMatchStore';
import type { Match } from '@/types/match';
import classnames from 'classnames';

const SchedulePage: React.FC = () => {
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const setCurrentMatch = useMatchStore((state) => state.setCurrentMatch);

  const tournamentOptions = useMemo(() => [
    { label: '全部赛事', value: '' },
    ...tournaments.map(t => ({ label: t.name, value: t.id }))
  ], []);

  const venueOptions = useMemo(() => [
    { label: '全部场地', value: '' },
    ...venues.map(v => ({ label: v.name, value: v.id }))
  ], []);

  const filteredMatches = useMemo(() => {
    return matchList.filter(match => {
      const tournamentMatch = !selectedTournament || match.tournament === tournaments.find(t => t.id === selectedTournament)?.name;
      const venueMatch = !selectedVenue || match.venue === venues.find(v => v.id === selectedVenue)?.name;
      return tournamentMatch && venueMatch;
    });
  }, [selectedTournament, selectedVenue]);

  const handleMatchClick = (match: Match) => {
    const fullMatch = { ...match, players: [] };
    if (match.homeTeam.players.length === 0) {
      const fullMatchData = matchList.find(m => m.id === match.id);
      if (fullMatchData) {
        setCurrentMatch(fullMatchData);
      }
    } else {
      setCurrentMatch(fullMatch);
    }
    
    Taro.switchTab({
      url: '/pages/scoreboard/index'
    });
  };

  const getStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      upcoming: styles.statusUpcoming,
      ongoing: styles.statusOngoing,
      finished: styles.statusFinished
    };
    return classMap[status] || styles.statusUpcoming;
  };

  const tournamentIndex = tournamentOptions.findIndex(t => t.value === selectedTournament);
  const venueIndex = venueOptions.findIndex(v => v.value === selectedVenue);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.filterBar}>
        <Picker
          mode='selector'
          range={tournamentOptions.map(t => t.label)}
          value={tournamentIndex}
          onChange={(e) => {
            const idx = Number(e.detail.value);
            setSelectedTournament(tournamentOptions[idx].value);
          }}
        >
          <View className={styles.filterItem}>
            <Text className={styles.filterText}>
              {tournamentOptions[tournamentIndex]?.label || '选择赛事'}
            </Text>
            <Text className={styles.filterArrow}>▼</Text>
          </View>
        </Picker>

        <Picker
          mode='selector'
          range={venueOptions.map(v => v.label)}
          value={venueIndex}
          onChange={(e) => {
            const idx = Number(e.detail.value);
            setSelectedVenue(venueOptions[idx].value);
          }}
        >
          <View className={styles.filterItem}>
            <Text className={styles.filterText}>
              {venueOptions[venueIndex]?.label || '选择场地'}
            </Text>
            <Text className={styles.filterArrow}>▼</Text>
          </View>
        </Picker>
      </View>

      <Text className={styles.sectionTitle}>今日赛程</Text>

      {filteredMatches.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📅</Text>
          <Text className={styles.emptyText}>暂无比赛</Text>
        </View>
      ) : (
        <View className={styles.matchList}>
          {filteredMatches.map((match) => (
            <View
              key={match.id}
              className={styles.matchCard}
              onClick={() => handleMatchClick(match)}
            >
              <View className={styles.cardHeader}>
                <View className={classnames(styles.statusBadge, getStatusClass(match.status))}>
                  <Text>{getStatusText(match.status)}</Text>
                </View>
                <Text className={styles.matchTime}>{match.date} {match.time}</Text>
              </View>

              <View className={styles.teams}>
                <View className={styles.team}>
                  <View className={styles.teamColor} style={{ background: match.homeTeam.color }} />
                  <Text className={styles.teamName}>{match.homeTeam.name}</Text>
                </View>

                <View className={styles.score}>
                  <Text className={styles.scoreText}>
                    {match.status === 'upcoming' ? 'VS' : `${match.homeTeam.score} - ${match.awayTeam.score}`}
                  </Text>
                </View>

                <View className={styles.team}>
                  <View className={styles.teamColor} style={{ background: match.awayTeam.color }} />
                  <Text className={styles.teamName}>{match.awayTeam.name}</Text>
                </View>
              </View>

              <View className={styles.cardFooter}>
                <Text className={styles.venueIcon}>📍</Text>
                <Text className={styles.venueName}>{match.venue}</Text>
                <Text className={styles.arrow}>→</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default SchedulePage;
