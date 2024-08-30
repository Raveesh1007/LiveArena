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

function DemoMeeting(){
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
    <div className = {styles.tabSelect}>
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
}


    
})