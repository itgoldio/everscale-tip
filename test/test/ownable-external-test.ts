import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { SimpleKeystore } from "everscale-standalone-client/nodejs";
import { FactorySource } from "../build/factorySource";

let ownerSigner: Signer;
let alienSigner: Signer;
let ownableExternal: Contract<FactorySource["OwnableExternalContract"]>;

describe("Test Ownable external contract", async function () {
  before(async () => {
    let randKeypair = SimpleKeystore.generateKeyPair();
    await locklift.keystore.addKeyPair("random", randKeypair);    
    ownerSigner = (await locklift.keystore.getSigner("random"))!;

    let alienKeypair = SimpleKeystore.generateKeyPair();
    await locklift.keystore.addKeyPair("alien", alienKeypair);
    alienSigner = (await locklift.keystore.getSigner("alien"))!;
  });

  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const ownExtData = await locklift.factory.getContractArtifacts("OwnableExternalContract");

      expect(ownExtData.code).not.to.equal(undefined, "Code should be available");
      expect(ownExtData.abi).not.to.equal(undefined, "ABI should be available");
      expect(ownExtData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      const { contract } = await locklift.factory.deployContract({
        contract: "OwnableExternalContract",
        publicKey: ownerSigner.publicKey,
        initParams: {
          _nonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {
          owner: "0x" + ownerSigner.publicKey,
        },
        value: locklift.utils.toNano(0.1),
      });
      ownableExternal = contract;

      expect(await locklift.provider.getBalance(ownableExternal.address).then(balance => Number(balance))).to.be.above(0);
      const pastEvents = await ownableExternal.getPastEvents({ filter: event => event.event === "OwnershipTransferred" });

      expect(pastEvents.events.length).to.be.equal(1);
      expect(pastEvents.events[0].data.oldOwner).to.be.equal("0");
      let newOwner = BigInt(pastEvents.events[0].data.newOwner).toString(16);
      if (newOwner.length < 64) {
        let delta = 64 - newOwner.length;
        let start = "";
        for (let i = 0; i < delta; i++) {
          start += "0";
        }
        newOwner = start + newOwner;
      }
      expect(newOwner).to.be.equal(ownerSigner.publicKey);
    });

    // it("Only owner test", async function () {
      // await locklift.tracing.trace(
      //   await ownableExternal.methods.onlyOwnerTest({}).sendExternal({ publicKey: alienSigner.publicKey }),
      //   {
      //     allowedCodes: {
      //       contracts: {
      //         [ownableExternal.address.toString()]: {
      //           compute: [100]
      //         },
      //       },
      //     },
      //   },
      // );

      // locklift.tracing.setAllowedCodes({ action: [100] });
      // await ownableExternal.methods.onlyOwnerTest({}).sendExternal({ publicKey: alienSigner.publicKey });
      // let pastEvents = await ownableExternal.getPastEvents({ filter: event => event.event === "Test" });
      // expect(pastEvents.events.length).to.be.equal(0);

      // console.log(ownableExternal.address);
      // call()
      // await ownableExternal.methods.onlyOwnerTest({}).call();
      // await locklift.tracing.trace(
      //   await ownableExternal.methods.onlyOwnerTest({}).call(),
      //   {
      //     allowedCodes: {
      //       //compute or action phase for all contracts
      //       compute: [100],
      //       // //also you can specify allowed codes for specific contract
      //       contracts: {
      //         [ownableExternal.address.toString()]: {
      //           compute: [100]
      //         },
      //       },
      //     },
      //   },
      // );

      // locklift.tracing.removeAllowedCodes({ compute: [100] });
      // await ownableExternal.methods.onlyOwnerTest({}).sendExternal({ publicKey: ownerSigner.publicKey });
      // pastEvents = await ownableExternal.getPastEvents({ filter: event => event.event === "Test" });
      // expect(pastEvents.events.length).to.be.equal(1);
    // });

    it("Get owner test", async function () {
      const response = await ownableExternal.methods.owner({answerId: 0}).call();
      let pubkey = BigInt(response.pubkey).toString(16);
      if (pubkey.length < 64) {
        let delta = 64 - pubkey.length;
        let start = "";
        for (let i = 0; i < delta; i++) {
          start += "0";
        }
        pubkey = start + pubkey;
      }
      expect(pubkey).to.be.equal(ownerSigner.publicKey);
    });

    it("Common Transfer ownership test", async function () {
      let newOwnerKeypair = SimpleKeystore.generateKeyPair();
      await locklift.keystore.addKeyPair("newOwner", newOwnerKeypair);
      let newOwnerSigner = (await locklift.keystore.getSigner("newOwner"))!;
      
      await ownableExternal.methods.transferOwnership({newOwner: "0x0"}).sendExternal({ publicKey: ownerSigner.publicKey });
      let response = await ownableExternal.methods.owner({answerId: 0}).call();
      let pubkey = BigInt(response.pubkey).toString(16);
      if (pubkey.length < 64) {
        let delta = 64 - pubkey.length;
        let start = "";
        for (let i = 0; i < delta; i++) {
          start += "0";
        }
        pubkey = start + pubkey;
      }
      expect(pubkey).to.be.equal(ownerSigner.publicKey);

      await ownableExternal.methods.transferOwnership({newOwner: "0x" + newOwnerSigner.publicKey}).sendExternal({ publicKey: ownerSigner.publicKey });

      response = await ownableExternal.methods.owner({answerId: 0}).call();
      pubkey = BigInt(response.pubkey).toString(16);
      if (pubkey.length < 64) {
        let delta = 64 - pubkey.length;
        let start = "";
        for (let i = 0; i < delta; i++) {
          start += "0";
        }
        pubkey = start + pubkey;
      }
      expect(pubkey).to.be.equal(newOwnerSigner.publicKey);

      const pastEvents = await ownableExternal.getPastEvents({ filter: event => event.event === "OwnershipTransferred" });
      expect(pastEvents.events.length).to.be.equal(2);
    });
  });
});
