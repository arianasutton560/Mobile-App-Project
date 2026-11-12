import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CookTimer from '../components/CookTimer';
import RecipeVideoPlayer from '../components/RecipeVideoPlayer';
import { useLanguage } from '../context/LanguageContext';
import { getTimerOptions } from '../data/cookTimer';
import { localizeRecipe } from '../data/recipes';
import { getPlayableVideo } from '../data/recipeVideo';

export default function CookMode({ route, navigation }) {
  const { recipe } = route.params ?? {};
  const { language, t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const speechRequestId = useRef(0);
  const displayRecipe = useMemo(
    () => recipe ? localizeRecipe(recipe, language) : null,
    [recipe, language]
  );
  const steps = useMemo(
    () => String(displayRecipe?.instructions ?? '')
      .split(/\n\s*\n/)
      .map((step) => step.trim())
      .filter(Boolean),
    [displayRecipe?.instructions]
  );
  const currentStep = steps[stepIndex] ?? '';
  const timerOptions = useMemo(
    () => getTimerOptions(currentStep),
    [currentStep]
  );
  const playableVideo = (displayRecipe?.videos ?? []).flatMap((video) => {
    try {
      const url = getPlayableVideo(video);
      return url ? [{ ...video, url }] : [];
    } catch {
      return [];
    }
  })[0];
  const isSpanishSpeech = language === 'es' &&
    displayRecipe?.instructions !== recipe?.instructions;

  useEffect(() => {
    speechRequestId.current += 1;
    Speech.stop();
    setIsSpeaking(false);
    return () => {
      speechRequestId.current += 1;
      Speech.stop();
    };
  }, [stepIndex]);

  function stopReading() {
    speechRequestId.current += 1;
    Speech.stop();
    setIsSpeaking(false);
  }

  function readCurrentStep() {
    stopReading();
    const requestId = speechRequestId.current;
    setIsSpeaking(true);
    Speech.speak(currentStep, {
      language: isSpanishSpeech ? 'es-ES' : 'en-US',
      onDone: () => {
        if (speechRequestId.current === requestId) setIsSpeaking(false);
      },
      onStopped: () => {
        if (speechRequestId.current === requestId) setIsSpeaking(false);
      },
      onError: () => {
        if (speechRequestId.current === requestId) setIsSpeaking(false);
      },
    });
  }

  if (!recipe || steps.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{t('cook.noSteps')}</Text>
        <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{t('cook.finish')}</Text>
        </Pressable>
      </View>
    );
  }

  const progress = ((stepIndex + 1) / steps.length) * 100;
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.recipeHeader}>
          <Image source={{ uri: displayRecipe.image }} style={styles.thumbnail} />
          <Text numberOfLines={2} style={styles.recipeTitle}>{displayRecipe.title}</Text>
        </View>

        <Text accessibilityLiveRegion="polite" style={styles.stepCount}>
          {t('cook.stepCounter', { step: stepIndex + 1, total: steps.length })}
        </Text>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: steps.length, now: stepIndex + 1 }}
          style={styles.progressTrack}
        >
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <Text accessibilityLiveRegion="polite" style={styles.instruction}>{currentStep}</Text>

        <View style={styles.featureActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSpeaking ? t('cook.stopReading') : t('cook.readAloud')}
            onPress={isSpeaking ? stopReading : readCurrentStep}
            style={[styles.featureButton, styles.secondaryButton]}
          >
            <Text style={styles.secondaryButtonText}>{isSpeaking ? t('cook.stopReading') : t('cook.readAloud')}</Text>
          </Pressable>
        </View>

        <CookTimer durations={timerOptions} stepKey={stepIndex} t={t} />

        {playableVideo ? (
          <View style={styles.videoSection}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isVideoExpanded }}
              accessibilityLabel={t('recipe.watchVideo')}
              onPress={() => setIsVideoExpanded((expanded) => !expanded)}
              style={styles.videoToggle}
            >
              <Text style={styles.videoToggleText}>
                {isVideoExpanded ? '-' : '+'}  {t('cook.watchVideo')}
              </Text>
            </Pressable>
            {isVideoExpanded ? (
              <RecipeVideoPlayer
                video={playableVideo}
                title={playableVideo.title || t('recipe.watchVideo')}
                language={language}
                t={t}
              />
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.navigationBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: stepIndex === 0 }}
          disabled={stepIndex === 0}
          onPress={() => setStepIndex((current) => Math.max(0, current - 1))}
          style={[styles.navigationButton, styles.secondaryButton, stepIndex === 0 && styles.disabledButton]}
        >
          <Text style={styles.secondaryButtonText}>{t('cook.previous')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => isLastStep ? navigation.goBack() : setStepIndex((current) => current + 1)}
          style={[styles.navigationButton, styles.primaryButton]}
        >
          <Text style={styles.primaryButtonText}>{isLastStep ? t('cook.finish') : t('cook.next')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f1ede9',
  },
  recipeTitle: {
    flex: 1,
    marginLeft: 14,
    color: '#193321',
    fontSize: 22,
    fontWeight: '700',
  },
  stepCount: {
    marginBottom: 10,
    color: '#193321',
    fontSize: 18,
    fontWeight: '700',
  },
  progressTrack: {
    height: 12,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#d97745',
  },
  instruction: {
    marginTop: 24,
    color: '#193321',
    fontSize: 27,
    fontWeight: '700',
    lineHeight: 36,
  },
  featureActions: {
    flexDirection: 'row',
    marginTop: 22,
  },
  featureButton: {
    flex: 1,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#d97745',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#d97745',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#b84f1c',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  videoSection: {
    marginTop: 20,
  },
  videoToggle: {
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#d8d2ce',
  },
  videoToggleText: {
    color: '#4f2e1f',
    fontSize: 17,
    fontWeight: '700',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  navigationButton: {
    flex: 1,
    minHeight: 52,
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    marginBottom: 18,
    color: '#4f3b31',
    fontSize: 18,
    textAlign: 'center',
  },
});
