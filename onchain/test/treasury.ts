import chai from 'chai'

import { deployContracts } from '../../scripts/deploy';

const { expect } = chai

describe('Treasury', async () => {

  describe('Check initial Egis supply', async () => {
    it('should be 0', async () => {
      const DC = await deployContracts({})
      const egisInitialSupply = await DC.egis.totalSupply()
      console.log("Egis balance: " + egisInitialSupply)

      expect(egisInitialSupply).to.eq(0)
    })
  })

  describe('Checking treasury deposit', async () => {
    it('should deposit funds with 100% profit', async () => {
      const DC = await deployContracts({})
      let treasuryReserve = await DC.treasury.totalReserves()
      console.log("Starting treasury reserves balance: " + treasuryReserve)

      // Deploy 10,000,000 mock MIM
      await DC.mim.mint(DC.firstSigner.address, DC.mimAmount)
      // Approve the treasury to spend MIM
      await DC.mim.approve(DC.treasury.address, DC.largeApproval );

      // Set treasury for EGIS token
      await DC.egis.setVault(DC.treasury.address);

      // queue and toggle deployer reserve depositor
      await DC.treasury.queue('0', DC.firstSigner.address);
      await DC.treasury.toggle('0', DC.firstSigner.address, DC.zeroAddress);

      await DC.treasury.deposit('900000000000000000000000', DC.mim.address, '9000000000000000')
      treasuryReserve = await DC.treasury.totalReserves()
      console.log("treasury reservs: %s", treasuryReserve)
      expect(treasuryReserve).to.eq(9000000000000000)

      const egisBalance = await DC.egis.balanceOf(DC.firstSigner.address)
      expect(egisBalance).to.eq(0)
    })

    it('should deposit funds to treasury and mint 600k EGIS', async () => {
      const DC = await deployContracts({})
      let treasuryReserve = await DC.treasury.totalReserves()
      console.log("Starting treasury reserves balance: " + treasuryReserve)

      // Deploy 10,000,000 mock MIM
      await DC.mim.mint(DC.firstSigner.address, DC.mimAmount)
      // Approve the treasury to spend MIM
      await DC.mim.approve(DC.treasury.address, DC.largeApproval );

      // Set treasury for EGIS token
      await DC.egis.setVault(DC.treasury.address);

      // queue and toggle deployer reserve depositor
      await DC.treasury.queue('0', DC.firstSigner.address);
      await DC.treasury.toggle('0', DC.firstSigner.address, DC.zeroAddress);

      await DC.treasury.deposit('900000000000000000000000', DC.mim.address, '8400000000000000')
      treasuryReserve = await DC.treasury.totalReserves()
      expect(treasuryReserve).to.eq(9000000000000000)

      const egisBalance = await DC.egis.balanceOf(DC.firstSigner.address)
      expect(egisBalance).to.eq(600000000000000)
    })
  })
})