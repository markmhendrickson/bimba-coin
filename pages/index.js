import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { showBlockstackConnect } from '@stacks/connect';
import { UserSession, AppConfig } from '@stacks/auth';
import { openContractCall } from '@stacks/connect';

const appConfig = new AppConfig()
const userSession = new UserSession({ appConfig })

let appName = "Bimba Coin"
let imagePath = '/images/bimba.jpeg'

export default function Home() {
  function authenticate() {
    showBlockstackConnect({
      redirectTo: '/',
      finished: ({ userSession }) => {
        console.log('Authenticated!');
      },
      appDetails: {
        name: appName,
        icon: window.location.origin + imagePath
      }
    })
  }

  function isUserSignedIn() {
    console.log(userSession.isUserSignedIn());
  }

  function getUserData() {
    console.log(userSession.loadUserData());
  }

  function callContract() {
    const myStatus = 'hey there';
    const options = {
      contractAddress: 'ST22T6ZS7HVWEMZHHFK77H4GTNDTWNPQAX8WZAKHJ',
      contractName: 'status',
      functionName: 'write-status!',
      functionArgs: [
        {
          type: 'buff',
          value: myStatus,
        },
      ],
      appDetails: {
        name: appName,
        icon: window.location.origin + imagePath
      },
      finished: data => {
        console.log('TX ID:', data.txId);
        console.log('Raw TX:', data.txRaw);
      },
    };

    openContractCall(options);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{appName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <img src={imagePath} className={styles.photo} />
        <h1 className={styles.title}>
          {appName}
        </h1>
        <button className={styles.button} onClick={authenticate}>authenticate</button>
        <button className={styles.button} onClick={isUserSignedIn}>isUserSignedIn</button>
        <button className={styles.button} onClick={getUserData}>getUserData</button>
        <button className={styles.button} onClick={callContract}>openContractCall</button>
      </main>
    </div>
  )
}
