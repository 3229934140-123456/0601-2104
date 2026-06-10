import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import ScoreBoard from '@/components/ScoreBoard';
import { useMatchStore } from '@/store/useMatchStore';
import { formatTime, generateId } from '@/utils/format';
import classnames from 'classnames';

const ScoreboardPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const startMatch = useMatchStore((state) => state.startMatch);
  const pauseMatch = useMatchStore((state) => state.pauseMatch);
  const resetMatch = useMatchStore((state) => state.resetMatch);
  const setTime = useMatchStore((state) => state.setTime);
  const addScore = useMatchStore((state) => state.addScore);
  const subtractScore = useMatchStore((state) => state.subtractScore);
  const nextPeriod = useMatchStore((state) => state.nextPeriod);
  const addEvent = useMatchStore((state) => state.addEvent);
  const undo = useMatchStore((state) => state.undo);
  const canUndo = useMatchStore((state) => state.canUndo);
  const finishMatch = useMatchStore((state) => state.finishMatch);
  const pushSnapshot = useMatchStore((state) => state.pushSnapshot);

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (currentMatch.isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          setTime(formatTime(newSeconds));
          
          const periodSeconds = currentMatch.periodDuration * 60;
          if (newSeconds >= periodSeconds) {
            pauseMatch();
            Taro.showToast({
              title: `第${currentMatch.period}节结束`,
              icon: 'success',
              duration: 2000
            });
            return periodSeconds;
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentMatch.isRunning, currentMatch.period, currentMatch.periodDuration]);

  const handleStart = () => {
    startMatch();
    Taro.vibrateShort({ type: 'light' });
  };

  const handlePause = () => {
    pauseMatch();
    Taro.vibrateShort({ type: 'light' });
  };

  const handleReset = () => {
    Taro.showModal({
      title: '确认重置',
      content: '确定要重置比赛吗？所有数据将被清除。',
      success: (res) => {
        if (res.confirm) {
          resetMatch();
          setSeconds(0);
        }
      }
    });
  };

  const handleAddScore = (teamType: 'home' | 'away') => {
    pushSnapshot();
    addScore(teamType, 1);
    
    const team = teamType === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam;
    const event = {
      id: generateId(),
      type: 'goal' as const,
      teamId: team.id,
      time: currentMatch.currentTime,
      period: currentMatch.period,
      description: `${team.name} 得分`
    };
    addEvent(event);
    
    Taro.vibrateShort({ type: 'medium' });
  };

  const handleSubtractScore = (teamType: 'home' | 'away') => {
    pushSnapshot();
    subtractScore(teamType, 1);
    
    const team = teamType === 'home' ? currentMatch.homeTeam : currentMatch.awayTeam;
    const event = {
      id: generateId(),
      type: 'period' as const,
      teamId: team.id,
      time: currentMatch.currentTime,
      period: currentMatch.period,
      description: `${team.name} 扣分`
    };
    addEvent(event);
    
    Taro.vibrateShort({ type: 'light' });
  };

  const handleNextPeriod = () => {
    if (currentMatch.period >= currentMatch.totalPeriods) {
      Taro.showToast({
        title: '已是最后一节',
        icon: 'none'
      });
      return;
    }
    
    Taro.showModal({
      title: '换节确认',
      content: `确定要开始第${currentMatch.period + 1}节吗？`,
      success: (res) => {
        if (res.confirm) {
          nextPeriod();
          setSeconds(0);
          
          const event = {
            id: generateId(),
            type: 'period' as const,
            teamId: '',
            time: '00:00',
            period: currentMatch.period + 1,
            description: `第${currentMatch.period + 1}节开始`
          };
          addEvent(event);
          
          Taro.showToast({
            title: `第${currentMatch.period + 1}节开始`,
            icon: 'success'
          });
        }
      }
    });
  };

  const handleUndo = () => {
    if (!canUndo()) {
      Taro.showToast({
        title: '没有可撤销的操作',
        icon: 'none'
      });
      return;
    }
    undo();
    Taro.showToast({
      title: '已撤销',
      icon: 'success'
    });
  };

  const handleFinish = () => {
    Taro.showModal({
      title: '结束比赛',
      content: '确定要结束这场比赛吗？',
      success: (res) => {
        if (res.confirm) {
          finishMatch();
          pauseMatch();
          Taro.switchTab({
            url: '/pages/statistics/index'
          });
        }
      }
    });
  };

  const navigateTo = (url: string) => {
    Taro.navigateTo({ url });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.scoreSection}>
        <ScoreBoard match={currentMatch} />
      </View>

      <View className={styles.controlSection}>
        <View className={styles.timerControl}>
          {!currentMatch.isRunning ? (
            <Button className={classnames(styles.controlBtn, styles.startBtn)} onClick={handleStart}>
              {currentMatch.currentTime === '00:00' && currentMatch.period === 1 ? '开始比赛' : '继续'}
            </Button>
          ) : (
            <Button className={classnames(styles.controlBtn, styles.pauseBtn)} onClick={handlePause}>
              暂停
            </Button>
          )}
          <Button className={classnames(styles.controlBtn, styles.resetBtn)} onClick={handleReset}>
            重置
          </Button>
        </View>

        <View className={styles.scoreControls}>
          <View className={styles.scoreControlGroup}>
            <Text className={styles.teamLabel} style={{ color: currentMatch.homeTeam.color }}>
              {currentMatch.homeTeam.name}
            </Text>
            <View className={styles.scoreButtons}>
              <Button 
                className={classnames(styles.scoreBtn, styles.minusBtn)} 
                onClick={() => handleSubtractScore('home')}
              >
                -
              </Button>
              <Button 
                className={classnames(styles.scoreBtn, styles.plusBtn)} 
                onClick={() => handleAddScore('home')}
              >
                +
              </Button>
            </View>
          </View>

          <View className={styles.scoreControlGroup}>
            <Text className={styles.teamLabel} style={{ color: currentMatch.awayTeam.color }}>
              {currentMatch.awayTeam.name}
            </Text>
            <View className={styles.scoreButtons}>
              <Button 
                className={classnames(styles.scoreBtn, styles.minusBtn)} 
                onClick={() => handleSubtractScore('away')}
              >
                -
              </Button>
              <Button 
                className={classnames(styles.scoreBtn, styles.plusBtn)} 
                onClick={() => handleAddScore('away')}
              >
                +
              </Button>
            </View>
          </View>
        </View>

        <View className={styles.periodControl}>
          <Text className={styles.periodText}>
            第 {currentMatch.period} / {currentMatch.totalPeriods} 节
          </Text>
          <Button className={styles.nextPeriodBtn} onClick={handleNextPeriod}>
            下一节 →
          </Button>
        </View>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionCard} onClick={() => navigateTo('/pages/events/index')}>
          <Text className={styles.actionIcon}>📝</Text>
          <Text className={styles.actionLabel}>事件记录</Text>
          <Text className={styles.actionDesc}>进球/犯规/换人</Text>
        </View>

        <View className={styles.actionCard} onClick={() => navigateTo('/pages/player-list/index')}>
          <Text className={styles.actionIcon}>👥</Text>
          <Text className={styles.actionLabel}>球员名单</Text>
          <Text className={styles.actionDesc}>首发/替补管理</Text>
        </View>

        <View className={styles.actionCard} onClick={() => navigateTo('/pages/dispute/index')}>
          <Text className={styles.actionIcon}>📸</Text>
          <Text className={styles.actionLabel}>争议判罚</Text>
          <Text className={styles.actionDesc}>拍照留证</Text>
        </View>

        <View className={styles.actionCard} onClick={() => navigateTo('/pages/statistics/index')}>
          <Text className={styles.actionIcon}>📊</Text>
          <Text className={styles.actionLabel}>技术统计</Text>
          <Text className={styles.actionDesc}>查看数据</Text>
        </View>
      </View>

      <View className={styles.bottomActions}>
        <Button className={classnames(styles.bottomBtn, styles.undoBtn)} onClick={handleUndo}>
          ↩ 撤销
        </Button>
        <Button className={classnames(styles.bottomBtn, styles.finishBtn)} onClick={handleFinish}>
          结束比赛
        </Button>
      </View>
    </ScrollView>
  );
};

export default ScoreboardPage;
