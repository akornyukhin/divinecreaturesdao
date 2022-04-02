import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { Auction2__factory } from '../../src/typechain'

// GANACHE TEST VALUES!!!
const addresses = {
    multiSigAddress: '0x0c8C1C6c041C95F691815B8B81ED6B0cfeFe48C9',
    wFtmAddress: '0xd54518c6114416C8Dd1bea6Bb7Cc71b8349424e5',
    nft: '0xE106c777E20Cde9C210D5F1E6FcA26354E16D46d'
}
// GANACHE TEST VALUES!!!

async function main() { 
    console.log("START")

    const [deployer]:SignerWithAddress[] = await ethers.getSigners()

    const auction = await new Auction2__factory(deployer)
        .deploy(
            addresses.multiSigAddress,
            addresses.wFtmAddress,
            addresses.nft,
            1646053575
        )

    console.log("Auction address: %s", auction.address)
    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
});