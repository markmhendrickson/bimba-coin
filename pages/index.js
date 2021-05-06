import Head from 'next/head'
import styles from '../styles/Home.module.css'
import BN from 'bn.js';
import { StacksTestnet } from '@stacks/network';
import {
  standardPrincipalCV,
  stringUtf8CV
} from "@stacks/transactions";

import { Tweet } from 'react-twitter-widgets';
import { useRouter } from 'next/router'

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

let appName = "BimbaCoin";
let imagePath = '/images/bimba.jpeg';

let creatorAddress = 'STG6XHZVNEEXTCDX634RGDHJ8X1R5C1VYHZ4Z1DA';

const contractName = 'hello-world'

export default function Home() {
  const router = useRouter()

  function authenticate() {
    showConnect({
      redirectTo: '/',
      finished: ({ userSession }) => {
        location.reload();
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
        stringUtf8CV(router.query.tweet_url)
      ],
      appDetails: {
        name: appName,
        icon: window.location.origin + imagePath
      },
      finished: data => {
        window.location.href = window.location.href += '&submitted-tweet=true';
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

  let tweet, content, admin;

  if (userSession.isUserSignedIn()) {
    if (!router.query['submitted-tweet']) {
      content = (
        <div>
          <button className={styles.button} onClick={submitTweet}>Submit Tweet</button>
        </div>
      )
    } else {
      content = (
        <div>
          <p>Your tweet has been submitted! We'll follow up on Twitter when we've approved your submission and sent you $BIMBA Coin. 🚀</p>
        </div>
      )
    }

    if(false && userSession.loadUserData().profile.stxAddress.testnet == creatorAddress) {
      admin = (
        <div>
          <input type="text" placeholder="Recipient address" id="recipient-address" />
          <button className={styles.button} onClick={grantToRecipient}>Grant $BIMBA</button>
        </div>
      )
    }
  } else {
    content = (
      <div>
        <p>Install and authenticate with the Stacks Wallet browser extension to submit your tweet.</p>
        <button className={styles.button} onClick={authenticate}>Get Started</button>
      </div>
    )
  }

  if (router.query.tweet_url) {
    let tweetId = router.query.tweet_url.split('/').pop();
    console.log(tweetId);
    tweet = <Tweet class="tweet" tweetId={tweetId} />
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{appName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {tweet}
        {content}
        {admin}
      </main>
    </div>
  )
}
