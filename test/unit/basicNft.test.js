const { assert } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Simple NFT Unit Test", function () {
          let simpleNft, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              const contractAddress = await deployments.fixture(["simpleNft"])
              console.log(contractAddress)
              simpleNft = await ethers.getContractAt(
                  "SimpleNft",
                  contractAddress.SimpleNft.address,
                  deployer
              )
          })

          describe("Constructor", () => {
              it("Test 00 - Inicializes the NFT correctly", async () => {
                  const name = await simpleNft.name()
                  const symbol = await simpleNft.symbol()
                  const tokenCounter = await simpleNft.getTokenCounter()
                  assert.equal(name, "Dogie")
                  assert.equal(symbol, "DOG")
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
          describe("Mint NFT", () => {
              beforeEach(async () => {
                  const txResponse = await simpleNft.mintNft()
                  await txResponse.wait(1)
              })
              it("Test 01 - Allows users to mint an NFT, and updates appropriately", async () => {
                  const tokenURI = await simpleNft.tokenURI(0)
                  const tokenCounter = await simpleNft.getTokenCounter()

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(tokenURI, await simpleNft.TOKEN_URI())
              })
              it("Test 02 - how the correct balance and owner of an NFT", async () => {
                  const deployerAddress = deployer.address
                  const deployerBalance = await simpleNft.balanceOf(
                      deployerAddress
                  )
                  const owner = await simpleNft.ownerOf("0")

                  assert.equal(deployerBalance.toString(), "1")
                  assert.equal(owner, deployerAddress)
              })
          })
      })
