const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let ethUsdcPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        ethUsdcAggragator = await ethers.getContractAt(
            "MockV3Aggregator",
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
        )

        ethUsdcPriceFeedAddress = ethUsdcAggragator.address
    } else {
        ethUsdcPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSvg = fs.readFileSync("./images/dynamicNft/frown.svg", {
        encoding: "utf8",
    })

    const highSvg = fs.readFileSync("./images/dynamicNft/happy.svg", {
        encoding: "utf8",
    })

    const args = [ethUsdcPriceFeedAddress, lowSvg, highSvg]

    log("------------------------------------")

    const dynamicNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API
    ) {
        log("------------------------------------")
        log("Verifying...")
        await verify(dynamicNft.address, args)
    }
}

module.exports.tags = ["all", "dynamicSvgNft", "main"]
