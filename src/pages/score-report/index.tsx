import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import { getEventLabel, getStatusText, getEventColor } from '@/utils/format';
import classnames from 'classnames';

const ScoreReportPage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const { homeTeam, awayTeam, events, confirmation } = currentMatch;

  const stats = useMemo(() => {
    const homeGoals = homeTeam.players.reduce((s, p) => s + p.goals, 0);
    const awayGoals = awayTeam.players.reduce((s, p) => s + p.goals, 0);
    const homeYellow = homeTeam.players.reduce((s, p) => s + p.yellowCards, 0);
    const awayYellow = awayTeam.players.reduce((s, p) => s + p.yellowCards, 0);
    const homeRed = homeTeam.players.reduce((s, p) => s + p.redCards, 0);
    const awayRed = awayTeam.players.reduce((s, p) => s + p.redCards, 0);
    const homeAssists = homeTeam.players.reduce((s, p) => s + p.assists, 0);
    const awayAssists = awayTeam.players.reduce((s, p) => s + p.assists, 0);
    return { homeGoals, awayGoals, homeYellow, awayYellow, homeRed, awayRed, homeAssists, awayAssists };
  }, [homeTeam, awayTeam]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.period !== b.period) return a.period - b.period;
      const [aMin, aSec] = a.time.split(':').map(Number);
      const [bMin, bSec] = b.time.split(':').map(Number);
      return (aMin * 60 + aSec) - (bMin * 60 + bSec);
    });
  }, [events]);

  const getBadgeClass = (type: string) => {
    const map: Record<string, string> = {
      goal: styles.badgeGoal,
      assist: styles.badgeGoal,
      yellowCard: styles.badgeYellow,
      redCard: styles.badgeRed,
      substitution: styles.badgeSub,
      timeout: styles.badgeTimeout,
      dispute: styles.badgeDispute,
      scoreDeduct: styles.badgeDeduct,
      period: styles.badgePeriod
    };
    return map[type] || styles.badgeOther;
  };

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    Taro.showToast({ title: '请点击右上角分享', icon: 'none' });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handlePreviewPhoto = (photo: string, allPhotos: string[]) => {
    Taro.previewImage({
      current: photo,
      urls: allPhotos
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.reportCard}>
        <View className={styles.reportHeader}>
          <Text className={styles.tournamentName}>{currentMatch.tournament}</Text>
          <Text className={styles.reportMeta}>
            {currentMatch.venue} · {currentMatch.date} {currentMatch.time}
          </Text>
        </View>

        <View className={styles.scoreSection}>
          <View className={styles.scoreRow}>
            <View className={styles.teamInfo}>
              <Text className={styles.teamName}>{homeTeam.name}</Text>
              <Text className={styles.teamScore} style={{ color: homeTeam.color }}>
                {homeTeam.score}
              </Text>
            </View>
            <View className={styles.vs}>
              <Text className={styles.vsText}>VS</Text>
            </View>
            <View className={styles.teamInfo}>
              <Text className={styles.teamName}>{awayTeam.name}</Text>
              <Text className={styles.teamScore} style={{ color: awayTeam.color }}>
                {awayTeam.score}
              </Text>
            </View>
          </View>
          <Text className={styles.reportMeta}>
            {getStatusText(currentMatch.status)} · 第{currentMatch.period}/{currentMatch.totalPeriods}节 · 全场{currentMatch.currentTime}
          </Text>
        </View>
      </View>

      <View className={styles.reportCard}>
        <Text className={styles.sectionTitle}>技术统计</Text>
        <View className={styles.statGrid}>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队进球</Text>
            <Text className={styles.value}>{stats.homeGoals}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队进球</Text>
            <Text className={styles.value}>{stats.awayGoals}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队助攻</Text>
            <Text className={styles.value}>{stats.homeAssists}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队助攻</Text>
            <Text className={styles.value}>{stats.awayAssists}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队黄牌</Text>
            <Text className={styles.value}>{stats.homeYellow}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队黄牌</Text>
            <Text className={styles.value}>{stats.awayYellow}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队红牌</Text>
            <Text className={styles.value}>{stats.homeRed}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队红牌</Text>
            <Text className={styles.value}>{stats.awayRed}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>主队暂停</Text>
            <Text className={styles.value}>{3 - currentMatch.timeouts.home}次使用</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.label}>客队暂停</Text>
            <Text className={styles.value}>{3 - currentMatch.timeouts.away}次使用</Text>
          </View>
        </View>
      </View>

      {sortedEvents.length > 0 && (
        <View className={styles.reportCard}>
          <Text className={styles.sectionTitle}>事件时间线</Text>
          <View className={styles.timeline}>
            {sortedEvents.map((event, index) => (
              <View key={event.id} className={styles.timelineItem}>
                <View className={styles.timelineLine}>
                  <View 
                    className={styles.timelineDot}
                    style={{ backgroundColor: getEventColor(event.type) }}
                  />
                  {index < sortedEvents.length - 1 && <View className={styles.timelineConnector} />}
                </View>
                <View className={styles.timelineContent}>
                  <View className={styles.timelineHeader}>
                    <View className={classnames(styles.eventTypeBadge, getBadgeClass(event.type))}>
                      <Text>{getEventLabel(event.type)}</Text>
                    </View>
                    <Text className={styles.eventTime}>第{event.period}节 {event.time}</Text>
                  </View>
                  <View className={styles.eventBody}>
                    {event.playerName && (
                      <Text className={styles.playerName}>
                        {event.teamId === homeTeam.id ? '主队' : event.teamId === awayTeam.id ? '客队' : ''} {event.playerName}
                      </Text>
                    )}
                    {event.assistPlayerName && (
                      <Text className={styles.assistName}> 助攻: {event.assistPlayerName}</Text>
                    )}
                  </View>
                  <Text className={styles.eventDesc}>{event.description}</Text>
                  {(event.photos && event.photos.length > 0) && (
                    <View className={styles.photoRow}>
                      {event.photos.map((photo, idx) => (
                        <Image
                          key={idx}
                          className={styles.photoThumb}
                          src={photo}
                          mode='aspectFill'
                          onClick={() => handlePreviewPhoto(photo, event.photos!)}
                        />
                      ))}
                    </View>
                  )}
                  {event.photoUrl && (!event.photos || event.photos.length === 0) && (
                    <View className={styles.photoRow}>
                      <Image
                        className={styles.photoThumb}
                        src={event.photoUrl}
                        mode='aspectFill'
                        onClick={() => handlePreviewPhoto(event.photoUrl!, [event.photoUrl!])}
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.reportCard}>
        <Text className={styles.sectionTitle}>确认信息</Text>
        <View className={styles.confirmInfo}>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>比赛编号</Text>
            <Text className={styles.value}>{currentMatch.id}</Text>
          </View>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>比赛状态</Text>
            <Text className={styles.value}>{getStatusText(currentMatch.status)}</Text>
          </View>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>最终比分</Text>
            <Text className={styles.value}>{homeTeam.name} {homeTeam.score} - {awayTeam.score} {awayTeam.name}</Text>
          </View>
          <View className={styles.confirmRow}>
            <Text className={styles.label}>事件总数</Text>
            <Text className={styles.value}>{events.length} 条</Text>
          </View>
          
          {confirmation && (
            <>
              <View className={styles.confirmDivider} />
              <View className={styles.confirmRow}>
                <Text className={styles.label}>主队队长</Text>
                <Text className={classnames(styles.value, confirmation.homeCaptain.signed && styles.signedValue)}>
                  {confirmation.homeCaptain.signed ? `✓ ${confirmation.homeCaptain.name} · ${confirmation.homeCaptain.time}` : '未签名'}
                </Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>客队队长</Text>
                <Text className={classnames(styles.value, confirmation.awayCaptain.signed && styles.signedValue)}>
                  {confirmation.awayCaptain.signed ? `✓ ${confirmation.awayCaptain.name} · ${confirmation.awayCaptain.time}` : '未签名'}
                </Text>
              </View>
              <View className={styles.confirmRow}>
                <Text className={styles.label}>主裁判</Text>
                <Text className={classnames(styles.value, confirmation.referee.confirmed && styles.signedValue)}>
                  {confirmation.referee.confirmed ? `✓ ${confirmation.referee.name} · ${confirmation.referee.time}` : '未确认'}
                </Text>
              </View>
              {confirmation.confirmedAt && (
                <View className={styles.confirmRow}>
                  <Text className={styles.label}>提交时间</Text>
                  <Text className={styles.value}>{confirmation.confirmedAt}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      <View className={styles.bottomActions}>
        <Button className={classnames(styles.actionBtn, styles.backBtn)} onClick={handleBack}>
          返回
        </Button>
        <Button className={classnames(styles.actionBtn, styles.shareBtn)} onClick={handleShare}>
          📤 分享成绩单
        </Button>
      </View>
    </ScrollView>
  );
};

export default ScoreReportPage;
