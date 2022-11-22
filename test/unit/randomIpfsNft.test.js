const { assert, expect } = require("chai")
const { network, ethers } = require("hardhat")
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
              it("Test 03 - reverts if payment amount is less than the mint fee", async function () {
                  const fee = await randomIpfsNft.getMintFee()
                  await expect(
                      randomIpfsNft.requestNft({
                          value: fee.sub(ethers.utils.parseEther("0.001")),
                      })
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })
              it("Test 04 - emits an event and kicks off a random word request", async function () {
                  const fee = await randomIpfsNft.getMintFee()
                  await expect(
                      randomIpfsNft.requestNft({ value: fee.toString() })
                  ).to.emit(randomIpfsNft, "NftRequested")
              })
          })
          describe("fulfillRandomWords", () => {
              it("Test 05 - mints NFT after random number is returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNft.once("NftMinted", async () => {
                          try {
                              const tokenUri = await randomIpfsNft.tokenURI("0")
                              const tokenCounter =
                                  await randomIpfsNft.getTokenCounter()
                              assert.equal(
                                  tokenUri.toString().includes("ipfs://"),
                                  true
                              )
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNft.getMintFee()
                          const requestNftResponse =
                              await randomIpfsNft.requestNft({
                                  value: fee.toString(),
                              })
                          const requestNftReceipt =
                              await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNft.address
                          )
                      } catch (e) {
                          console.log(e)
                          reject(e)
                      }
                  })
              })
          })
          describe("getBreedFromModdedRng", () => {
              it("Test 06 - should return pug if moddedRng < 10", async function () {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRng(7)
                  assert.equal(0, expectedValue)
              })
              it("Test 07 - should return shiba-inu if moddedRng is between 10 - 39", async function () {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRng(21)
                  assert.equal(1, expectedValue)
              })
              it("Test 08 - should return st. bernard if moddedRng is between 40 - 99", async function () {
                  const expectedValue =
                      await randomIpfsNft.getBreedFromModdedRng(77)
                  assert.equal(2, expectedValue)
              })
              it("Test 09 - should revert if moddedRng > 99", async function () {
                  await expect(
                      randomIpfsNft.getBreedFromModdedRng(100)
                  ).to.be.revertedWithCustomError(
                      randomIpfsNft,
                      "RandomIpfsNft__RangeOutOfBounds"
                  )
              })
          })
      })
