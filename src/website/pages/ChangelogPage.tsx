import React from 'react'
import { twMerge } from 'tailwind-merge'

export function ChangelogPage() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full bg-neutral-100 border-b border-neutral-200 shadow-sm text-center p-8 pb-24">
        <h1 className="w-full text-4xl font-bold">Changelog</h1>
        <p className="w-full text-lg text-neutral-500 mt-3">
          See what's new in the latest version of the extension
        </p>
      </div>
      <div className="p-4 max-w-screen-sm">
        <Release
          isFirst={true}
          version="13"
          date="2023-11-05"
          new={[
            {
              title: 'Purchase credits (Optional)',
              description:
                "It's now possible to purchase credits directly from the extension. This is completely optional and you can still use the extension for free. Purchasing credits will help support the development of the extension and allow me to continue to add new features.",
              image: new URL('../assets/images/changelog/paid-version.png', import.meta.url).toString(),
            },
          ]}
          improvements={[
            {
              title: 'Popup remembers the last panel you were on',
              description:
                'The popup will now remember the last panel you were on and open to that panel the next time you open the popup. Useful if you frequently use the sandbox or preferences panel.',
            },
            {
              title: 'Error dialog in popup',
              description:
                'When an error occurs in the popup, a dialog will now appear with a more meaningful error message. Useful if you are having trouble synthesizing audio in the Sandbox.',
                image: new URL('../assets/images/changelog/popup-errors.png', import.meta.url).toString(),
            }
          ]}
          bugs={[{ title: 'Fixed voices not always loading when opening the popup and duplicate entries' }]}
        />
        <Release
          version="12"
          date="2023-07-30"
          new={[
            {
              title: 'Added new volume slider',
              description:
                'You can independently control the volume of the generated audio',
              image: new URL('../assets/images/changelog/volume-slider.png', import.meta.url).toString(),
            },
            {
              title: 'Added support for audio profiles',
              description:
                'You can now select from a list of audio profiles to change the way audio is generated. This is useful for changing the way the audio sounds for different devices (e.g. headphones vs. speakers)',
              image: new URL('../assets/images/changelog/audio-profile.png', import.meta.url).toString(),
            },
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
              image: new URL('../assets/images/changelog/error-message.png', import.meta.url).toString(),
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
              image: new URL('../assets/images/changelog/edit-shortcuts.png', import.meta.url).toString(),
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
              image: new URL('../assets/images/changelog/speed-pitch-sliders.png', import.meta.url).toString(),
            },
            {
              title: 'Better sentence boundary detection using WinkNLP',
              image: new URL('../assets/images/changelog/sentence-boundary-detection.png', import.meta.url).toString(),
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
              image: new URL('../assets/images/changelog/sandbox.png', import.meta.url).toString(),
            },
            {
              title: 'Audio format selection',
              description:
                'Choose between MP3, OGG, and WAV when downloading or reading aloud',
              image: new URL('../assets/images/changelog/audio-formats.png', import.meta.url).toString(),
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
              image: new URL('../assets/images/changelog/voice-search.png', import.meta.url).toString(),
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
  )
}

function Release(props) {
  return (
    <div className={twMerge(
      'flex flex-col gap-4 border-t pt-4 mt-8',
      props.isFirst && 'border-t-0 mt-0'
    )}>
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
                    src={item.image}
                    className="w-2/3 rounded shadow border mb-2"
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
                    src={item.image}
                    className="w-2/3 rounded shadow border mb-2"
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
                    src={item.image}
                    className="w-2/3 rounded shadow border mb-2"
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
