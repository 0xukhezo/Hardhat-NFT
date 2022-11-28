const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId.toString()
    let chainIdNetwork

    switch (chainId) {
        case "5":
            chainIdNetwork = "goerli"
            break
        default:
            chainIdNetwork = "localhost"
            break
    }

    const DEPLOYED_SIMPLENFT_ADDRESS_FILE = `deployments/${chainIdNetwork}/SimpleNft.json`
    const DEPLOYED_RANDOMNFT_ADDRESS_FILE = `deployments/${chainIdNetwork}/RandomIpfsNft.json`
    const DEPLOYED_DYNAMICSVGNFT_ADDRESS_FILE = `deployments/${chainIdNetwork}/DynamicSvgNft.json`

    const simpleNftContractDeployedAddress = await JSON.parse(
        fs.readFileSync(DEPLOYED_SIMPLENFT_ADDRESS_FILE, "utf8")
    )

    const randomNftContractDeployedAddress = await JSON.parse(
        fs.readFileSync(DEPLOYED_RANDOMNFT_ADDRESS_FILE, "utf8")
    )
    const dynamicSvgNftContractDeployedAddress = await JSON.parse(
        fs.readFileSync(DEPLOYED_DYNAMICSVGNFT_ADDRESS_FILE, "utf8")
    )

    const simpleNft = await ethers.getContractAt(
        "SimpleNft",
        simpleNftContractDeployedAddress.address,
        deployer.address
    )
    log("------------------------------------")
    log("Minting Simple Nfts")

    const simpleMintTx = await simpleNft.mintNft()
    await simpleMintTx.wait(1)

    console.log(
        `Simple Nft index 0 has tokenURI: ${await simpleNft.tokenURI(0)}`
    )
    log("------------------------------------")
    const randomNft = await ethers.getContractAt(
        "RandomIpfsNft",
        randomNftContractDeployedAddress.address,
        deployer.address
    )
    log("Minting Random Nfts")

    const randomMintFee = await randomNft.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000)
        randomNft.once("NftMinted", async function () {
            resolve()
        })

        const randomMintTx = await randomNft.requestNft({
            value: randomMintFee.toString(),
        })

        const randomMintTxReceipt = await randomMintTx.wait(1)

        if (developmentChains.includes(network.name)) {
            const requestId =
                randomMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContractAt(
                "VRFCoordinatorV2Mock",
                "0x5FbDB2315678afecb367f032d93F642f64180aa3"
            )
            await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestId,
                randomNft.address
            )
        }
    })

    console.log(
        `Random Nft index 0 has tokenURI: ${await randomNft.tokenURI(0)}`
    )
    log("------------------------------------")
    const dynamicNft = await ethers.getContractAt(
        "DynamicSvgNft",
        dynamicSvgNftContractDeployedAddress.address,
        deployer.address
    )
    log("Minting Dynamic Nfts")
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNftMintTx = await dynamicNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(
        `Dynamic Nft index 0 has tokenURI: ${await dynamicNft.tokenURI(0)}`
    )
    log("------------------------------------")
}

module.exports.tags = ["all", "mint"]
