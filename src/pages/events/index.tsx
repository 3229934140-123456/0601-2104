import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import EventTimeline from '@/components/EventTimeline';
import { useMatchStore } from '@/store/useMatchStore';
import { generateId } from '@/utils/format';
import type { MatchEvent } from '@/types/match';
import classnames from 'classnames';

type EventType = 'goal' | 'yellowCard' | 'redCard' | 'substitution' | 'timeout';

const EventsPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const addEvent = useMatchStore((state) => state.addEvent);
  const updatePlayerStat = useMatchStore((state) => state.updatePlayerStat);
  const addTimeout = useMatchStore((state) => state.addTimeout);
  const addScore = useMatchStore((state) => state.addScore);

  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const currentTeam = useMemo(() => {
    return selectedTeam === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam;
  }, [selectedTeam, currentMatch]);

  const eventTypes = [
    { type: 'goal' as EventType, icon: '⚽', label: '进球' },
    { type: 'yellowCard' as EventType, icon: '🟨', label: '黄牌' },
    { type: 'redCard' as EventType, icon: '🟥', label: '红牌' },
    { type: 'substitution' as EventType, icon: '🔄', label: '换人' },
    { type: 'timeout' as EventType, icon: '⏸️', label: '暂停' }
  ];

  const getEventTypeClass = (type: EventType) => {
    const classMap: Record<EventType, string> = {
      goal: styles.typeGoal,
      yellowCard: styles.typeYellow,
      redCard: styles.typeRed,
      substitution: styles.typeSub,
      timeout: styles.typeTimeout
    };
    return classMap[type];
  };

  const handleTeamChange = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setSelectedPlayerId(null);
  };

  const handleEventTypeSelect = (type: EventType) => {
    setSelectedEventType(type);
    
    if (type === 'timeout') {
      handleAddTimeout();
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!selectedEventType) {
      Taro.showToast({
        title: '请先选择事件类型',
        icon: 'none'
      });
      return;
    }
    
    if (selectedEventType === 'timeout') {
      return;
    }
    
    setSelectedPlayerId(playerId);
  };

  const handleAddTimeout = () => {
    const teamType = selectedTeam;
    const remaining = teamType === 'home' ? currentMatch.timeouts.home : currentMatch.timeouts.away;
    
    if (remaining <= 0) {
      Taro.showToast({
        title: '暂停次数已用完',
        icon: 'none'
      });
      return;
    }

    const team = teamType === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam;
    const event: MatchEvent = {
      id: generateId(),
      type: 'timeout',
      teamId: team.id,
      time: currentMatch.currentTime,
      period: currentMatch.period,
      description: `${team.name} 请求暂停`
    };

    addEvent(event);
    addTimeout(teamType);
    
    Taro.showToast({
      title: '已记录暂停',
      icon: 'success'
    });
    setSelectedEventType(null);
  };

  const handleConfirm = () => {
    if (!selectedEventType) {
      Taro.showToast({
        title: '请选择事件类型',
        icon: 'none'
      });
      return;
    }

    if (selectedEventType === 'timeout') {
      return;
    }

    if (!selectedPlayerId) {
      Taro.showToast({
        title: '请选择球员',
        icon: 'none'
      });
      return;
    }

    const player = currentTeam.players.find(p => p.id === selectedPlayerId);
    if (!player) return;

    const team = currentTeam;
    const teamType = selectedTeam;
    let description = '';
    let playerStatUpdate: any = {};

    switch (selectedEventType) {
      case 'goal':
        description = `${player.number}号 ${player.name} 进球`;
        playerStatUpdate = { goals: player.goals + 1 };
        addScore(teamType, 1);
        break;
      case 'yellowCard':
        description = `${player.number}号 ${player.name} 黄牌警告`;
        playerStatUpdate = { yellowCards: player.yellowCards + 1 };
        break;
      case 'redCard':
        description = `${player.number}号 ${player.name} 红牌罚下`;
        playerStatUpdate = { redCards: player.redCards + 1 };
        break;
      case 'substitution':
        description = `${player.number}号 ${player.name} 被替换上场`;
        break;
      default:
        description = player.name;
    }

    const event: MatchEvent = {
      id: generateId(),
      type: selectedEventType,
      teamId: team.id,
      playerId: player.id,
      playerName: player.name,
      time: currentMatch.currentTime,
      period: currentMatch.period,
      description
    };

    addEvent(event);
    
    if (Object.keys(playerStatUpdate).length > 0) {
      updatePlayerStat(team.id, player.id, playerStatUpdate);
    }

    Taro.showToast({
      title: '记录成功',
      icon: 'success'
    });

    setSelectedEventType(null);
    setSelectedPlayerId(null);
  };

  return (
    <View className={styles.page}>
      <View className={styles.teamTabs}>
        <View
          className={classnames(styles.teamTab, selectedTeam === 'home' ? styles.tabActive : styles.tabInactive)}
          onClick={() => handleTeamChange('home')}
        >
          <Text className={styles.tabName}>{currentMatch.homeTeam.name}</Text>
        </View>
        <View
          className={classnames(styles.teamTab, selectedTeam === 'away' ? styles.tabActive : styles.tabInactive)}
          onClick={() => handleTeamChange('away')}
        >
          <Text className={styles.tabName}>{currentMatch.awayTeam.name}</Text>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.eventTypes}>
          <Text className={styles.sectionTitle}>选择事件类型</Text>
          <View className={styles.typeGrid}>
            {eventTypes.map((item) => (
              <View
                key={item.type}
                className={classnames(
                  styles.typeItem,
                  selectedEventType === item.type ? getEventTypeClass(item.type) : ''
                )}
                onClick={() => handleEventTypeSelect(item.type)}
              >
                <Text className={styles.typeIcon}>{item.icon}</Text>
                <Text className={styles.typeLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {selectedEventType && selectedEventType !== 'timeout' && (
          <View className={styles.playersSection}>
            <Text className={styles.sectionTitle}>选择球员</Text>
            <View className={styles.playersGrid}>
              {currentTeam.players.filter(p => p.isStarter).map((player) => (
                <View
                  key={player.id}
                  className={classnames(
                    styles.playerChip,
                    selectedPlayerId === player.id && styles.playerChipActive
                  )}
                  onClick={() => handlePlayerSelect(player.id)}
                >
                  <Text className={styles.playerNumber}>{player.number}</Text>
                  <Text className={styles.playerName}>{player.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className={styles.timelineSection}>
          <View className={styles.timelineHeader}>
            <Text className={styles.sectionTitle}>事件时间线</Text>
            <Text className={styles.eventCount}>共 {currentMatch.events.length} 条</Text>
          </View>
          <EventTimeline events={currentMatch.events} title="" />
        </View>
      </ScrollView>

      {selectedEventType && selectedEventType !== 'timeout' && (
        <Button
          className={styles.confirmBtn}
          onClick={handleConfirm}
          disabled={!selectedPlayerId}
        >
          确认记录
        </Button>
      )}
    </View>
  );
};

export default EventsPage;
