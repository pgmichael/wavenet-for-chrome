import React from 'react'
import { creditFormat, dateFormat } from '../../helpers/formatting-helpers.js';
import { useMount } from '../../../hooks/hooks/useMount.js';

export function Usage() {
  const [user, setUser] = React.useState(null);
  const [loadingUser, setLoadingUser] = React.useState(false);

  const [usage, setUsage] = React.useState([]);
  const [loadingUsage, setLoadingUsage] = React.useState(false);

  useMount(() => {
    setLoadingUser(true)
    setLoadingUsage(true)
    chrome.runtime.sendMessage({ id: 'fetchUser' }, (response) => {
      if (!response) return;

      setUser(response);
      setLoadingUser(false);
    });

    chrome.runtime.sendMessage({ id: 'fetchUsage' }, (response) => {
      if (!response) return;

      setUsage(response);
      setLoadingUsage(false);
    });
  });

  function renderCredits() {
    return (
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Credits
        </div>
        <div className="bg-white p-3 rounded shadow-sm border flex flex-col gap-2">
          <span>
            You have <span className="font-bold">{creditFormat(user?.credits || 0)}</span> of credits left
          </span>
        </div>
      </div>
    )
  }

  function renderUsage() {
    return (
      <div>
        <div className="font-semibold text-neutral-700 mb-1.5 ml-1 flex items-center">
          Last 100 usages
        </div>
        <div className="bg-white rounded shadow-sm border flex flex-col">
          {
            usage.length
              ? usage?.map((u) => <UsageItem {...u} />)
              : <div className='p-3'>No usage yet</div>
          }
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {renderCredits()}
      {renderUsage()}
    </div>
  );
}

function UsageItem(props) {
  return (
    <div className="flex px-4 py-3 even:bg-neutral-50">
      <div className="font-semibold text-neutral-700">
        {dateFormat(props.inserted_at)}
      </div>
      <div className="font-semibold text-neutral-700 ml-auto">
        {props.character_count} characters
      </div>
      <div className="font-semibold text-neutral-700 ml-4">
        {props.voice_name}
      </div>
    </div>
  )
}
