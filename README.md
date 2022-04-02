<h1>Divine Creatures DAO</h1>

Fantom Testnet version: https://testnet.divinedao.finance/

<h2>Team</h2>

<a href="https://github.com/cotyar">@cotyar</a><br>
Technical lead, smart contracts overseeing, UI development

@iamspector: <a href="https://github.com/iamspector">GitHub</a>, <a href="https://www.linkedin.com/in/dshmelev/">LinkedIn</a><br>
Contracts deployment, UI development

<a href="https://linktr.ee/alexdatascience">@akornyukhin</a><br>
Smart contracts development and unit testing, deployment and UI development support

<h2>What has changed</h2>

1. Deduplication in contract definitions.
2. typechain-based typescript codegen added for all contracts.
3. Deployment and UI use the same contract and typescriot definitions now.
4. All contracts got retested. 
5. Automated tests added for Tokens, Bonding logic, Staking logic, Treasury, etc.
6. A number of issues in calculation logic got fixed.
7. Token contracts got moved to Zeppelin IERC/ERC-s where possible.
8. Latest Uniswap contract were taken for safemath as a temporal measure.
11. Completely re-written from the ground up and vastly simplified a very lightweight UI.

<h2>Protocol changes/updates</h2>

1. Overall code cleaning - added imports instead of code in the contracts, migreated to OpenZeppelin, etc.
2. Divine Creatures NFTs, which bring utility to the holders in the form of discounts for bonds and boosting for staking. The benefits are based on NFT Tier:
* Tier 1 - 5% staking, 5% bonding per NFT, max 25% in each
* Tier 2 - 2.5% staking, 5% bonding per NFT, max 25% in each
* Tier 3 - 2.5% bonding per NFT, max 25% in each

3. Staking boosting is realised via breaking the stacked Egis into different brackets based on holder's boosting band.
4. aEgis was redisigned:
* No weird gons and gonsPerFragment, now using straightforward 5th grade math for calculations
* Staking bands implemented to accuratly calculate Egis minting amount for each rebase and holders' balances
* Additional support functions to move holder's from band to band, partial staking and unstaking
* The bands migration are triggered by NFT transfers

5. Bonds were updated to apply discounts based on holder's band

Please note that some checks in Bonds (vesting term) are adjusted for testing purposes, the production vesting term will be 5 days for bonds.
Same apply to staking rebase time - production rebase time will be 8 hours.
The commented minting bit in Egis constructor is for initial supply minting for presale.

<h2>To run the tests</h1>

```
npm i
cd onchain
npx hardhat compile
npx hardhat test
```

<h2>To setup local version</h1>
Prerequisites: install <a href="https://trufflesuite.com/ganache/index.html">Ganache</a>

```
npm i
cd onchain
npx hardhat compile
npx hardhat run --network ganacheui ../scripts/deployToNet.ts
cd ..
npm run
```

If you will face some problem reaching for the contracts from UI check Ganache port - the repo is configured to listen to ```7545```
