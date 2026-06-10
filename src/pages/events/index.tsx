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

type GoalStep = 'selectScorer' | 'selectAssist' | null;

const EventsPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const addEvent = useMatchStore((state) => state.addEvent);
  const updatePlayerStat = useMatchStore((state) => state.updatePlayerStat);
  const addTimeout = useMatchStore((state) => state.addTimeout);
  const addScore = useMatchStore((state) => state.addScore);
  const pushSnapshot = useMatchStore((state) => state.pushSnapshot);

  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedAssistPlayerId, setSelectedAssistPlayerId] = useState<string | null>(null);
  const [goalStep, setGoalStep] = useState<GoalStep>(null);

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
    resetSelection();
  };

  const resetSelection = () => {
    setSelectedEventType(null);
    setSelectedPlayerId(null);
    setSelectedAssistPlayerId(null);
    setGoalStep(null);
  };

  const handleEventTypeSelect = (type: EventType) => {
    resetSelection();
    setSelectedEventType(type);
    
    if (type === 'goal') {
      setGoalStep('selectScorer');
    }
    
    if (type === 'timeout') {
      handleAddTimeout();
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    if (!selectedEventType) {
      Taro.showToast({ title: '请先选择事件类型', icon: 'none' });
      return;
    }
    
    if (selectedEventType === 'timeout') return;

    if (selectedEventType === 'goal' && goalStep === 'selectScorer') {
      setSelectedPlayerId(playerId);
      setGoalStep('selectAssist');
      return;
    }

    if (selectedEventType === 'goal' && goalStep === 'selectAssist') {
      if (playerId === selectedPlayerId) {
        Taro.showToast({ title: '助攻球员不能与进球球员相同', icon: 'none' });
        return;
      }
      setSelectedAssistPlayerId(playerId);
      return;
    }

    setSelectedPlayerId(playerId);
  };

  const handleSkipAssist = () => {
    setSelectedAssistPlayerId(null);
  };

  const handleAddTimeout = () => {
    const teamType = selectedTeam;
    const remaining = teamType === 'home' ? currentMatch.timeouts.home : currentMatch.timeouts.away;
    
    if (remaining <= 0) {
      Taro.showToast({ title: '暂停次数已用完', icon: 'none' });
      return;
    }

    pushSnapshot();
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
    
    Taro.showToast({ title: '已记录暂停', icon: 'success' });
    resetSelection();
  };

  const handleConfirm = () => {
    if (!selectedEventType) {
      Taro.showToast({ title: '请选择事件类型', icon: 'none' });
      return;
    }

    if (selectedEventType === 'timeout') return;

    if (!selectedPlayerId) {
      Taro.showToast({ title: '请选择球员', icon: 'none' });
      return;
    }

    const player = currentTeam.players.find(p => p.id === selectedPlayerId);
    if (!player) return;

    const team = currentTeam;
    const teamType = selectedTeam;
    let description = '';
    let playerStatUpdate: Partial<{ goals: number; yellowCards: number; redCards: number; assists: number }> = {};

    pushSnapshot();

    switch (selectedEventType) {
      case 'goal': {
        const assistPlayer = selectedAssistPlayerId
          ? currentTeam.players.find(p => p.id === selectedAssistPlayerId)
          : null;
        
        description = assistPlayer
          ? `${player.number}号 ${player.name} 进球（助攻：${assistPlayer.number}号 ${assistPlayer.name}）`
          : `${player.number}号 ${player.name} 进球`;
        
        playerStatUpdate = { goals: player.goals + 1 };
        addScore(teamType, 1);
        
        if (assistPlayer) {
          updatePlayerStat(team.id, assistPlayer.id, { assists: assistPlayer.assists + 1 });
        }

        const event: MatchEvent = {
          id: generateId(),
          type: 'goal',
          teamId: team.id,
          playerId: player.id,
          playerName: player.name,
          assistPlayerId: assistPlayer?.id,
          assistPlayerName: assistPlayer?.name,
          time: currentMatch.currentTime,
          period: currentMatch.period,
          description
        };
        addEvent(event);
        
        if (Object.keys(playerStatUpdate).length > 0) {
          updatePlayerStat(team.id, player.id, playerStatUpdate);
        }
        
        Taro.showToast({ title: '进球记录成功', icon: 'success' });
        resetSelection();
        return;
      }
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

    Taro.showToast({ title: '记录成功', icon: 'success' });
    resetSelection();
  };

  const getGoalStepHint = () => {
    if (goalStep === 'selectScorer') return '👉 请选择进球球员';
    if (goalStep === 'selectAssist') return '👉 请选择助攻球员（可选）';
    return '';
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
            <View className={styles.sectionTitleRow}>
              <Text className={styles.sectionTitle}>
                {selectedEventType === 'goal' ? getGoalStepHint() : '选择球员'}
              </Text>
            </View>
            <View className={styles.playersGrid}>
              {currentTeam.players.filter(p => p.isStarter).map((player) => {
                const isSelected = player.id === selectedPlayerId || player.id === selectedAssistPlayerId;
                const isScorer = player.id === selectedPlayerId;
                const isAssist = player.id === selectedAssistPlayerId;
                return (
                  <View
                    key={player.id}
                    className={classnames(
                      styles.playerChip,
                      isSelected && styles.playerChipActive,
                      isScorer && styles.playerChipScorer,
                      isAssist && styles.playerChipAssist
                    )}
                    onClick={() => handlePlayerSelect(player.id)}
                  >
                    <Text className={styles.playerNumber}>{player.number}</Text>
                    <Text className={styles.playerName}>{player.name}</Text>
                    {isScorer && <Text className={styles.playerTag}>进球</Text>}
                    {isAssist && <Text className={styles.playerTag}>助攻</Text>}
                  </View>
                );
              })}
            </View>

            {selectedEventType === 'goal' && goalStep === 'selectAssist' && (
              <View className={styles.assistActions}>
                <Button className={styles.skipAssistBtn} onClick={handleSkipAssist}>
                  无助攻，直接确认
                </Button>
              </View>
            )}
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
