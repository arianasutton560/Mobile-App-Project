import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import englishVideoCaptions from '../data/videoCaptions.en.json';
import spanishVideoCaptions from '../data/videoCaptions.es.json';
import { getCaptionAtTime, getVideoMediaId } from '../data/videoCaptions';

function getSubtitleLanguage(track) {
  const identity = [track?.language, track?.label, track?.name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\b(es|spa)(?:[-_\s]|$)|spanish|español/.test(identity)) return 'es';
  if (/\b(en|eng)(?:[-_\s]|$)|english|inglés/.test(identity)) return 'en';
  return null;
}

export default function RecipeVideoPlayer({ video, title, language, t }) {
  const isFocused = useIsFocused();
  const player = useVideoPlayer(video.url, (videoPlayer) => {
    videoPlayer.loop = false;
  });
  const mediaId = getVideoMediaId(video);
  const englishCues = mediaId ? englishVideoCaptions[mediaId] ?? [] : [];
  const spanishCues = mediaId ? spanishVideoCaptions[mediaId] ?? [] : [];
  const hasGeneratedCaptions = englishCues.length > 0 || spanishCues.length > 0;
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [hasUserSelectedLanguage, setHasUserSelectedLanguage] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCaptionMenuVisible, setIsCaptionMenuVisible] = useState(false);

  useEffect(() => {
    if (!isFocused) player.pause();
  }, [isFocused, player]);

  useEffect(() => {
    setSubtitleTracks(player.availableSubtitleTracks ?? []);
    player.timeUpdateEventInterval = hasGeneratedCaptions ? 0.25 : 0;

    const sourceLoadSubscription = player.addListener('sourceLoad', (event) => {
      setSubtitleTracks(event.availableSubtitleTracks ?? player.availableSubtitleTracks ?? []);
    });
    const tracksSubscription = player.addListener(
      'availableSubtitleTracksChange',
      (event) => setSubtitleTracks(event.availableSubtitleTracks ?? [])
    );
    const timeSubscription = hasGeneratedCaptions
      ? player.addListener('timeUpdate', (event) => setCurrentTime(event.currentTime))
      : null;

    return () => {
      sourceLoadSubscription.remove();
      tracksSubscription.remove();
      timeSubscription?.remove();
      player.timeUpdateEventInterval = 0;
    };
  }, [player, hasGeneratedCaptions]);

  const englishTrack = subtitleTracks.find((track) => getSubtitleLanguage(track) === 'en');
  const spanishTrack = subtitleTracks.find((track) => getSubtitleLanguage(track) === 'es');
  const availableLanguages = [
    englishTrack || englishCues.length > 0 ? 'en' : null,
    spanishTrack || spanishCues.length > 0 ? 'es' : null,
  ].filter(Boolean);
  const availableLanguagesKey = availableLanguages.join(',');
  const selectedTrack = selectedLanguage === 'en'
    ? englishTrack
    : selectedLanguage === 'es'
      ? spanishTrack
      : null;
  const selectedCues = selectedLanguage === 'en'
    ? englishCues
    : selectedLanguage === 'es'
      ? spanishCues
      : [];
  const activeCue = !selectedTrack
    ? getCaptionAtTime(selectedCues, currentTime)
    : null;

  useEffect(() => {
    if (hasUserSelectedLanguage) return;
    setSelectedLanguage(availableLanguages.includes(language) ? language : null);
  }, [availableLanguagesKey, hasUserSelectedLanguage, language]);

  useEffect(() => {
    player.subtitleTrack = selectedTrack ?? null;
  }, [player, selectedTrack]);

  function selectCaptionLanguage(nextLanguage) {
    setHasUserSelectedLanguage(true);
    setSelectedLanguage(nextLanguage);
    setIsCaptionMenuVisible(false);
  }

  return (
    <View style={videoStyles.videoCard}>
      <View style={videoStyles.videoFrame}>
        <VideoView
          player={player}
          style={videoStyles.videoPlayer}
          contentFit="contain"
          nativeControls
          showSubtitles={false}
        />
        {activeCue ? (
          <View pointerEvents="none" style={videoStyles.captionOverlay}>
            <Text style={videoStyles.captionText}>{activeCue.text}</Text>
          </View>
        ) : null}
      </View>
      {(title || availableLanguages.length > 0) ? (
        <View style={videoStyles.videoFooter}>
          {title ? <Text style={videoStyles.videoTitle}>{title}</Text> : null}
          {availableLanguages.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={selectedLanguage
                ? t('recipe.captionSelectionAccessibility', {
                    language: t(`recipe.captions.${selectedLanguage}`),
                  })
                : t('recipe.captions')}
              accessibilityState={{ expanded: isCaptionMenuVisible }}
              onPress={() => setIsCaptionMenuVisible(true)}
              style={videoStyles.captionControl}
            >
              <Text style={videoStyles.captionControlText}>
                CC · {selectedLanguage ? t(`recipe.captions.${selectedLanguage}`) : t('recipe.captionsOff')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Modal
        visible={isCaptionMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCaptionMenuVisible(false)}
      >
        <View style={videoStyles.captionModalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('recipe.closeCaptions')}
            onPress={() => setIsCaptionMenuVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={videoStyles.captionMenu}>
            <Text style={videoStyles.captionMenuTitle}>{t('recipe.captions')}</Text>
            {[
              { key: null, label: t('recipe.captionsOff') },
              ...availableLanguages.map((code) => ({
                key: code,
                label: t(`recipe.captions.${code}`),
              })),
            ].map((option) => (
              <Pressable
                key={option.key ?? 'off'}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedLanguage === option.key }}
                onPress={() => selectCaptionLanguage(option.key)}
                style={videoStyles.captionOption}
              >
                <Text style={videoStyles.captionOptionText}>{option.label}</Text>
                {selectedLanguage === option.key ? (
                  <Text accessibilityLabel={t('recipe.captionSelected')} style={videoStyles.captionSelectedMark}>✓</Text>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}


const videoStyles = StyleSheet.create({
  videoCard: {
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#4f2e1f',
    borderRadius: 12,
    backgroundColor: '#f8f5f2',
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#1f1f1f',
  },
  videoFrame: {
    position: 'relative',
  },
  videoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoTitle: {
    flex: 1,
    flexShrink: 1,
    padding: 14,
    color: '#4f3b31',
    fontSize: 16,
    fontWeight: '600',
  },
  captionControl: {
    marginHorizontal: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#4f2e1f',
  },
  captionControlText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  captionOverlay: {
    position: 'absolute',
    right: 14,
    bottom: 42,
    left: 14,
    alignItems: 'center',
  },
  captionText: {
    maxWidth: '100%',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  captionModalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  captionMenu: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#fff',
  },
  captionMenuTitle: {
    marginBottom: 8,
    color: '#4f2e1f',
    fontSize: 18,
    fontWeight: '700',
  },
  captionOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dccfc7',
  },
  captionOptionText: {
    color: '#4f3b31',
    fontSize: 16,
  },
  captionSelectedMark: {
    color: '#d97745',
    fontSize: 18,
    fontWeight: '700',
  }
});
