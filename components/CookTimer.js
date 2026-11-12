import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { formatCountdown } from '../data/cookTimer';

export default function CookTimer({ durations, stepKey, t }) {
  const isFocused = useIsFocused();
  const durationKey = durations.map((duration) => duration.seconds).join(',');
  const [selection, setSelection] = useState(() => ({
    stepKey,
    durationKey,
    seconds: durations.length === 1 ? durations[0].seconds : null,
  }));
  const selectedSeconds = selection.stepKey === stepKey && selection.durationKey === durationKey
    ? selection.seconds
    : null;
  const [deadline, setDeadline] = useState(null);
  const [pausedSeconds, setPausedSeconds] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState('idle');
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (deadline === null) return undefined;

    const updateCountdown = () => {
      const nextRemaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0 && !hasCompleted.current) {
        hasCompleted.current = true;
        setDeadline(null);
        setStatus('done');
        if (isFocused && AppState.currentState === 'active') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') updateCountdown();
    });

    return () => {
      clearInterval(interval);
      appStateSubscription.remove();
    };
  }, [deadline, isFocused]);

  useEffect(() => {
    if (deadline !== null || status === 'paused' || status === 'done') return;
    setSelection({
      stepKey,
      durationKey,
      seconds: durations.length === 1 ? durations[0].seconds : null,
    });
  }, [stepKey, durationKey, deadline, status]);

  function startTimer(seconds = selectedSeconds) {
    if (!seconds || seconds <= 0) return;
    hasCompleted.current = false;
    setRemainingSeconds(seconds);
    setDeadline(Date.now() + seconds * 1000);
    setPausedSeconds(null);
    setStatus('running');
  }

  function pauseTimer() {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    setDeadline(null);
    setPausedSeconds(remaining);
    setRemainingSeconds(remaining);
    setStatus('paused');
  }

  function resumeTimer() {
    if (!pausedSeconds) return;
    setDeadline(Date.now() + pausedSeconds * 1000);
    setPausedSeconds(null);
    setStatus('running');
  }

  function resetTimer() {
    setDeadline(null);
    setPausedSeconds(null);
    setRemainingSeconds(0);
    setStatus('idle');
    hasCompleted.current = false;
  }

  if (status === 'idle' && durations.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('cook.timer')}</Text>
      {status === 'running' || status === 'paused' || status === 'done' ? (
        <>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.countdown, status === 'done' && styles.complete]}
          >
            {status === 'done' ? t('cook.timerComplete') : formatCountdown(remainingSeconds)}
          </Text>
          <View style={styles.actions}>
            {status === 'running' ? (
              <TimerButton label={t('cook.pauseTimer')} onPress={pauseTimer} />
            ) : null}
            {status === 'paused' ? (
              <TimerButton label={t('cook.resumeTimer')} onPress={resumeTimer} />
            ) : null}
            <TimerButton label={t('cook.resetTimer')} onPress={resetTimer} secondary />
          </View>
        </>
      ) : (
        <>
          {durations.length > 1 ? (
            <Text style={styles.hint}>{t('cook.chooseTimer')}</Text>
          ) : null}
          <View style={styles.options}>
            {durations.map((duration) => (
              <Pressable
                key={duration.seconds}
                accessibilityRole="button"
                accessibilityLabel={t('cook.timerOptionAccessibility', { duration: duration.label })}
                accessibilityState={{ selected: selectedSeconds === duration.seconds }}
                onPress={() => setSelection({ stepKey, durationKey, seconds: duration.seconds })}
                style={[styles.option, selectedSeconds === duration.seconds && styles.optionSelected]}
              >
                <Text style={[styles.optionText, selectedSeconds === duration.seconds && styles.optionTextSelected]}>
                  {duration.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <TimerButton
            label={t('cook.startTimer')}
            onPress={() => startTimer()}
            disabled={selectedSeconds === null}
          />
        </>
      )}
    </View>
  );
}

function TimerButton({ label, onPress, secondary = false, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.actionButton, secondary && styles.secondaryButton, disabled && styles.disabledButton]}
    >
      <Text style={[styles.actionText, secondary && styles.secondaryText, disabled && styles.disabledText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f8f5f2',
  },
  label: {
    color: '#4f2e1f',
    fontSize: 17,
    fontWeight: '700',
  },
  hint: {
    marginTop: 10,
    color: '#765c4d',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  option: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#bda99b',
    borderRadius: 20,
  },
  optionSelected: {
    borderColor: '#4f2e1f',
    backgroundColor: '#4f2e1f',
  },
  optionText: {
    color: '#4f3b31',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#4f2e1f',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4f2e1f',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryText: {
    color: '#4f2e1f',
  },
  disabledButton: {
    opacity: 0.45,
  },
  disabledText: {
    opacity: 0.8,
  },
  countdown: {
    marginTop: 8,
    color: '#4f2e1f',
    fontSize: 34,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  complete: {
    fontSize: 20,
  },
});
