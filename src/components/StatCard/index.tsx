import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  value: string | number;
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'accent';
}

const StatCard: React.FC<StatCardProps> = ({ value, label, variant = 'default' }) => {
  return (
    <View className={classnames(styles.statCard, styles[variant])}>
      <Text className={styles.statValue}>{value}</Text>
      <Text className={styles.statLabel}>{label}</Text>
    </View>
  );
};

export default StatCard;
