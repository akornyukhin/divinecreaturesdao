import chai from 'chai'

import { deployContracts } from '../../scripts/deploy';

const { expect } = chai

enum MANAGING { 
    RESERVEDEPOSITOR, 
    RESERVESPENDER, 
    RESERVETOKEN, 
    RESERVEMANAGER, 
    LIQUIDITYDEPOSITOR, 
    LIQUIDITYTOKEN, 
    LIQUIDITYMANAGER, 
    DEBTOR, 
    REWARDMANAGER, 
    SOHM 
}

describe('MimBonds', async () => {

    describe('Checking bond operations', async () => {
        it('should add bond to treasury', async () => {
            const DC = await deployContracts({mintTreasury: true})
            // queue and toggle MIM bond reserve depositor
            await DC.treasury.queue(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address)
            await DC.treasury.toggle(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address, DC.zeroAddress)
            
            const mimBondAddress = DC.mimBond.address
            const treasuryDepositorAddress = await DC.treasury.reserveDepositors(1)
            expect(treasuryDepositorAddress).to.eq(mimBondAddress)
        })

        it('should set bond terms', async () => {
            const DC = await deployContracts({mintTreasury: true})
            // Set MIM Bond terms
            await DC.mimBond.initializeBondTerms(DC.mimBondBCV, DC.minBondPrice, DC.maxBondPayout, DC.bondFee, DC.maxBondDebt, DC.bondVestingLength);
            const mimBondTerms = await DC.mimBond.terms()
            expect(mimBondTerms['controlVariable']).to.eq(369)
            expect(mimBondTerms['minimumPrice']).to.eq(2000)
            expect(mimBondTerms['maxPayout']).to.eq(1000)
            expect(mimBondTerms['fee']).to.eq(100)
            expect(mimBondTerms['maxDebt']).to.eq("100000000000000000000000000")
            expect(mimBondTerms['vestingTerm']).to.eq(10)
        })

        it('should deposit bond, be redeemed by user and DAO should receive fees', async () => {
            const DC = await deployContracts({mintTreasury: true})

            await DC.egis.approve(DC.firstSigner.address, DC.largeApproval )
            await DC.egis.transferFrom(DC.firstSigner.address, DC.secondSigner.address, "10000000000000000")
            // Bond 1,000 MIM in each of their bonds
            await DC.mim.approve(DC.mimBond.address, DC.largeApproval );

            // queue and toggle MIM bond reserve depositor
            await DC.treasury.queue(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address)
            await DC.treasury.toggle(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address, DC.zeroAddress)

            await DC.mimBond.initializeBondTerms(DC.mimBondBCV, DC.minBondPrice, DC.maxBondPayout, DC.bondFee, DC.maxBondDebt, DC.bondVestingLength)
            await DC.mimBond.deposit('1000000000000000000000', '60000', DC.firstSigner.address )


            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            console.log('Waiting 11 seconds')
            await sleep(11000)
            await DC.mimBond.redeem(DC.firstSigner.address, false);
            expect(await DC.egis.balanceOf(DC.firstSigner.address)).to.eq(505000000000)
        })

        it('should set adjustment for bonds', async () => {
            const DC = await deployContracts({mintTreasury: true})
            await DC.mimBond.initializeBondTerms(DC.mimBondBCV, DC.minBondPrice, DC.maxBondPayout, DC.bondFee, DC.maxBondDebt, DC.bondVestingLength)
            await DC.mimBond.setAdjustment(true, 5, 500, 60)
        
            const mimBondAdjustment = await DC.mimBond.adjustment()
            expect(mimBondAdjustment['add']).to.eq(true)
            expect(mimBondAdjustment['rate']).to.eq(5)
            expect(mimBondAdjustment['target']).to.eq(500)
            expect(mimBondAdjustment['buffer']).to.eq(60)
        })

        it('should check if the bond terms were adjusted', async () => {
            const DC = await deployContracts({mintTreasury: true})
            await DC.egis.approve(DC.firstSigner.address, DC.largeApproval )
            await DC.egis.transferFrom(DC.firstSigner.address, DC.secondSigner.address, "10000000000000000")
            // Bond 1,000 MIM in each of their bonds
            await DC.mim.approve(DC.mimBond.address, DC.largeApproval );
        
            // queue and toggle MIM bond reserve depositor
            await DC.treasury.queue(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address)
            await DC.treasury.toggle(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address, DC.zeroAddress)
        
            await DC.mimBond.initializeBondTerms(DC.mimBondBCV, DC.minBondPrice, DC.maxBondPayout, DC.bondFee, DC.maxBondDebt, DC.bondVestingLength)
            await DC.mimBond.setAdjustment(true, 5, 500, 10)
        
            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            await sleep(10000)
        
            console.log("\n 1st deposit")
            await DC.mimBond.deposit('1000000000000000000000', '60000', DC.firstSigner.address )
        
            let mimBondTerms = await DC.mimBond.terms()
            expect(mimBondTerms['controlVariable']).to.eq(374)
            expect(mimBondTerms['maxPayout']).to.eq(1000)
            expect(mimBondTerms['fee']).to.eq(100)
            expect(mimBondTerms['maxDebt']).to.eq("100000000000000000000000000")
            expect(mimBondTerms['vestingTerm']).to.eq(10)
        
            console.log("\n 2nd deposit")
            await DC.mimBond.deposit('1000000000000000000000', '60000', DC.firstSigner.address )
            
            mimBondTerms = await DC.mimBond.terms()
            expect(mimBondTerms['controlVariable']).to.eq(374)
            expect(mimBondTerms['maxPayout']).to.eq(1000)
            expect(mimBondTerms['fee']).to.eq(100)
            expect(mimBondTerms['maxDebt']).to.eq("100000000000000000000000000")
            expect(mimBondTerms['vestingTerm']).to.eq(10)
        
            await sleep(10000)
        
            console.log("\n 3rd deposit")
            await DC.mimBond.deposit('1000000000000000000000', '60000', DC.firstSigner.address )
            
            mimBondTerms = await DC.mimBond.terms()
            expect(mimBondTerms['controlVariable']).to.eq(379)
            expect(mimBondTerms['maxPayout']).to.eq(1000)
            expect(mimBondTerms['fee']).to.eq(100)
            expect(mimBondTerms['maxDebt']).to.eq("100000000000000000000000000")
            expect(mimBondTerms['vestingTerm']).to.eq(10)
            
            console.log("\n 1st redeem")
            await DC.mimBond.redeem(DC.firstSigner.address, false)
            let egisBalance = await DC.egis.balanceOf(DC.firstSigner.address)
            // console.log(egisBalance)
            expect(egisBalance).to.eq(1065000000000)

            await sleep(7000)

            console.log("\n 2nd redeem")
            await DC.mimBond.redeem(DC.firstSigner.address, false)
            egisBalance = await DC.egis.balanceOf(DC.firstSigner.address)
            // console.log(egisBalance)
            expect(egisBalance).to.eq(1414965000000)

            await sleep(4000)

            console.log("\n 3rd redeem")
            await DC.mimBond.redeem(DC.firstSigner.address, false);
            egisBalance = await DC.egis.balanceOf(DC.firstSigner.address)
            // console.log(egisBalance)
            expect(egisBalance).to.eq(1515000000000)
        })

        it('should apply discount to bond price', async () => {
            const DC = await deployContracts({mintTreasury: true})
            await DC.egis.approve(DC.firstSigner.address, DC.largeApproval )
            await DC.egis.transferFrom(DC.firstSigner.address, DC.secondSigner.address, "10000000000000000")

            for (let i=0; i<5; i++) {
                console.log("===")
                await DC.nft.safeMint(DC.firstSigner.address, 3, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
                console.log("===")
            }

            // Bond 1,000 MIM in each of their bonds
            await DC.mim.approve(DC.mimBond.address, DC.largeApproval)
        
            // queue and toggle MIM bond reserve depositor
            await DC.treasury.queue(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address)
            await DC.treasury.toggle(MANAGING.RESERVEDEPOSITOR, DC.mimBond.address, DC.calculator.address)
        
            await DC.mimBond.initializeBondTerms(DC.mimBondBCV, DC.minBondPrice, DC.maxBondPayout, DC.bondFee, DC.maxBondDebt, "20")
            await DC.mimBond.setAdjustment(true, 5, 50000, 5)
            await DC.mimBond.setDiscountMaster(DC.blessingHub.address)
        
            const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))
            await sleep(6000)

            for (let i = 1; i <= 5; i++) {
                console.log(`====Bond deposit ${i}====`)
                await DC.mimBond.deposit('1000000000000000000000', '50000', DC.firstSigner.address )
                await sleep(6000)
                console.log(`========`)

                if ( i == 4 ){
                    console.log("Transferring NFT to another owner")
                    DC.nft.transferFrom(DC.firstSigner.address, DC.secondSigner.address, 0)
                }
            }

            await sleep(15000)

            console.log("mimBond redeem")
            await DC.mimBond.redeem(DC.firstSigner.address, false);
            const egisBalance = await DC.egis.balanceOf(DC.firstSigner.address)
            console.log(egisBalance)
            expect(egisBalance).to.eq(2525000000000)
        })
    })
})