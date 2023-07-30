import React from 'react'
import { createRoot } from 'react-dom/client'

function Changelog() {
  return (
    <div className="flex justify-center bg-neutral-50 bg-opacity-30">
      <div className="flex flex-col items-center justify-center w-full max-w-xl p-2">
        <div className="flex flex-col justify-center gap-4 pt-8">
          <div className="flex justify-center">
            <div className="flex items-center text-center">
              <img
                src="../public/images/icon_1000.png"
                className="mr-4 pt-0.5"
                style={{ width: '64px' }}
              />
              <div>
                <div className="text-4xl font-bold text-neutral-800 bg-">
                  Wavenet
                </div>
                <div
                  className="text-2xl font-bold text-neutral-500"
                  style={{ marginTop: '-5px' }}
                >
                  for Chrome
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Release
            version="12"
            date="2023-07-30"
            new={[
              {
                title: 'Added new volume slider',
                description: 'You can independently control the volume of the generated audio',
                image: 'volume-slider.png',
              },
              {
                title: 'Added support for audio profiles',
                description:
                  'You can now select from a list of audio profiles to change the way audio is generated. This is useful for changing the way the audio sounds for different devices (e.g. headphones vs. speakers)',
                image: 'audio-profile.png',
              }
            ]}
          />
          <Release
            version="11"
            date="2023-07-27"
            new={[
              {
                title: 'Meaningful error messages',
                description:
                  'When an error occurs, you will now see a more meaningful error message in a well formatted modal',
                image: 'error-message.png',
              },
            ]}
            bugs={[
              {
                title: 'Fixed SSML parsing',
                description:
                  'SSML was being read aloud or downloaded as plain text',
              },
            ]}
          />
          <Release
            version="10"
            date="2023-07-24"
            new={[
              {
                title: 'New edit shortcut button',
                description:
                  'Quickly navigate to the chrome://extensions/shortcuts page to edit your shortcuts',
                image: 'edit-shortcuts.png',
              },
              {
                title: 'Changelog page',
                description:
                  "You're looking at it! This page will open on update when there are note worthy changes to the extension",
              },
            ]}
            improvements={[
              {
                title: 'Reverted speed and pitch dropdowns to range sliders',
                description: 'Allows for a more precise selection',
                image: 'speed-pitch-sliders.png',
              },
              {
                title: 'Better sentence boundary detection using WinkNLP',
                image: 'sentence-boundary-detection.png',
                description:
                  'Prevents unnatural pauses in the middle of sentences containing abbreviations and acronyms (e.g. "Mr. Smith" and "U.S.A.")',
              },
            ]}
            bugs={[
              {
                title: 'Fixed audio playback issues',
                description:
                  "Reading text aloud shouldn't skip some sentences or be cut off",
              },
              {
                title: 'Removed broken download options',
                description:
                  "OGG and WAV audio formats we're not stiched together correctly, so they have been removed in favor of higher quality MP3s",
              },
            ]}
          />
          <Release
            version="9"
            date="2023-07-19"
            new={[
              {
                title: 'New sandbox page and refreshed UI',
                description:
                  "You can now read aloud or download any text or SSML directly from the extension's popup",
                image: 'sandbox.png',
              },
              {
                title: 'Audio format selection',
                description:
                  'Choose between MP3, OGG, and WAV when downloading or reading aloud',
                image: 'audio-formats.png',
              },
            ]}
            improvements={[
              {
                title: 'Updated manifest to V3',
                description:
                  'Manifest V3 is the latest version of the Chrome extension manifest format',
              },
              {
                title: 'Search through languages and voices by name or keyword',
                description:
                  'You can now search through the list of languages and voices by name or keyword making it easier to find the voice you want',
                image: 'voice-search.png',
              },
              {
                title: 'Bypass character restrictions on SSML',
                description:
                  'SSML is now chunked into smaller requests to bypass the 5,000 character limit',
              },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

function Release(props) {
  return (
    <div className="flex flex-col gap-4 border-t pt-4 mt-8">
      <div>
        <div className="font-bold text-3xl">
          Version <span className="">{props.version}</span>
        </div>
        <div className="text-neutral-500 font-semibold">{props.date}</div>
      </div>
      {props.new && (
        <div className="grid grid-cols-1 gap-3">
          <span className="font-semibold text-xs uppercase bg-emerald-500 border border-emerald-600 text-white px-1.5 py-0.5 rounded w-fit">
            New
          </span>
          <div className="flex flex-col gap-2">
            {props.new?.map((item, index) => (
              <div className="mb-2" key={`new-${index}`}>
                <div className="font-bold pb-1 text-base">🎉 {item.title}</div>
                <div className="text-neutral-500 text-sm pb-3">
                  {item.description}
                </div>
                {item.image && (
                  <img
                    src={`./images/changelog/${item.image}`}
                    className="w-full rounded shadow border mb-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {props.improvements && (
        <div className="grid grid-cols-1 gap-3">
          <span className="font-semibold text-xs uppercase bg-blue-500 border border-blue-600 text-white px-1.5 py-0.5 rounded w-fit">
            Improvements
          </span>
          <div className="flex flex-col gap-2">
            {props.improvements?.map((item, index) => (
              <div className="mb-2" key={`improvements-${index}`}>
                <div className="font-bold pb-1 text-base">🚀 {item.title}</div>
                <div className="text-neutral-500 text-sm pb-3">
                  {item.description}
                </div>
                {item.image && (
                  <img
                    src={`./images/changelog/${item.image}`}
                    className="w-full rounded shadow border mb-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {props.bugs && (
        <div className="grid grid-cols-1 gap-3">
          <span className="font-semibold text-xs uppercase bg-rose-500 border border-rose-600 text-white px-1.5 py-0.5 rounded w-fit">
            Bugs
          </span>
          <div className="flex flex-col gap-2">
            {props.bugs?.map((item, index) => (
              <div className="mb-2" key={`bugs-${index}`}>
                <div className="font-bold pb-1 text-base">🐛 {item.title}</div>
                <div className="text-neutral-500 text-sm pb-3">
                  {item.description}
                </div>
                {item.image && (
                  <img
                    src={`./images/changelog/${item.image}`}
                    className="w-full rounded shadow border mb-2"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const root = document.createElement('div')
root.id = 'changelog-root'

document.body.appendChild(root)

createRoot(root).render(<Changelog />)
