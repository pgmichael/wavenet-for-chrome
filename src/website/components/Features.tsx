import React from "react"
import { BarChart2, Box, Command, Download, ExternalLink, GitHub, Globe, Speaker, Type, Volume2 } from "react-feather"
import { Button } from "../../components/Button"

export function Features() {
  return (
    <div className='w-full flex flex-col items-center pt-8' id="features">
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-screen-xl p-4'>
        <Feature
          Icon={Globe}
          title='220+ voices in 40+ languages'
          description='Supports all Google WaveNet, Neural2, News, Studio, Polyglot voices and languages'
          link={{
            text: 'See all supported voices',
            href: 'https://cloud.google.com/text-to-speech/docs/voices'
          }}
        />
        <Feature
          Icon={Download}
          title='Download text to MP3 file'
          description='Download the generated audio as an MP3 file to listen to it offline or to use it in your external projects'
        />
        <Feature
          Icon={BarChart2}
          title='Usage optimization'
          description='The extension chunks the text into smaller parts to optimize the usage of the Google Cloud API'
        />
        <Feature
          Icon={Type}
          title='SSML support'
          description='Use SSML tags to customize the intonation, pronunciation, and speech of the generated audio'
          link={{
            text: 'Learn more about SSML',
            href: 'https://cloud.google.com/text-to-speech/docs/ssml'
          }}
        />
        <Feature
          Icon={Volume2}
          title='Adjustable pitch and speaking rate'
          description='Adjust the pitch and speaking rate of the generated audio to make it sound more natural'
        />
        <Feature
          Icon={Command}
          title='Customizable shortcuts'
          description='Quickly listen to the selected text or download it by using the customizable keyboard shortcuts'
        />
        <Feature
          Icon={Speaker}
          title='Customizable audio quality'
          description='Choose between different profiles to optimize the audio quality depending on your needs'
        />
        <Feature
          Icon={Box}
          title='Sandbox mode'
          description='Write and synthesize text directly in the extension to test the different voices and settings'
        />
        <Feature
          Icon={GitHub}
          title='Open source'
          description='The extension is open source and available on GitHub under the MIT license'
          link={{
            text: 'View on GitHub',
            href: 'https://www.github.com/pgmichael/wavenet-for-chrome'
          }}
        />
      </div>
    </div>
  )
}

function Feature(props: { title: string, description: string, link?: { href: string, text: string }, Icon?: React.FC<any> }) {
  const { Icon } = props

  return (
    <div className='bg-neutral-50 border border-neutral-200 p-4 rounded-lg shadow-sm flex flex-col gap-3 hover:scale-105 hover:shadow-lg transition-all'>
      <div className='text-lg font-bold flex items-center'>{Icon && <Icon className='mr-3' size={24} />}{props.title}</div>
      <p className='text-neutral-500'>
        {props.description}
      </p>
      {props.link && <a href={props.link.href}><Button Icon={ExternalLink}>{props.link.text}</Button></a>}
    </div>
  )
}
