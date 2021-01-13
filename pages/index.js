import Head from 'next/head'
import styles from '../styles/Home.module.css'
import BN from 'bn.js';
import { StackingClient } from '@stacks/stacking';
import { StacksTestnet } from '@stacks/network';

import { 
  showConnect,
  UserSession, 
  AppConfig, 
  openContractCall, 
  openContractDeploy } from '@stacks/connect';

import {
  makeRandomPrivKey,
  privateKeyToString,
  getAddressFromPrivateKey,
  TransactionVersion,
} from '@stacks/transactions';

// generate random key or use an existing key
const privateKey = privateKeyToString(makeRandomPrivKey());

// get Stacks address
const stxAddress = getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet);

// instantiate the Stacker class for testnet
const client = new StackingClient(stxAddress, new StacksTestnet());

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

let appName = "Bimba Coin";
let imagePath = '/images/bimba.jpeg';

const contractName = 'hello-world'

export default function Home() {
  function authenticate() {
    showConnect({
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

  function deployContract() {
    const codeBody = `
      (define-public (hello)
          (begin
              (print "Hello world")
              (ok u1)))
    `;

    let options = {
      contractName: contractName,
      codeBody,
      appDetails: {
        name: appName,
        icon: window.location.origin + imagePath
      },
      finished: data => {
        console.log(`deployContact finished. transaction ID: ${data.txId}`);
      },
    };

    console.log('deployContract initiate', options);

    openContractDeploy(options);
  }

  function callContract() {
    let options = {
      contractAddress: userSession.loadUserData().profile.stxAddress,
      contractName: contractName,
      functionName: 'hello',
      functionArgs: [
      ],
      appDetails: {
        name: appName,
        icon: window.location.origin + imagePath
      },
      finished: data => {
        console.log(`openContractCall finished. transaction ID: ${data.txId}, transaction raw: ${data.txRaw}`);
      },
    }

    console.log('openContractCall initiate', options);

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
        <button className={styles.button} onClick={deployContract}>deployContract</button>
        <button className={styles.button} onClick={callContract}>openContractCall</button>
      </main>
    </div>
  )
}
