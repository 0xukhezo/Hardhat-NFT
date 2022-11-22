const { assert, expect } = require("chai")
const { network, ethers, deployments } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Ipfs NFT Unit Test", function () {
          let randomIpfsNft, deployer

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              randomIpfsNft = await ethers.getContractAt(
                  "RandomIpfsNft",
                  "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
                  deployer
              )
              vrfCoordinatorV2Mock = await ethers.getContractAt(
                  "VRFCoordinatorV2Mock",
                  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                  deployer
              )
          })

          describe("Constructor", () => {
              it("Test 01 - sets starting values correctly", async () => {
                  const dogTokenUriZero = await randomIpfsNft.getDogTokenUris(0)
                  const isInitialized = await randomIpfsNft.getInitialized()
                  assert(dogTokenUriZero.includes("ipfs://"))
                  assert.equal(isInitialized, true)
              })
          })
          describe("requestNft", () => {
              it("Test 02 - fails if payment isn't sent with the request", async function () {
                  await expect(
                      randomIpfsNft.requestNft()
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })
              it("Test 03 - reverts if payment amount is less than the mint fee", async function () {})
              it("Test 04 - emits an event and kicks off a random word request", async function () {})
          })
      })
