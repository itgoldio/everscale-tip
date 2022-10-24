import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { SimpleKeystore } from "everscale-standalone-client/nodejs";

let signer: Signer;
let collection: Contract<FactorySource["TIP4_1CollectionCon"]>;
let Nft;

describe("Test TIP4_1Collection contract", async function () {
  before(async () => {
    let randKeypair = SimpleKeystore.generateKeyPair();
    await locklift.keystore.addKeyPair("random", randKeypair);    
    signer = (await locklift.keystore.getSigner("random"))!;
  });

  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const collectionIntData = await locklift.factory.getContractArtifacts("TIP4_1CollectionCon");

      expect(collectionIntData.code).not.to.equal(undefined, "Code should be available");
      expect(collectionIntData.abi).not.to.equal(undefined, "ABI should be available");
      expect(collectionIntData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      Nft = await locklift.factory.getContractArtifacts('TIP4_1NftCon');
      const { contract } = await locklift.factory.deployContract({
        contract: "TIP4_1CollectionCon",
        publicKey: signer.publicKey,
        initParams: {
        },
        constructorParams: {
            codeNft: Nft.code,
        },
        value: locklift.utils.toNano(1),
      });
      collection = contract;

      expect(await locklift.provider.getBalance(collection.address).then(balance => Number(balance))).to.be.above(0);
      const response = await collection.methods.totalSupply({answerId: 0}).call();
      expect(Number(response.count)).to.be.equal(0);
    });
    
    it("Nft code test", async function () {
      const response = await collection.methods.nftCodeWithoutSalt({answerId: 0}).call();
      expect(response.nftCode).to.be.equal(Nft.code);
    });

    it("TIP6 test", async function () {
        let response = await collection.methods.supportsInterface({answerId: 0, interfaceID: "0x1217AAAB"}).call();
        expect(response.value0).to.be.equal(true);
        response = await collection.methods.supportsInterface({answerId: 0, interfaceID: "0x3204EC29"}).call();
        expect(response.value0).to.be.equal(true);
    });
    
    it("Nft address test", async function () {
        await collection.methods.mintNft({id: 0, owner: collection.address}).sendExternal({ publicKey: signer.publicKey });
        let response = await collection.methods.nftAddress({answerId: 0, id: 0}).call();
        expect(await locklift.provider.getBalance(response.nft.toString()).then(balance => Number(balance))).to.be.above(0);
    });
  });
});
