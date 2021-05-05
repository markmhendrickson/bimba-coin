import Head from 'next/head'
import styles from '../styles/Home.module.css'
import BN from 'bn.js';
import { StacksTestnet } from '@stacks/network';
import {
  standardPrincipalCV,
  stringUtf8CV
} from "@stacks/transactions";

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

const appConfig = new AppConfig();
const userSession = new UserSession({ appConfig });

let appName = "Bimba Coin";
let imagePath = '/images/bimba.jpeg';

let creatorAddress = 'STG6XHZVNEEXTCDX634RGDHJ8X1R5C1VYHZ4Z1DA';

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

  function submitTweet() {
    let options = {
      contractAddress: creatorAddress,
      contractName: 'bimba',
      functionName: 'submit-tweet',
      functionArgs: [
        stringUtf8CV(document.getElementById("tweet-url").value)
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

  function grantToRecipient() {
    let options = {
      contractAddress: creatorAddress,
      contractName: 'bimba',
      functionName: 'grant-to-recipient',
      functionArgs: [
        standardPrincipalCV(document.getElementById("recipient-address").value)
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

  let content, admin;

  if (userSession.isUserSignedIn()) {
    content = (
      <div>
        <input type="text" placeholder="Tweet URL" id="tweet-url" />
        <button className={styles.button} onClick={submitTweet}>Submit Tweet</button>
      </div>
    )

    if(userSession.loadUserData().profile.stxAddress.testnet == creatorAddress) {
      admin = (
        <div>
          <input type="text" placeholder="Recipient address" id="recipient-address" />
          <button className={styles.button} onClick={grantToRecipient}>Grant $BIMBA</button>
        </div>
      )
    }
  } else {
    content = <button className={styles.button} onClick={authenticate}>authenticate</button>
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
        {content}
        {admin}
      </main>
    </div>
  )
}
