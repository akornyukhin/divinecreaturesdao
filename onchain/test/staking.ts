import chai from 'chai'
import { BigNumberish } from 'ethers';

import { deployContracts } from '../../scripts/deploy';
import { 
    Staking__factory, 
    Egis__factory,
    AEgis__factory, } from '../../src/typechain'

const { expect } = chai

describe('Staking', async () => {

    describe("checking stacking operations",async () => {
        it("should dispaly EGIS balance",async () => {
            const DC = await deployContracts({mintTreasury: true})
            console.log("EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
        })

        it("should deploy distributor and staking contracts, set distibutor for stacking", async () => {

            const DC = await deployContracts({mintTreasury: true})

            expect((await DC.distributor.info(0))).to.eq(DC.staking.address)
        })

        it("should stack EGIS, sender should receive aEGIS", async () => {

            const DC = await deployContracts({mintTreasury: true})
            console.log("EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            
            // Approve staking and staking helper contact to spend deployer's TIME
            await DC.egis.approve(DC.staking.address, DC.largeApproval);

            // Stake 500k EGIS
            await DC.staking.stake("500000000000000", DC.firstSigner.address)

            expect(await DC.staking.contractBalance()).to.eq("500000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
        })

        it("should mint 5 tier 1 NFTs to staker2, should bless staker2, staker1 and staker2 should stake, staking cycle should go through, both stakers unstacke", async () => {

            const DC = await deployContracts({epochLength: 15, mintTreasury: true})

            await DC.egis.approve(DC.firstSigner.address, DC.largeApproval )
            await DC.egis.burn("9200000000000000")
            await DC.egis.transferFrom(DC.firstSigner.address, DC.secondSigner.address, "300000000000000")
            console.log(await DC.egis.balanceOf(DC.firstSigner.address))

            await DC.aegis.setBandMaster(DC.blessingHub.address)

            for (let i=0; i<5; i++) {
                await DC.nft.safeMint(DC.secondSigner.address, 3, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
            }

            await DC.nft.addBlessable(DC.blessingHub.address)

            // queue and toggle reward manager
            await DC.treasury.queue('8', DC.distributor.address);
            await DC.treasury.toggle('8', DC.distributor.address, DC.zeroAddress);

            // set distributor contract
            await DC.staking.setDistributor(DC.distributor.address);
            
            // Approve staking contact to spend deployer's EGIS
            await DC.egis.approve(DC.staking.address, DC.largeApproval)

            console.log("====1===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====1===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            // Stake 500k EGIS
            await DC.staking.stake("500000000000000", DC.firstSigner.address)

            console.log("====2===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====2===")

            expect(await DC.staking.contractBalance()).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====3===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====3===")

            // Stake 300k EGIS for staker 2
            const staking2 = Staking__factory.connect(DC.staking.address, DC.secondSigner)

            const egis2 = Egis__factory.connect(DC.egis.address, DC.secondSigner)
            await egis2.approve(staking2.address, DC.largeApproval)

            await staking2.stake("300000000000000", DC.secondSigner.address)       

            expect(await DC.staking.contractBalance()).to.eq("805414580000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("505414580000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====4===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====4===")

            expect(await DC.staking.contractBalance()).to.eq("810168818732000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("508143818732000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("302025000000000")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====5===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====5===")

            expect(await DC.staking.contractBalance()).to.eq("814951464103152")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("510887795353152")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("304063668750000")
            
            const aegis2 = AEgis__factory.connect(DC.aegis.address, DC.secondSigner)
            await aegis2.approve(staking2.address, DC.largeApproval)

            // Approve staking contact to spend deployer's aEGIS
            await DC.aegis.approve(DC.staking.address, DC.largeApproval)

            let unstakeBalance1 = await DC.aegis.balanceOf(DC.firstSigner.address)
            await DC.staking.unstake(unstakeBalance1, false)

            let unstakeBalance2 = await DC.aegis.balanceOf(DC.secondSigner.address)
            await staking2.unstake(unstakeBalance2, false)

            console.log("====6===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====6===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("510887795353152")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("304063668750000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====7===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====7===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("510887795353152")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("304063668750000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")
        })

        it("should mint 5 tier 1 NFTs to staker2, should bless staker2, staker1 should stack EGIS, should go through stacking cycle, should deposit aEGIS to staker, staker should transfer aEGIS to staker2, 2 stakers should unstake", async () => {

            const DC = await deployContracts({epochLength: 15, mintTreasury: true})
            await DC.egis.burn("9500000000000000")
            await DC.aegis.setBandMaster(DC.blessingHub.address)

            for (let i=0; i<5; i++) {
                await DC.nft.safeMint(DC.secondSigner.address, 3, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
            }

            await DC.nft.addBlessable(DC.blessingHub.address)
            // queue and toggle reward manager
            await DC.treasury.queue('8', DC.distributor.address);
            await DC.treasury.toggle('8', DC.distributor.address, DC.zeroAddress);

            // set distributor contract and warmup contract
            await DC.staking.setDistributor(DC.distributor.address);
            
            // Approve staking contact to spend deployer's EGIS
            await DC.egis.approve(DC.staking.address, DC.largeApproval)

            console.log("====1===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====1===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            // Stake 500k EGIS
            await DC.staking.stake("500000000000000", DC.firstSigner.address) 

            console.log("====2===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====2===")

            expect(await DC.staking.contractBalance()).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====3===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====3===")

            // Stake 300k EGIS for staker 2
            const staking2 = Staking__factory.connect(DC.staking.address, DC.secondSigner)

            await DC.aegis.transfer(DC.secondSigner.address, "300000000000000")

            expect(await DC.staking.contractBalance()).to.eq("502700000000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("202700000000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====4===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====4===")

            expect(await DC.staking.contractBalance()).to.eq("505819580000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("203794580000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("302025000000000")
            

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====5===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====5===")

            expect(await DC.staking.contractBalance()).to.eq("508958739482000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("204895070732000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("304063668750000")
            
            const aegis2 = AEgis__factory.connect(DC.aegis.address, DC.secondSigner)
            await aegis2.approve(staking2.address, DC.largeApproval)

            // Approve staking contact to spend deployer's aEGIS
            await DC.aegis.approve(DC.staking.address, DC.largeApproval)

            let unstakeBalance1 = await DC.aegis.balanceOf(DC.firstSigner.address)
            await DC.staking.unstake(unstakeBalance1, false)

            let unstakeBalance2 = await DC.aegis.balanceOf(DC.secondSigner.address)
            await staking2.unstake(unstakeBalance2, false)

            console.log("====6===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====6===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("204895070732000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("304063668750000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====7===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====7===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("204895070732000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("304063668750000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")
        })

        it("should mint one tier0 NFT, should stack part of EGIS, should go through stacking cycle, should stack more EGIS, should go through stacking cycle, unstack partly, rebase, unstack fully", async () => {

            const DC = await deployContracts({epochLength: 15, mintTreasury: true})
            await DC.egis.burn("9500000000000000")

            await DC.aegis.setBandMaster(DC.blessingHub.address)

            await DC.nft.safeMint(DC.firstSigner.address, 10, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")

            await DC.nft.addBlessable(DC.blessingHub.address)

            // Unix time first epoch occurs
            const firstEpochTime = Math.floor(Date.now() / 1000) + 35
            console.log("firstEpochTime: %s", firstEpochTime)

            // queue and toggle reward manager
            await DC.treasury.queue('8', DC.distributor.address);
            await DC.treasury.toggle('8', DC.distributor.address, DC.zeroAddress);

            // set distributor contract and warmup contract
            await DC.staking.setDistributor(DC.distributor.address);
            
            // Approve staking contact to spend deployer's EGIS
            await DC.egis.approve(DC.staking.address, DC.largeApproval)

            console.log("====1===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====1===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")

            // Stake 500k EGIS
            await DC.staking.stake("300000000000000", DC.firstSigner.address)

            console.log("====2===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====2===")

            expect(await DC.staking.contractBalance()).to.eq("300000000000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("200000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("300000000000000")

            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            await sleep(15000)

            console.log("15 seconds passed")

            await DC.staking.rebase()

            console.log("====3===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====3===")

            expect(await DC.staking.contractBalance()).to.eq("302025000000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("200000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("302025000000000")

            await DC.staking.stake("200000000000000", DC.firstSigner.address)

            console.log("====4===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====4===")

            expect(await DC.staking.contractBalance()).to.eq("504063668750000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("504063668750000")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====5===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====5===")

            expect(await DC.staking.contractBalance()).to.eq("507466098514062")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("507466098514062")

            // Approve staking contact to spend deployer's aEGIS
            await DC.aegis.approve(DC.staking.address, DC.largeApproval)

            await DC.staking.unstake("100000000000000", false)

            console.log("====6===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====6===")

            expect(await DC.staking.contractBalance()).to.eq("407466098514062")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("100000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("407466098514062")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====7===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====7===")

            expect(await DC.staking.contractBalance()).to.eq("410216494679031")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("100000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("410216494679031")

            let unstakeBalance1 = await DC.aegis.balanceOf(DC.firstSigner.address)
            await DC.staking.unstake(unstakeBalance1, false)

            console.log("====8===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====8===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("510216494679031")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====9===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("====9===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("510216494679031")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
        })

        it("should mint 3 tier1 NFT to staker 1, 2 stakers stake, staker1 transfer NFT to staker2, bless should be updated, staking cycle, both unstak", async () => {
            const DC = await deployContracts({epochLength: 15, mintTreasury: true})

            await DC.egis.approve(DC.firstSigner.address, DC.largeApproval )
            await DC.egis.burn("9200000000000000")
            await DC.egis.transferFrom(DC.firstSigner.address, DC.secondSigner.address, "300000000000000")

            await DC.aegis.setBandMaster(DC.blessingHub.address)

            for (let i=0; i<3; i++) {
                await DC.nft.safeMint(DC.firstSigner.address, 3, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
            }

            await DC.nft.addBlessable(DC.blessingHub.address)
            // queue and toggle reward manager
            await DC.treasury.queue('8', DC.distributor.address);
            await DC.treasury.toggle('8', DC.distributor.address, DC.zeroAddress);

            // set distributor contract and warmup contract
            await DC.staking.setDistributor(DC.distributor.address);
            
            // Approve staking contact to spend deployer's EGIS
            await DC.egis.approve(DC.staking.address, DC.largeApproval)

            console.log("====1===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====1===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            // Stake 500k EGIS
            await DC.staking.stake("500000000000000", DC.firstSigner.address) 

            console.log("====2===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====2===")

            expect(await DC.staking.contractBalance()).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====3===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====3===")

            // Stake 300k EGIS for staker 2
            const staking2 = Staking__factory.connect(DC.staking.address, DC.secondSigner)

            const egis2 = Egis__factory.connect(DC.egis.address, DC.secondSigner)
            await egis2.approve(staking2.address, DC.largeApproval)

            await staking2.stake("300000000000000", DC.secondSigner.address) 

            expect(await DC.staking.contractBalance()).to.eq("806229282050000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("506229282050000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====4===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====4===")

            expect(await DC.staking.contractBalance()).to.eq("810992965891530")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("509372965891530")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("301620000000000")


            console.log("Transferring NFT")
            await DC.nft.transferFrom(DC.firstSigner.address, DC.secondSigner.address, 0)
            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====5===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====5===")

            expect(await DC.staking.contractBalance()).to.eq("815728826708925")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("512398641308925")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("303330185400000")
            
            const aegis2 = AEgis__factory.connect(DC.aegis.address, DC.secondSigner)
            await aegis2.approve(staking2.address, DC.largeApproval)

            // Approve staking contact to spend deployer's aEGIS
            await DC.aegis.approve(DC.staking.address, DC.largeApproval)

            let unstakeBalance1 = await DC.aegis.balanceOf(DC.firstSigner.address)
            await DC.staking.unstake(unstakeBalance1, false)

            let unstakeBalance2 = await DC.aegis.balanceOf(DC.secondSigner.address)
            await staking2.unstake(unstakeBalance2, false)

            console.log("====6===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====6===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("512398641308925")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("303330185400000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====7===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====7===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("512398641308925")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("303330185400000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")
        })

         it("should mint 5 tier1 NFTs to staker2, should bless staker2, staker1 and staker2 should stake, staking cycle should go through, should change staking rates mid-way,both stakers unstacke", async () => {

            const DC = await deployContracts({epochLength: 15, mintTreasury: true})

            await DC.egis.approve(DC.firstSigner.address, DC.largeApproval )
            await DC.egis.burn("9200000000000000")
            await DC.egis.transferFrom(DC.firstSigner.address, DC.secondSigner.address, "300000000000000")

            // New stacking rates
            let newRates: BigNumberish[] = [ 2000, 2050, 2100, 2150, 2200, 2250, 2300, 2350, 2400, 2450, 2500 ]

            await DC.aegis.setBandMaster(DC.blessingHub.address)

            for (let i=0; i<5; i++) {
                await DC.nft.safeMint(DC.secondSigner.address, 3, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
            }

            await DC.nft.addBlessable(DC.blessingHub.address)

            // queue and toggle reward manager
            await DC.treasury.queue('8', DC.distributor.address);
            await DC.treasury.toggle('8', DC.distributor.address, DC.zeroAddress);

            // set distributor contract and warmup contract
            await DC.staking.setDistributor(DC.distributor.address);
            
            // Approve staking contact to spend deployer's EGIS
            await DC.egis.approve(DC.staking.address, DC.largeApproval)

            console.log("====1===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====1===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            // Stake 500k EGIS
            await DC.staking.stake("500000000000000", DC.firstSigner.address)

            console.log("====2===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====2===")

            expect(await DC.staking.contractBalance()).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("500000000000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====3===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====3===")

            // Stake 300k EGIS for staker 2
            const staking2 = Staking__factory.connect(DC.staking.address, DC.secondSigner)

            const egis2 = Egis__factory.connect(DC.egis.address, DC.secondSigner)
            await egis2.approve(staking2.address, DC.largeApproval)

            await staking2.stake("300000000000000", DC.secondSigner.address)       

            expect(await DC.staking.contractBalance()).to.eq("805414580000000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("505414580000000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("300000000000000")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====4===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====4===")

            expect(await DC.staking.contractBalance()).to.eq("810168818732000")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("508143818732000")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("302025000000000")

            // Apply new rates to staking
            newRates.map(async (value, i) => {
                await DC.aegis.updateBandRate(i, value)
            })

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====5===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====5===")

            expect(await DC.staking.contractBalance()).to.eq("811940168869464")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("509160106369464")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("0")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("302780062500000")
            
            const aegis2 = AEgis__factory.connect(DC.aegis.address, DC.secondSigner)
            await aegis2.approve(staking2.address, DC.largeApproval)

            // Approve staking contact to spend deployer's aEGIS
            await DC.aegis.approve(DC.staking.address, DC.largeApproval)

            let unstakeBalance1 = await DC.aegis.balanceOf(DC.firstSigner.address)
            await DC.staking.unstake(unstakeBalance1, false)

            let unstakeBalance2 = await DC.aegis.balanceOf(DC.secondSigner.address)
            await staking2.unstake(unstakeBalance2, false)

            console.log("====6===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====6===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("509160106369464")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("302780062500000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")

            await sleep(15000)

            console.log("15 seconds passed")
            await DC.staking.rebase()

            console.log("====7===")
            console.log("Stacking EGIS balance: %s", await DC.staking.contractBalance())
            console.log("Staker1 EGIS balance: %s", await DC.egis.balanceOf(DC.firstSigner.address))
            console.log("Staker1 AEGIS balance: %s", await DC.aegis.balanceOf(DC.firstSigner.address))
            console.log("Staker2 EGIS balance: %s", await DC.egis.balanceOf(DC.secondSigner.address))
            console.log("Staker2 AEGIS balance: %s", await DC.aegis.balanceOf(DC.secondSigner.address))
            console.log("====7===")

            expect(await DC.staking.contractBalance()).to.eq("0")
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq("509160106369464")
            expect(await DC.aegis.balanceOf(DC.firstSigner.address)).to.eq("0")
            expect(await DC.egis.balanceOf(DC.secondSigner.address)).to.eq("302780062500000")
            expect(await DC.aegis.balanceOf(DC.secondSigner.address)).to.eq("0")
        })
    })
})