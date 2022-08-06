import * as backend from './build/index.main.mjs';

import {loadStdlib} from '@reach-sh/stdlib';

const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(100);

const [ accAlice, accBob ] =
  await stdlib.newTestAccounts(2, startingBalance);
console.log('Hello, Alice and Bob!');

console.log('Launching...');
const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

console.log(`Creator of the testing NFT`);
const theNFT = await stdlib.launchToken(accAlice, "Big toe", "NFT", { supply: 1 });
const nftParams = {
  nftId: theNFT.id,
  numTickets: 10,
}

const OUTCOME = ['your number is not a match.', 'your number is a match!']

await accBob.tokenAccept(nftParams.nftId)

const Shared = {
  getNum: (numTickets) => {
    const num = (Math.floor(Math.random() * numTickets) + 1);
    return num;
  },
  seeOutcome: (num) => {
    console.log(`The outcome is ${OUTCOME[num]}`)
  }
}

console.log('Starting backends...');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    ...Shared,
    // implement Alice's interact object here
    startRaffle: ()=> {
      console.log(`The raffle information is being sent to the contract`);
      return nftParams;
    },
    seeHash: (value) => {
      console.log(`Winning number HASH: ${value}`)
    }
  }),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    ...Shared,
    // implement Bob's interact object here
    showNum: (num) => {
      console.log(`Your raffle number is ${num}`)
    },
    seeWinner: (num) => {
      console.log(`The winning number is ${num}`)
    }
  }),
]);

console.log('Goodbye, Alice and Bob!');
