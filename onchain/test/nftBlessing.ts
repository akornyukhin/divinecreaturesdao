import chai from 'chai'
import { NOTFOUND } from 'dns';

import { deployContracts } from '../../scripts/deploy';

const { expect } = chai

describe('Nfts and BlessingHub', async () => {

  describe('Mint three NFTS with different qualities', async () => {
    it('should mint 4 NFTS', async () => {
      const DC = await deployContracts({})

      console.log("Minting 1st NFT with quality 1")
      await DC.nft.safeMint(DC.firstSigner.address, 1, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
      expect(await DC.nft.balanceOf(DC.firstSigner.address)).to.eq(1)

      console.log("Minting 2nd NFT with quality 2")
      await DC.nft.safeMint(DC.firstSigner.address, 2, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
      expect(await DC.nft.balanceOf(DC.firstSigner.address)).to.eq(2)

      console.log("Minting 3rd NFT with quality 3")
      await DC.nft.safeMint(DC.firstSigner.address, 3, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
      expect(await DC.nft.balanceOf(DC.firstSigner.address)).to.eq(3)

      console.log("Minting 4th NFT with quality 2")
      await DC.nft.safeMint(DC.firstSigner.address, 2, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
      expect(await DC.nft.balanceOf(DC.firstSigner.address)).to.eq(4)

      console.log(await DC.nft.qualitiesByOwner(DC.firstSigner.address))
      expect(await DC.nft.qualitiesByOwner(DC.firstSigner.address)).to.eql([1, 2, 3, 2])
    })

    it('should mint 3 NFTS, calculate bond discounts', async () => {
      const DC = await deployContracts({})

      await DC.nft.addBlessable(DC.blessingHub2.address)

      console.log("Minting 1st NFT with quality 1")
      await DC.nft.safeMint(DC.firstSigner.address, 1, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
      expect(await DC.nft.balanceOf(DC.firstSigner.address)).to.eq(1)

      console.log("Minting 2nd NFT with quality 2")
      await DC.nft.safeMint(DC.firstSigner.address, 2, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
      expect(await DC.nft.balanceOf(DC.firstSigner.address)).to.eq(2)

      console.log("Minting 3rd NFT with quality 3")
      await DC.nft.safeMint(DC.firstSigner.address, 3, "https://media.wired.com/photos/598e35fb99d76447c4eb1f28/master/pass/phonepicutres-TA.jpg")
      expect(await DC.nft.balanceOf(DC.firstSigner.address)).to.eq(3)

      await DC.nft.addBlessable(DC.blessingHub2.address)

      const bondDiscount = await DC.blessingHub2.discountRate(DC.firstSigner.address)
      expect(bondDiscount).to.eq(125)
    })
  })

})