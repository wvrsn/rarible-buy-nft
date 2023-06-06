import { createRaribleSdk } from "@rarible/sdk";
import { Web3Ethereum } from "@rarible/web3-ethereum";
import HDWalletProvider from "@truffle/hdwallet-provider";

import * as dotenv from "dotenv";
import * as FormData from 'form-data';
import * as fetch from "node-fetch";
import Web3 from "web3";

// Loads the env file variables
dotenv.config()

// Creates global variables that rarible uses to fetch data
const globals = global as any;

globals.FormData = FormData;
globals.window = {
	fetch: fetch,
	dispatchEvent: () => { },
}
globals.CustomEvent = function CustomEvent() {
	return
}

const buy = async ({ contract, tokenId }: { contract: string, tokenId: string }) => {
	const privateKey = process.env["ETH_PRIVATE_KEY"] as string
	const rpcUrl = process.env["ETHEREUM_RPC_URL"] as string
	const itemId = `POLYGON:${contract}:${tokenId}`

	// Setup a wallet using the private key
	const localKeyProvider = new HDWalletProvider({
		privateKeys: [
			privateKey
		],
		providerOrUrl: rpcUrl,
	});

	const web3 = new Web3(<any>localKeyProvider)
	let web3Ethereum = new Web3Ethereum({ web3, gas: 90000000 })
	const raribleSdk = createRaribleSdk(web3Ethereum, "prod")

	const order = (await raribleSdk.apis.item.getItemById({ itemId })).bestSellOrder

	if (order) {
		console.log("Sell order was found, purchasing...")
		const response = await raribleSdk.order.buy({
			orderId: order.id,
			amount: 1,
			infiniteApproval: true
		})
		await response.wait()
		console.log("The transaction was sent, waiting for a Rarible Protocol response...")
		console.log("Rarible Protocol response:", response)
	} else {
		console.warn(`Sell order was not found`)
	}
}

export const main = async () => {
	try {

		//https://rarible.com/token/polygon/0x67f4732266c7300cca593c814d46bee72e40659f:201110?tab=overview
		await buy({
			contract: "0x67f4732266c7300cca593c814d46bee72e40659f",
			tokenId: "201110"
		})
	} catch (err) {
		console.log(err)
	}
};

main()
