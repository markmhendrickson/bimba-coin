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

  function getAddress() {
    console.log(stxAddress);
  }

  async function stackingInfo() {
    // will Stacking be executed in the next cycle?
    const stackingEnabledNextCycle = await client.isStackingEnabledNextCycle();
    // true or false
    console.log("will Stacking be executed in the next cycle?", stackingEnabledNextCycle);

    // how long (in seconds) is a Stacking cycle?
    const cycleDuration = await client.getCycleDuration();
    // 120
    console.log("how long (in seconds) is a Stacking cycle?", cycleDuration);

    // how much time is left (in seconds) until the next cycle begins?
    const secondsUntilNextCycle = await client.getSecondsUntilNextCycle();
    // 600000
    console.log("how much time is left (in seconds) until the next cycle begins?", secondsUntilNextCycle);
  }

  async function poxInfo() {
    const poxInfo = await client.getPoxInfo();
    console.log(poxInfo);
    return poxInfo;
  }

  async function coreInfo() {
    const coreInfo = await client.getCoreInfo();
    console.log(coreInfo);
    return coreInfo;
  }

  async function targetBlocktime() {
    const targetBlocktime = await client.getTargetBlockTime();
    console.log(targetBlocktime);
  }
  
  async function hasMinimumSTX() {
    const hasMinStxAmount = await client.hasMinimumStx();
    console.log(hasMinStxAmount);
  }

  async function stackingElegibility() {
    // user supplied parameters
    let btcAddress = '1Xik14zRm29UsyS6DjhYg4iZeZqsDa8D3';
    let numberOfCycles = 3;

    const stackingEligibility = await client.canStack({
      poxAddress: btcAddress,
      cycles: numberOfCycles,
    });

    console.log(stackingEligibility);
  }

  async function lockSTX() {
    // set the amount to lock in microstacks
    const amountMicroStx = new BN(100000000000);

    // set the burnchain (BTC) block for stacking lock to start
    // you can find the current burnchain block height from coreInfo above
    // and adding 3 blocks to provide a buffer for transaction to confirm
    const coreInfo = await this.coreInfo();
    const burnBlockHeight = coreInfo.burn_block_height + 3;

    // execute the stacking action by signing and broadcasting a transaction to the network
    client
      .stack({
        amountMicroStx,
        poxAddress: btcAddress,
        cycles: numberOfCycles,
        privateKey,
        burnBlockHeight,
      })
      .then(response => {
        // If successful, stackingResults will contain the txid for the Stacking transaction
        // otherwise an error will be returned
        if (response.hasOwnProperty('error')) {
          console.log(response.error);
          throw new Error('Stacking transaction failed');
        } else {
          console.log(`txid: ${response}`);
          // txid: f6e9dbf6a26c1b73a14738606cb2232375d1b440246e6bbc14a45b3a66618481
          return response;
        }
      });
  }

  async function confirmLock() {
    const { TransactionsApi } = require('@stacks/blockchain-api-client');
    const tx = new TransactionsApi(apiConfig);

    const waitForTransactionSuccess = txId =>
      new Promise((resolve, reject) => {
        const pollingInterval = 3000;
        const intervalID = setInterval(async () => {
          const resp = await tx.getTransactionById({ txId });
          if (resp.tx_status === 'success') {
            // stop polling
            clearInterval(intervalID);
            // update UI to display stacking status
            return resolve(resp);
          }
        }, pollingInterval);
      });

    // note: txId should be defined previously
    const resp = await waitForTransactionSuccess(txId);
    console.log(resp);
  }

  async function stackingStatus() {
    const stackingStatus = await client.getStatus();
    console.log(stackingStatus);
  }

  function delegateStacking() {
    let poxInfo = await this.poxInfo();
    let contractAddress = poxInfo.contract_id.split('.')[0];
    let contractName = poxInfo.contract_id.split('.')[1];

    const coreInfo = await this.coreInfo();
    const burnBlockHeight = coreInfo.burn_block_height + 3;

    let options = {
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: 'delegate-stx',
      functionArgs: [
        "amount-ustx": "100000000000",
        "delegate-to": contractAddress
        "until-burn-ht": coreInfo.burn_block_height + 100,
        "pox-addr": "1Xik14zRm29UsyS6DjhYg4iZeZqsDa8D3"
      ],
      appDetails: {
        name: appName,
        icon: window.location.origin + imagePath
      },
      finished: data => {
        console.log(`delegateStacking finished. transaction ID: ${data.txId}, transaction raw: ${data.txRaw}`);
      },
    }

    console.log('delegateStacking initiate', options);

    openContractCall(options);
  }

  function revokeStacking() {
    let poxInfo = await this.poxInfo();
    let contractAddress = poxInfo.contract_id.split('.')[0];
    let contractName = poxInfo.contract_id.split('.')[1];

    const coreInfo = await this.coreInfo();
    const burnBlockHeight = coreInfo.burn_block_height + 3;

    let options = {
      contractAddress: contractAddress,
      contractName: contractName,
      functionName: 'revoke-delegate-stx',
      appDetails: {
        name: appName,
        icon: window.location.origin + imagePath
      },
      finished: data => {
        console.log(`delegateStacking finished. transaction ID: ${data.txId}, transaction raw: ${data.txRaw}`);
      },
    }

    console.log('delegateStacking initiate', options);

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
        <button className={styles.button} onClick={getAddress}>getAddress</button>
        <button className={styles.button} onClick={stackingInfo}>stackingInfo</button>
        <button className={styles.button} onClick={poxInfo}>poxInfo</button>
        <button className={styles.button} onClick={coreInfo}>coreInfo</button>
        <button className={styles.button} onClick={targetBlocktime}>targetBlocktime</button>
        <button className={styles.button} onClick={hasMinimumSTX}>hasMinimumSTX</button>
        <button className={styles.button} onClick={stackingElegibility}>stackingElegibility</button>
        <button className={styles.button} onClick={lockSTX}>lockSTX</button>
        <button className={styles.button} onClick={confirmLock}>confirmLock</button>
        <button className={styles.button} onClick={stackingStatus}>stackingStatus</button>
        <button className={styles.button} onClick={delegateStacking}>delegateStacking</button>
        <button className={styles.button} onClick={revokeStacking}>revokeStacking</button>
      </main>
    </div>
  )
}
