import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { SimpleKeystore } from "everscale-standalone-client/nodejs";
import { Address } from "everscale-inpage-provider";


let signer: Signer;
let collection: Contract<FactorySource["TIP4_3CollectionCon"]>;
let Nft;
let Index;
let IndexBasis;


describe("Test TIP4_3Collection contract", async function () {
  before(async () => {
    let randKeypair = SimpleKeystore.generateKeyPair();
    await locklift.keystore.addKeyPair("random", randKeypair);    
    signer = (await locklift.keystore.getSigner("random"))!;
  });

  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const collectionIntData = await locklift.factory.getContractArtifacts("TIP4_3CollectionCon");

      expect(collectionIntData.code).not.to.equal(undefined, "Code should be available");
      expect(collectionIntData.abi).not.to.equal(undefined, "ABI should be available");
      expect(collectionIntData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      Nft = await locklift.factory.getContractArtifacts('TIP4_3NftCon');
      Index = await locklift.factory.getContractArtifacts('Index');
      IndexBasis = await locklift.factory.getContractArtifacts('IndexBasis');

      const { contract } = await locklift.factory.deployContract({
        contract: "TIP4_3CollectionCon",
        publicKey: signer.publicKey,
        initParams: {
        },
        constructorParams: {
            codeNft: Nft.code,
            codeIndex: Index.code,
            codeIndexBasis: IndexBasis.code
        },
        value: locklift.utils.toNano(3),
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

    it("Index code test", async function () {
      const response = await collection.methods.indexCode({answerId: 0}).call();
      expect(response.code).to.be.equal(Index.code);
    });

    it("IndexBasis code test", async function () {
      const response = await collection.methods.indexBasisCode({answerId: 0}).call();
      expect(response.code).to.be.equal(IndexBasis.code);
    });
    
    it("TIP6 test", async function () {
      /// ITIP4_1Collection 0x1217AAAB
      let response = await collection.methods.supportsInterface({answerId: 0, interfaceID: "0x1217AAAB"}).call();
      expect(response.value0).to.be.equal(true);

      /// ITIP4_3Collection 0x4387BBFB
      response = await collection.methods.supportsInterface({answerId: 0, interfaceID: "0x4387BBFB"}).call();
      expect(response.value0).to.be.equal(true);

      /// ITIP6 0x3204EC29
      response = await collection.methods.supportsInterface({answerId: 0, interfaceID: "0x3204EC29"}).call();
      expect(response.value0).to.be.equal(true);
    });
    
    it("Nft address test", async function () {
        await collection.methods.mintNft({id: 0, owner: collection.address}).sendExternal({ publicKey: signer.publicKey });
        let response = await collection.methods.nftAddress({answerId: 0, id: 0}).call();
        expect(await locklift.provider.getBalance(response.nft).then(balance => Number(balance))).to.be.above(0);
    });

    it("Deploy IndexBasis test", async function () {
      let response = await collection.methods.resolveIndexBasis({answerId: 0}).call();
      expect(await locklift.provider.getBalance(response.indexBasis).then(balance => Number(balance))).to.be.above(0);
    });

    it("IndexBasis getInfo test", async function () {
      let response = await collection.methods.resolveIndexBasis({answerId: 0}).call();
      let indexBasis = await locklift.factory.getDeployedContract(
        "IndexBasis",
        new Address(response.indexBasis.toString()),
      );  

      let infoRes = await indexBasis.methods.getInfo({answerId: 0}).call();
      expect(infoRes.collection.toString()).to.be.equal(collection.address.toString());
    });
  });
});
