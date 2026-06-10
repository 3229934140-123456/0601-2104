import React, { useMemo, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import classnames from 'classnames';
import type { Signature } from '@/types/match';

const ConfirmPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const finishMatch = useMatchStore((state) => state.finishMatch);
  const setConfirmation = useMatchStore((state) => state.setConfirmation);
  const confirmation = currentMatch.confirmation;

  useEffect(() => {
    if (!confirmation) {
      setConfirmation({
        homeCaptain: { name: '', time: '', signed: false },
        awayCaptain: { name: '', time: '', signed: false },
        referee: { name: '张裁判', time: '', confirmed: false }
      });
    }
  }, [confirmation, setConfirmation]);

  const homeSignature: Signature = confirmation?.homeCaptain || { name: '', time: '', signed: false };
  const awaySignature: Signature = confirmation?.awayCaptain || { name: '', time: '', signed: false };
  const refereeInfo = confirmation?.referee || { name: '张裁判', time: '', confirmed: false };

  const eventCount = useMemo(() => {
    const goals = currentMatch.events.filter(e => e.type === 'goal').length;
    const yellows = currentMatch.events.filter(e => e.type === 'yellowCard').length;
    const reds = currentMatch.events.filter(e => e.type === 'redCard').length;
    const subs = currentMatch.events.filter(e => e.type === 'substitution').length;
    return { goals, yellows, reds, subs };
  }, [currentMatch.events]);

  const allSigned = homeSignature.signed && awaySignature.signed && refereeInfo.confirmed;

  const handleSign = (team: 'home' | 'away') => {
    Taro.showModal({
      title: '电子签名确认',
      editable: true,
      placeholderText: '请输入队长姓名',
      success: (res) => {
        if (res.confirm && res.content) {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          const signature: Signature = {
            name: res.content,
            time: timeStr,
            signed: true
          };

          if (team === 'home') {
            setConfirmation({ homeCaptain: signature });
          } else {
            setConfirmation({ awayCaptain: signature });
          }

          Taro.showToast({
            title: '签名成功',
            icon: 'success'
          });

          console.log(`[Confirm] ${team === 'home' ? '主队' : '客队'}队长签名:`, res.content);
        }
      }
    });
  };

  const handleConfirmReferee = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setConfirmation({
      referee: {
        ...refereeInfo,
        time: timeStr,
        confirmed: true
      }
    });
    Taro.showToast({
      title: '裁判已确认',
      icon: 'success'
    });
  };

  const handleConfirm = () => {
    if (!allSigned) {
      Taro.showToast({
        title: '请双方队长签字和裁判确认',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '确认提交',
      content: '确认比赛结果无误并提交？提交后将同步至赛事管理员。',
      success: (res) => {
        if (res.confirm) {
          finishMatch();
          
          console.log('[Confirm] 比赛确认提交:', {
            matchId: currentMatch.id,
            homeTeam: currentMatch.homeTeam.name,
            awayTeam: currentMatch.awayTeam.name,
            score: `${currentMatch.homeTeam.score}-${currentMatch.awayTeam.score}`,
            homeCaptain: homeSignature.name,
            awayCaptain: awaySignature.name,
            referee: refereeInfo.name,
            eventsCount: currentMatch.events.length
          });

          Taro.showToast({
            title: '已同步至管理员',
            icon: 'success',
            duration: 2000
          });

          setTimeout(() => {
            Taro.navigateTo({
              url: '/pages/score-report/index'
            });
          }, 2000);
        }
      }
    });
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.page}>
      <View className={styles.summaryCard}>
        <Text className={styles.matchTitle}>{currentMatch.tournament}</Text>
        
        <View className={styles.scoreRow}>
          <View className={styles.team}>
            <Text className={styles.teamName}>{currentMatch.homeTeam.name}</Text>
            <Text className={styles.teamScore} style={{ color: currentMatch.homeTeam.color }}>
              {currentMatch.homeTeam.score}
            </Text>
          </View>
          
          <View className={styles.vs}>
            <Text className={styles.vsText}>VS</Text>
          </View>
          
          <View className={styles.team}>
            <Text className={styles.teamName}>{currentMatch.awayTeam.name}</Text>
            <Text className={styles.teamScore} style={{ color: currentMatch.awayTeam.color }}>
              {currentMatch.awayTeam.score}
            </Text>
          </View>
        </View>

        <Text className={styles.matchMeta}>
          {currentMatch.venue} · 全场 {currentMatch.currentTime}
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>比赛数据概览</Text>
        <View className={styles.statsSummary}>
          <View className={styles.statItem}>
            <Text className={styles.statLabel}>总进球</Text>
            <Text className={styles.statValue}>{eventCount.goals}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statLabel}>黄牌</Text>
            <Text className={styles.statValue}>{eventCount.yellows}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statLabel}>红牌</Text>
            <Text className={styles.statValue}>{eventCount.reds}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statLabel}>换人</Text>
            <Text className={styles.statValue}>{eventCount.subs}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>主队队长确认</Text>
        <View className={classnames(styles.signatureBox, homeSignature.signed && styles.signed)}>
          {!homeSignature.signed ? (
            <View className={styles.signPlaceholder}>
              <Text className={styles.signIcon}>✍️</Text>
              <Text className={styles.signText}>点击下方按钮进行电子签名</Text>
            </View>
          ) : (
            <View className={styles.signatureContent}>
              <Text className={styles.signName}>✓ {homeSignature.name}</Text>
              <Text className={styles.signTime}>签名时间：{homeSignature.time}</Text>
            </View>
          )}
        </View>
        <Button
          className={classnames(styles.signBtn, homeSignature.signed && styles.disabled)}
          onClick={() => handleSign('home')}
          disabled={homeSignature.signed}
        >
          {homeSignature.signed ? '已签名' : '主队队长签名'}
        </Button>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>客队队长确认</Text>
        <View className={classnames(styles.signatureBox, awaySignature.signed && styles.signed)}>
          {!awaySignature.signed ? (
            <View className={styles.signPlaceholder}>
              <Text className={styles.signIcon}>✍️</Text>
              <Text className={styles.signText}>点击下方按钮进行电子签名</Text>
            </View>
          ) : (
            <View className={styles.signatureContent}>
              <Text className={styles.signName}>✓ {awaySignature.name}</Text>
              <Text className={styles.signTime}>签名时间：{awaySignature.time}</Text>
            </View>
          )}
        </View>
        <Button
          className={classnames(styles.signBtn, awaySignature.signed && styles.disabled)}
          onClick={() => handleSign('away')}
          disabled={awaySignature.signed}
        >
          {awaySignature.signed ? '已签名' : '客队队长签名'}
        </Button>

        <View className={styles.refereeSection}>
          <Text className={styles.sectionTitle}>裁判信息</Text>
          <View className={classnames(styles.refereeInfo, refereeInfo.confirmed && styles.signed)}>
            <View className={styles.refereeAvatar}>
              <Text className={styles.avatarText}>裁</Text>
            </View>
            <View className={styles.refereeDetail}>
              <Text className={styles.refereeName}>{refereeInfo.name}</Text>
              <Text className={styles.refereeRole}>
                {refereeInfo.confirmed ? `已确认 · ${refereeInfo.time}` : '主裁判 · 待确认'}
              </Text>
            </View>
            {!refereeInfo.confirmed && (
              <Button
                className={styles.refereeConfirmBtn}
                onClick={handleConfirmReferee}
              >
                确认
              </Button>
            )}
            {refereeInfo.confirmed && (
              <Text className={styles.checkIcon}>✓</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.bottomActions}>
        <Button className={classnames(styles.actionBtn, styles.cancelBtn)} onClick={handleCancel}>
          返回
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.confirmBtn, !allSigned && styles.disabled)}
          onClick={handleConfirm}
          disabled={!allSigned}
        >
          确认提交
        </Button>
      </View>
    </View>
  );
};

export default ConfirmPage;
