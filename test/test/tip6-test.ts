import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { SimpleKeystore } from "everscale-standalone-client/nodejs";

let signer: Signer;
let tip6: Contract<FactorySource["TIP6Con"]>;

describe("Test TIP6 contract", async function () {
  before(async () => {
    let randKeypair = SimpleKeystore.generateKeyPair();
    await locklift.keystore.addKeyPair("random", randKeypair);    
    signer = (await locklift.keystore.getSigner("random"))!;
  });

  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const collectionIntData = await locklift.factory.getContractArtifacts("TIP6Con");

      expect(collectionIntData.code).not.to.equal(undefined, "Code should be available");
      expect(collectionIntData.abi).not.to.equal(undefined, "ABI should be available");
      expect(collectionIntData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      const { contract } = await locklift.factory.deployContract({
        contract: "TIP6Con",
        publicKey: signer.publicKey,
        initParams: {
        },
        constructorParams: {
        },
        value: locklift.utils.toNano(0.5),
      });
      tip6 = contract;

      expect(await locklift.provider.getBalance(tip6.address).then(balance => Number(balance))).to.be.above(0);
    });
    
    it("TIP6 test", async function () {
        let response = await tip6.methods.supportsInterface({answerId: 0, interfaceID: "0x3204EC29"}).call();
        expect(response.value0).to.be.equal(true);
    });
  });
});
