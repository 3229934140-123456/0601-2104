import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Picker, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import { tournaments, matchList } from '@/data/mockData';
import classnames from 'classnames';

const ReportHistoryPage: React.FC = () => {
  const finishedMatches = useMatchStore((state) => state.finishedMatches);
  const setCurrentMatch = useMatchStore((state) => state.setCurrentMatch);

  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const tournamentOptions = useMemo(() => [
    { label: '全部赛事', value: '' },
    ...tournaments.map(t => ({ label: t.name, value: t.id }))
  ], []);

  const dateOptions = useMemo(() => {
    const dates = new Set<string>();
    finishedMatches.forEach(m => dates.add(m.date));
    matchList.forEach(m => m.status === 'finished' && dates.add(m.date));
    return [
      { label: '全部日期', value: '' },
      ...Array.from(dates).sort().map(d => ({ label: d, value: d }))
    ];
  }, [finishedMatches]);

  const filteredMatches = useMemo(() => {
    return finishedMatches.filter(match => {
      const tournamentMatch = !selectedTournament || match.tournament === tournaments.find(t => t.id === selectedTournament)?.name;
      const dateMatch = !selectedDate || match.date === selectedDate;
      return tournamentMatch && dateMatch;
    }).sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });
  }, [finishedMatches, selectedTournament, selectedDate, tournaments]);

  const handleViewReport = (matchId: string) => {
    const match = finishedMatches.find(m => m.id === matchId);
    if (match) {
      setCurrentMatch(match);
      Taro.navigateTo({
        url: '/pages/score-report/index'
      });
    }
  };

  const tournamentIndex = tournamentOptions.findIndex(t => t.value === selectedTournament);
  const dateIndex = dateOptions.findIndex(d => d.value === selectedDate);

  return (
    <View className={styles.page}>
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
          range={dateOptions.map(d => d.label)}
          value={dateIndex}
          onChange={(e) => {
            const idx = Number(e.detail.value);
            setSelectedDate(dateOptions[idx].value);
          }}
        >
          <View className={styles.filterItem}>
            <Text className={styles.filterText}>
              {dateOptions[dateIndex]?.label || '选择日期'}
            </Text>
            <Text className={styles.filterArrow}>▼</Text>
          </View>
        </Picker>
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {filteredMatches.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>
              暂无已完成的比赛记录{'\n'}
              完成比赛并确认后，成绩单将显示在这里
            </Text>
          </View>
        ) : (
          filteredMatches.map((match) => (
            <View
              key={match.id}
              className={styles.matchCard}
              onClick={() => handleViewReport(match.id)}
            >
              <View className={styles.matchHeader}>
                <View className={styles.matchMeta}>
                  <Text className={styles.tournament}>{match.tournament}</Text>
                  <Text className={styles.info}>
                    {match.venue} · {match.date} {match.time}
                  </Text>
                </View>
                <View className={styles.statusBadge}>
                  <Text>已完成</Text>
                </View>
              </View>

              <View className={styles.scoreRow}>
                <View className={styles.team}>
                  <Text className={styles.teamName}>{match.homeTeam.name}</Text>
                  <Text className={styles.teamScore} style={{ color: match.homeTeam.color }}>
                    {match.homeTeam.score}
                  </Text>
                </View>
                <View className={styles.vs}>
                  <Text className={styles.vsText}>VS</Text>
                </View>
                <View className={styles.team}>
                  <Text className={styles.teamName}>{match.awayTeam.name}</Text>
                  <Text className={styles.teamScore} style={{ color: match.awayTeam.color }}>
                    {match.awayTeam.score}
                  </Text>
                </View>
              </View>

              <View className={styles.matchFooter}>
                <View className={styles.footerInfo}>
                  <Text className={styles.infoItem}>
                    <Text className={styles.dot} />
                    {match.events.length} 条事件
                  </Text>
                  {match.confirmation?.confirmedAt && (
                    <Text className={styles.infoItem}>
                      <Text className={styles.dot} />
                      确认于 {match.confirmation.confirmedAt.split(' ')[1]}
                    </Text>
                  )}
                </View>
                <Button
                  className={styles.viewBtn}
                  onClick={(e) => { e.stopPropagation(); handleViewReport(match.id); }}
                >
                  查看成绩单
                </Button>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default ReportHistoryPage;
