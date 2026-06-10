import React, { useState } from 'react';
import { View, Text, Textarea, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useMatchStore } from '@/store/useMatchStore';
import { generateId } from '@/utils/format';
import classnames from 'classnames';

const disputeTypes = [
  { type: 'foul', icon: '🚫', label: '犯规争议' },
  { type: 'goal', icon: '⚽', label: '进球争议' },
  { type: 'offside', icon: '📍', label: '越位争议' },
  { type: 'handball', icon: '✋', label: '手球争议' },
  { type: 'card', icon: '🟨', label: '判罚争议' },
  { type: 'other', icon: '❓', label: '其他' }
];

const DisputePage: React.FC = () => {
  const currentMatch = useMatchStore((state) => state.currentMatch);
  const addEvent = useMatchStore((state) => state.addEvent);

  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleAddPhoto = () => {
    if (photos.length >= 9) {
      Taro.showToast({
        title: '最多上传9张照片',
        icon: 'none'
      });
      return;
    }

    Taro.chooseImage({
      count: 9 - photos.length,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        setPhotos([...photos, ...res.tempFilePaths]);
      },
      fail: (err) => {
        console.error('[Dispute] 选择图片失败:', err);
      }
    });
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = () => {
    if (!selectedType) {
      Taro.showToast({
        title: '请选择争议类型',
        icon: 'none'
      });
      return;
    }

    if (!description) {
      Taro.showToast({
        title: '请填写争议描述',
        icon: 'none'
      });
      return;
    }

    const typeInfo = disputeTypes.find(t => t.type === selectedType);
    
    const event = {
      id: generateId(),
      type: 'period',
      teamId: '',
      time: currentMatch.currentTime,
      period: currentMatch.period,
      description: `【${typeInfo?.label || '争议'}】${description}`,
      photoUrl: photos.length > 0 ? photos[0] : undefined
    };

    addEvent(event as any);

    console.log('[Dispute] 提交争议判罚:', {
      type: selectedType,
      description,
      photoCount: photos.length,
      time: currentMatch.currentTime,
      period: currentMatch.period
    });

    Taro.showToast({
      title: '已记录争议',
      icon: 'success'
    });

    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.page}>
      <View className={styles.infoCard}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>赛事</Text>
          <Text className={styles.value}>{currentMatch.tournament}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>对阵</Text>
          <Text className={styles.value}>
            {currentMatch.homeTeam.name} VS {currentMatch.awayTeam.name}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>时间</Text>
          <Text className={styles.value}>
            第{currentMatch.period}节 {currentMatch.currentTime}
          </Text>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>争议类型</Text>
        <View className={styles.typeGrid}>
          {disputeTypes.map((item) => (
            <View
              key={item.type}
              className={classnames(
                styles.typeItem,
                selectedType === item.type && styles.typeActive
              )}
              onClick={() => handleTypeSelect(item.type)}
            >
              <Text className={styles.typeIcon}>{item.icon}</Text>
              <Text className={styles.typeLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.photoSection}>
          <Text className={styles.sectionTitle}>现场照片</Text>
          <View className={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} className={styles.photoItem}>
                <Image
                  className={styles.photoImg}
                  src={photo}
                  mode='aspectFill'
                />
                <View
                  className={styles.removeBtn}
                  onClick={() => handleRemovePhoto(index)}
                >
                  <Text className={styles.removeText}>×</Text>
                </View>
              </View>
            ))}
            {photos.length < 9 && (
              <View
                className={classnames(styles.photoItem, styles.photoAdd)}
                onClick={handleAddPhoto}
              >
                <Text className={styles.addIcon}>📷</Text>
                <Text className={styles.addText}>拍照/上传</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.sectionTitle}>争议描述</Text>
        <View className={styles.formItem}>
          <Textarea
            className={styles.formTextarea}
            placeholder='请详细描述争议情况...'
            placeholderClass='text-placeholder'
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        提交争议记录
      </Button>
    </View>
  );
};

export default DisputePage;
