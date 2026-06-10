import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import type { MatchEvent } from '@/types/match';
import { getEventLabel } from '@/utils/format';
import classnames from 'classnames';

interface EventTimelineProps {
  events: MatchEvent[];
  title?: string;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events, title = '事件记录' }) => {
  const getEventTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
      goal: styles.eventGoal,
      assist: styles.eventGoal,
      yellowCard: styles.eventYellowCard,
      redCard: styles.eventRedCard,
      substitution: styles.eventSubstitution,
      timeout: styles.eventTimeout,
      period: styles.eventPeriod
    };
    return classMap[type] || '';
  };

  const sortedEvents = [...events].reverse();

  return (
    <View className={styles.eventTimeline}>
      <Text className={styles.title}>{title}</Text>
      
      {events.length === 0 ? (
        <View className={styles.empty}>
          <Text>暂无事件记录</Text>
        </View>
      ) : (
        <ScrollView scrollY className={styles.list}>
          {sortedEvents.map((event) => (
            <View key={event.id} className={styles.eventItem}>
              <View className={styles.timeBadge}>
                <Text>{event.time}</Text>
              </View>
              
              <View 
                className={styles.teamIndicator}
                style={{ backgroundColor: event.teamId === 'team-home' ? '#3B82F6' : '#F97316' }}
              />
              
              <View className={styles.eventContent}>
                <View className={styles.eventHeader}>
                  <View className={classnames(styles.eventType, getEventTypeClass(event.type))}>
                    <Text>{getEventLabel(event.type)}</Text>
                  </View>
                  {event.playerName && (
                    <Text className={styles.playerName}>{event.playerName}</Text>
                  )}
                </View>
                <Text className={styles.description}>{event.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default EventTimeline;
