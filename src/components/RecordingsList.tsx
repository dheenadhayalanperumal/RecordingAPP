import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SavedRecording } from '../services/AudioRecorderService';

interface RecordingsListProps {
  recordings: SavedRecording[];
  onRefresh: () => void;
  onPlayRecording: (recording: SavedRecording) => void;
  onDeleteRecording: (id: string) => void;
  refreshing: boolean;
}

const RecordingsList: React.FC<RecordingsListProps> = ({
  recordings,
  onRefresh,
  onPlayRecording,
  onDeleteRecording,
  refreshing,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (recording: SavedRecording) => {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete "${recording.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteRecording(recording.id),
        },
      ]
    );
  };

  const renderRecordingItem = ({ item }: { item: SavedRecording }) => (
    <View style={styles.recordingItem}>
      <TouchableOpacity
        style={styles.recordingInfo}
        onPress={() => onPlayRecording(item)}
      >
        <View style={styles.recordingHeader}>
          <Text style={styles.recordingName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.recordingDuration}>
            {formatTime(item.duration)}
          </Text>
        </View>
        
        <Text style={styles.recordingDate}>
          {formatDate(item.createdAt)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="mic-off-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Recordings Yet</Text>
      <Text style={styles.emptyStateText}>
        Start recording to see your audio files here
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        renderItem={renderRecordingItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={recordings.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          recordings.length > 0 ? (
            <View style={styles.header}>
              <Text style={styles.headerSubtitle}>
                {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    paddingTop: 10,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  recordingDuration: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  recordingDate: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 10,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RecordingsList;
