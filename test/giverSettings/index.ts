import { Address, Contract, Giver, ProviderRpcClient, Transaction } from "locklift";
import { Ed25519KeyPair } from "everscale-standalone-client";

export class SimpleGiver implements Giver {
    public giverContract: Contract<typeof simpleGiverAbi>;
  
    constructor(ever: ProviderRpcClient, readonly keyPair: Ed25519KeyPair, address: string) {
      const giverAddr = new Address(address);
      this.giverContract = new ever.Contract(simpleGiverAbi, giverAddr);
    }
  
    public async sendTo(sendTo: Address, value: string): Promise<{ transaction: Transaction; output?: {} }> {
      return this.giverContract.methods
        .sendTransaction({
          value: value,
          dest: sendTo,
          bounce: false,
        })
        .sendExternal({ publicKey: this.keyPair.publicKey });
    }
  }
  

export class GiverWallet implements Giver {
  public giverContract: Contract<typeof giverWalletAbi>;

  constructor(ever: ProviderRpcClient, readonly keyPair: Ed25519KeyPair, address: string) {
    const giverAddr = new Address(address);
    this.giverContract = new ever.Contract(giverWalletAbi, giverAddr);
  }

  public async sendTo(sendTo: Address, value: string): Promise<{ transaction: Transaction; output?: {} }> {
    return this.giverContract.methods
      .sendGrams({
        dest: sendTo,
        amount: value,
      })
      .sendExternal({ publicKey: this.keyPair.publicKey });
  }
}

const simpleGiverAbi = {
  "ABI version": 2,
  header: ["time", "expire"],
  functions: [
    {
      name: "upgrade",
      inputs: [{ name: "newcode", type: "cell" }],
      outputs: [],
    },
    {
      name: "sendTransaction",
      inputs: [
        { name: "dest", type: "address" },
        { name: "value", type: "uint128" },
        { name: "bounce", type: "bool" },
      ],
      outputs: [],
    },
    {
      name: "getMessages",
      inputs: [],
      outputs: [
        {
          components: [
            { name: "hash", type: "uint256" },
            { name: "expireAt", type: "uint64" },
          ],
          name: "messages",
          type: "tuple[]",
        },
      ],
    },
    {
      name: "constructor",
      inputs: [],
      outputs: [],
    },
  ],
  events: [],
} as const;

const giverWalletAbi = { 
  "ABI version":2,
  "version":"2.2",
  "header":["pubkey","time","expire"],
  "functions":  [
    {
      "name":"constructor",
      "inputs": [
        { "name":"_owner","type":"uint256"}
      ],
      "outputs":[]
    },
    {
      "name":"sendGrams",
      "inputs": [
        { "name":"dest","type":"address"},
        { "name":"amount","type":"uint64"}
      ],
      "outputs":[]
    },
    {
      "name":"transferOwnership",
      "inputs": [
        { "name":"newOwner","type":"uint256"}
      ],
      "outputs":[]
    },
    {
      "name":"owner",
      "inputs":[],
      "outputs": [
        {"name":"owner","type":"uint256"}
      ]
    },
    {
      "name":"_randomNonce",
      "inputs":[],
      "outputs": [
        { "name":"_randomNonce","type":"uint256"}
      ]
    }
  ],
  "data": [
    {"key":1,"name":"_randomNonce","type":"uint256"}
  ],
  "events": [
    {
      "name":"OwnershipTransferred",
      "inputs": [
        {"name":"previousOwner","type":"uint256"},
        {"name":"newOwner","type":"uint256"}
      ],
      "outputs":[]
    }
  ],
  "fields": [
    {"name":"_pubkey","type":"uint256"},
    {"name":"_timestamp","type":"uint64"},
    {"name":"_constructorFlag","type":"bool"},
    {"name":"owner","type":"uint256"},
    {"name":"_randomNonce","type":"uint256"}
  ],
} as const;
