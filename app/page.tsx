'use client';

import { useRouter,useSearchParams } from "next/navigation";
import React, { Suspense, use, useState } from 'react';
import { encodePassphrase, generateroomId, randomString } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';


function tabs (props: React.PropsWithChildren<{}>) {
  const searchParams = useSearchParams();
  const tabIndex = searchParams?.get('tab') === 'custom' ? 1:0;
  
  const router = useRouter();
  function onTabselected(index: number){
    const tab = index == 1 ? 'custom' : 'demo';
    router.push(`/?tab=${tab}`);
  }

  let tabs = React.Children.map(props.children, (child, index) => {
    return (
      <button
        className="lk-button"
        onClick={() => {
          if (onTabselected) {
            onTabselected(index);
          }
        }}
        aria-pressed={tabIndex === index}
      >
        {/* @ts-ignore */}
        {child?.props.label}
      </button>
    );
  });

  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabSelect}>{tabs}</div>
      {/* @ts-ignore */}
      {props.children[tabIndex]}
    </div>
  );
}

function DemoMeeting(props: {label: string}){
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const startMeeting = () => {
    if (e2ee) {
      router.push(`/rooms/${generateroomId()}#${encodePassphrase(sharedPassphrase)}`);
    } else {
      router.push(`/rooms/${generateroomId()}`);
    }
  };

  return(
    <div className = {styles.tabContent}>
      <p style={{marginBottom: '1rem'}}>Try LIVEARENA</p>
      <button style = {{marginTop: '1rem'}} className="lk-button" onClick={startMeeting}>
        Start Meeting
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <input
            id="use-e2ee"
            type="checkbox"
            checked={e2ee}
            onChange={(ev) => setE2ee(ev.target.checked)}
          ></input>
          <label htmlFor ="use-e2ee">Enable end to end Encryption</label>
          </div>
          {e2ee && (
            <div style = {{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
            <label htmlFor = "passphrase">Passphrase</label>
            <input 
            id = "passphrase"
            type = 'password'
            value = {sharedPassphrase}
            onChange = {(ev)=> setSharedPassphrase(ev.target.value)}
            />
            </div>
          )}
          </div>
    </div>
  );
}

function CustomConnectionTab(props: {label: string}){
  const Router = useRouter();

  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));


  const onSubmit : React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const serverURL= formData.get('severURL');
    const token = formData.get('token');

    if(e2ee){
      Router.push('/custom/?livekiturl=${serverURL}&token=${token}#${encodePassphrase(sharedPassphrase)}');
    }else{
      Router.push('/custom/?livekiturl=${serverURL}&token=${token}');
    }
};
 return (
  <form className = {styles.form} onSubmit = {onSubmit}>
    <p style={{marginBottom: 0}}>
      Connect liveArena meet with a livekit cloud server.
    </p>
    <input 
    id = "serverURL"
    name = "serverURL"
    type = "url"
    placeholder = "Livekit server URL : wss://*.livekit.cloud"
    required 
    />
    <textarea 
    id = "token"
    name = " token"
    placeholder="token"
    required 
    rows={5}
    style = {{padding: '1px 2px ', fontSize: 'inherit', lineHeight: 'inherit'}}
   />
   <div style = {{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
    <div style = {{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
      <input 
      id = "use-e2ee"
      type = "checkbox"
      checked = {e2ee}
      onChange = {(ev) => setE2ee(ev.target.checked)}
      ></input>
      <label htmlFor = "use-e2ee">Enable end to end Encryption</label>
    </div>
    {e2ee && (
      <div style = {{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
        <label htmlFor="passphrase">Passphrase</label>
        <input
        id = "passphrase"
        type = "password"
        value = {sharedPassphrase}
        onChange = {(ev) => setSharedPassphrase(ev.target.value)}
        />
      </div>
    )}
 </div> 

 <hr
 style={{width: '100%', borderColor: 'rgba(225,225,225,0.15', marginBlock :'1rem'}}
 />
 <button
        style={{ paddingInline: '1.25rem', width: '100%' }}
        className="lk-button"
        type="submit"
      >
        Connect
      </button>
    </form>
  );
}
 

export default function Page(){
  return (
    <><div className={styles.main} data-lk-theme="default">
      <div className="header">
        <img src="/images/livearena.png" alt="livearena" width="360" height="45" />
        <h2>
          Video Confrence App built upon {''}
          <a href="https://github.com/livekit/components-js?ref=meet" rel="noopener">
            LiveKit&nbsp;Components
          </a>
          ,{''}
          and Next.js.
        </h2>
      </div>
      <Suspense fallback="Loading">
          <div>
            <DemoMeeting label="Demo" />
            <CustomConnectionTab label="Custom" />
          </div>
        </Suspense>
      </div>
    </>
  );
}