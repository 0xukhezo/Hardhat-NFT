const pinataSDK = require("@pinata/sdk")
const fs = require("fs")
const path = require("path")

const pinataApiKey = process.env.PINATA_API_KEY || ""
const pinataApiSecret = process.env.PINATA_API_SECRET || ""
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret)

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("Uploading to IPFS")

    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        )
        const options = {
            pinataMetadata: {
                name: readableStreamForFile.path,
            },
        }
        try {
            const response = await pinata
                .pinFileToIPFS(readableStreamForFile, options)
                .then((result) => {
                    //handle results here
                    console.log(result)
                })
                .catch((err) => {
                    //handle error here
                    console.log(err)
                })
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

module.exports = { storeImages }
