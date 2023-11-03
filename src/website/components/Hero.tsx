import React from 'react'
import { useState } from 'react'
import { StopCircle, Play } from 'react-feather'
import { useMount } from '../../hooks/useMount'
import { Button } from '../../components/Button'

const audio = new Audio(
  new URL('../assets/demo.mp3', import.meta.url).toString(),
)

export function Hero() {
  const [playing, setPlaying] = useState(false)
  const [played, setPlayed] = useState(false)

  useMount(() => {
    audio.addEventListener('ended', () => {
      setPlaying(false)
    })
  })

  function play() {
    setPlayed(true)
    setPlaying(!playing)

    if (playing) {
      audio.pause()
      audio.currentTime = 0
    } else {
      audio.play()
    }
  }

  return (
    <div className="bg-neutral-100 w-full flex flex-col items-center border-b border-neutral-200 shadow-sm">
      <div className="flex flex-col w-full max-w-screen-xl overflow-hidden p-4">
        <div className="flex flex-col gap-12 items-center text-center lg:flex-row">
          <div className="lg:w-1/2 flex flex-col justify-center gap-6 pt-12 lg:py-12 items-center text-center lg:text-left lg:items-start">
            <div>
              <span className="flex gap-2 justify-center lg:justify-start">
                <span className="font-semibold text-xs uppercase bg-green-500 border border-green-600 text-white px-1.5 py-0.5 rounded w-fit">
                  11'000+ users
                </span>
                <span className="font-semibold text-xs uppercase bg-yellow-500 border border-yellow-600 text-white px-1.5 py-0.5 rounded w-fit">
                  4.8/5 stars
                </span>
              </span>
              <h1 className="text-4xl font-bold max-w-screen-md mt-3">
                Transform highlighted text into high-quality natural sounding
                audio
              </h1>
              <p className="text-neutral-500 text-lg mt-2 max-w-2xl">
                Wavenet for Chrome is an extension that allows you to use Google
                Cloud's text to speech API to listen or download audio from any
                website
              </p>
            </div>
            <div className="flex gap-2">
              <a href="https://chrome.google.com/webstore/detail/wavenet-for-chrome/iefankigbnlnlaolflbcopliocibkffc">
                <Button
                  className="w-fit"
                  Icon={() => (
                    <img
                      src={new URL(
                        '../assets/icons/google-chrome.png',
                        import.meta.url,
                      ).toString()}
                      className="h-4 mr-2"
                    />
                  )}
                >
                  Install on Chrome
                </Button>
              </a>
              <Button
                ping={!playing && !played}
                Icon={playing ? StopCircle : Play}
                type="primary"
                className="w-fit"
                onClick={play}
              >
                {playing ? 'Stop playing' : 'Listen to sample'}
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center lg:w-1/2 px-4 md:px-8 lg:px-0">
            <img
              src={new URL(
                '../assets/images/screenshot.png',
                import.meta.url,
              ).toString()}
              className="cursor-not-allowed w-2/3 lg:w-auto min-w-full shadow-xl rounded-lg border-2 border-neutral-200"
              style={{
                marginBottom: '-50%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
