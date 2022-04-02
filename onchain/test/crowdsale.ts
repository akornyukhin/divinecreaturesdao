import { ethers } from 'hardhat'
import chai from 'chai'

import { Egis__factory, MagicInternetMoneyV1__factory, Treasury__factory, Crowdsale__factory } from '../../src/typechain'

const { expect } = chai

describe('Token Crowdsale', async () => {
    describe("Token crowdsale function check", async() => {
        it("should receive mim and return egis", async() => {
        
            // Deployer and MockDAO adddresses
            const [deployer, firstBuyer, secondBuyer] = await ethers.getSigners()
    
            // Initial MIM amount
            const mimAmount = '10002500000000000000000000'
    
            // Large number for approval for MIM
            const largeApproval = '100000000000000000000000000000000'
    
            // Ethereum 0 address, used when toggling changes in treasury
            const zeroAddress = '0x0000000000000000000000000000000000000000'
    
            // Deploy EGIS
            const egis = await new Egis__factory(deployer).deploy()
    
            // Deploy MIM
            // Need to check what is the Fantom StableCoin we are going to use
            const mim = await new MagicInternetMoneyV1__factory(deployer).deploy()
    
            // Deploy 10,000,000 mock MIM
            await mim.mint(deployer.address, mimAmount)
    
            // Deploy MIM to buyes
            await mim.transfer(firstBuyer.address, "1000000000000000000000")
            // // Deploy MIM to buyes
            await mim.transfer(secondBuyer.address, "1500000000000000000000")
    
            // Deploy Treasury
            const treasury = await new Treasury__factory(deployer).deploy(egis.address, mim.address, 0, 0)
    
            // Approve the treasury to spend MIM
            await mim.approve(treasury.address, largeApproval )
    
            // Set treasury for EGIS token
            await egis.setVault(treasury.address)
    
            // queue and toggle deployer reserve depositor
            await treasury.queue('0', deployer.address)
            await treasury.toggle('0', deployer.address, zeroAddress)
    
            // Deposit 10,000,000 MIM to treasury, all are in treasury as excesss reserves. We need some EGIS in circulation for bonds to work
            await treasury.deposit('10000000000000000000000000', mim.address, '99997500000000000')
            
            const openTime = Math.floor(Date.now() / 1000) + 25
            const closeTime = openTime + 60
    
            // Deploy Crowdsale
            const crowdsale = await new Crowdsale__factory(deployer).deploy(1, deployer.address, mim.address, egis.address, openTime, closeTime)
    
            let beneficiaries = [firstBuyer.address, secondBuyer.address]
            let caps = ["1000000000000000000000", "1500000000000000000000"]
    
            await crowdsale.setBatchCap(beneficiaries, caps)
    
            await egis.approve(crowdsale.address, 2500 * 1e9)
            
            const crowdsale1 = Crowdsale__factory.connect(crowdsale.address, firstBuyer)
            const crowdsale2 = Crowdsale__factory.connect(crowdsale.address, secondBuyer)

            const mim1 = MagicInternetMoneyV1__factory.connect(mim.address, firstBuyer)
            const mim2 = MagicInternetMoneyV1__factory.connect(mim.address, secondBuyer)

            await mim1.approve(crowdsale1.address, "1000000000000000000000")
            await mim2.approve(crowdsale2.address, "1500000000000000000000")

            console.log("firstBuyer MIM balance: %s", await mim.balanceOf(firstBuyer.address))
            console.log("secondBuyer MIM balance: %s", await mim.balanceOf(secondBuyer.address))

            expect(await mim.balanceOf(firstBuyer.address)).to.eq("1000000000000000000000")
            expect(await mim.balanceOf(secondBuyer.address)).to.eq("1500000000000000000000")

            await crowdsale1.buyTokens(firstBuyer.address, "1000000000000000000000");
            await crowdsale2.buyTokens(secondBuyer.address, "1500000000000000000000");

            console.log("firstBuyer MIM balance: %s", await mim.balanceOf(firstBuyer.address))
            console.log("secondBuyer MIM balance: %s", await mim.balanceOf(secondBuyer.address))
            console.log("firstBuyer EGIS balance: %s", await egis.balanceOf(firstBuyer.address))
            console.log("secondBuyer EGIS balance: %s", await egis.balanceOf(secondBuyer.address))

            expect(await mim.balanceOf(firstBuyer.address)).to.eq(0)
            expect(await mim.balanceOf(secondBuyer.address)).to.eq(0)
            expect(await egis.balanceOf(firstBuyer.address)).to.eq("1000000000000")
            expect(await egis.balanceOf(secondBuyer.address)).to.eq("1500000000000")

            console.log("deployer MIM balance: %s", await mim.balanceOf(deployer.address))
            console.log("deployer EGIS balance: %s", await egis.balanceOf(deployer.address))

            expect(await mim.balanceOf(deployer.address)).to.eq("2500000000000000000000")
            expect(await egis.balanceOf(deployer.address)).to.eq(0)
        })
    })
})