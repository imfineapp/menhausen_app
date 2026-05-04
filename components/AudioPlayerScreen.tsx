import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Pause, Play } from 'lucide-react'

import { goBack } from '@/src/stores/navigation.store'
import { BackButton } from '@/components/ui/back-button'

import defaultTrackUrl from "../Luminous Drift Field (1).mp3"

export function AudioPlayerScreen() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const [inputUrl, setInputUrl] = useState<string>('')
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const src = useMemo(() => (objectUrl ?? (inputUrl.trim() || '')) || defaultTrackUrl, [inputUrl, objectUrl])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)

    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    el.currentTime = 0
    setIsPlaying(false)
  }, [src])

  const togglePlay = async () => {
    const el = audioRef.current
    if (!el) return
    if (!src) return

    if (el.paused) {
      try {
        await el.play()
      } catch {
        // Autoplay restrictions / invalid src — ignore
      }
    } else {
      el.pause()
    }
  }

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (objectUrl) URL.revokeObjectURL(objectUrl)
    setObjectUrl(URL.createObjectURL(file))
    setInputUrl('')
  }

  return (
    <div className="bg-[#111111] relative w-full h-full min-h-screen safe-top safe-bottom">
      <BackButton onBack={goBack} />

      <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[24px] pb-[24px] max-w-[420px] mx-auto">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] text-[#e1ff00] hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="typography-button">Назад</span>
        </button>

        <div className="mt-6 flex flex-col gap-4">
          <div className="typography-h2 text-[#e1ff00]">
            <h2>Тестовый аудио‑плеер</h2>
          </div>

          <div className="typography-body text-[#8a8a8a]">
            Укажите ссылку на MP3 или выберите файл. Затем нажмите Play/Pause.
          </div>

          <div className="flex flex-col gap-3">
            <label className="typography-button text-white">
              Ссылка на MP3
              <input
                value={inputUrl}
                onChange={(e) => {
                  if (objectUrl) {
                    URL.revokeObjectURL(objectUrl)
                    setObjectUrl(null)
                  }
                  setInputUrl(e.target.value)
                }}
                placeholder="https://example.com/audio.mp3"
                className="mt-2 w-full rounded-xl px-4 py-3 bg-[rgba(217,217,217,0.04)] border border-[#212121] text-white outline-none"
                inputMode="url"
              />
            </label>

            <label className="typography-button text-white">
              Или выбрать MP3 файл
              <input
                type="file"
                accept="audio/mpeg,audio/mp3"
                onChange={onPickFile}
                className="mt-2 block w-full text-[#8a8a8a]"
              />
            </label>
          </div>

          <div className="rounded-xl p-5 bg-[rgba(217,217,217,0.04)] border border-[#212121] flex flex-col gap-4">
            <audio ref={audioRef} src={src || undefined} preload="metadata" controls className="w-full" />

            <button
              type="button"
              onClick={togglePlay}
              disabled={!src}
              className="w-full rounded-xl p-4 bg-[#e1ff00] text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] transition-transform min-h-[44px]"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span className="typography-button">{isPlaying ? 'Пауза' : 'Воспроизвести'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

