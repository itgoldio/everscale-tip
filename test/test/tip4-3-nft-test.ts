import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { FactorySource } from "../build/factorySource";
import { SimpleKeystore } from "everscale-standalone-client/nodejs";
import { Address } from "everscale-inpage-provider";

let signer: Signer;
let collection: Contract<FactorySource["TIP4_3CollectionCon"]>;
let nft: Contract<FactorySource["TIP4_3NftCon"]>;
let accountsFactory;
let manager;
let pastOwnerChangedEvents;
let pastManagerChangedEvents;

let Nft;
let Index;
let IndexBasis;

const zeroAddress = '0:0000000000000000000000000000000000000000000000000000000000000000';

describe("Test TIP4_3Nft contract", async function () {
  before(async () => {
    let randKeypair = SimpleKeystore.generateKeyPair();
    await locklift.keystore.addKeyPair("random", randKeypair);    
    signer = (await locklift.keystore.getSigner("random"))!;

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

    accountsFactory = await locklift.factory.getAccountsFactory(
      "Wallet",
    );
    const {account: account, tx} = await accountsFactory.deployNewAccount({
        publicKey: signer.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
        value: locklift.utils.toNano(2)
    }); 
    manager = account;
  });

  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const nftData = await locklift.factory.getContractArtifacts("TIP4_3NftCon");

      expect(nftData.code).not.to.equal(undefined, "Code should be available");
      expect(nftData.abi).not.to.equal(undefined, "ABI should be available");
      expect(nftData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      await collection.methods.mintNft({id: 0, owner: manager.address}).sendExternal({ publicKey: signer.publicKey });
      let response = await collection.methods.nftAddress({answerId: 0, id: 0}).call();
      nft = await locklift.factory.getDeployedContract(
        "TIP4_3NftCon",
        new Address(response.nft.toString()),
      );
      
      const pastEvents = await nft.getPastEvents({ filter: event => event.event === "NftCreated" });
      expect(await locklift.provider.getBalance(collection.address).then(balance => Number(balance))).to.be.above(0);
      expect(pastEvents.events.length).to.be.equal(1);
      expect(pastEvents.events[0].data.id).to.be.equal("0");
      expect(pastEvents.events[0].data.owner.toString()).to.be.equal(manager.address.toString());
      expect(pastEvents.events[0].data.manager.toString()).to.be.equal(manager.address.toString());
      expect(pastEvents.events[0].data.collection.toString()).to.be.equal(collection.address.toString());

      let indexRes = await nft.methods.resolveIndex({
        answerId: 0, 
        collection: collection.address, 
        owner: manager.address
      }).call();

      expect(await locklift.provider.getBalance(indexRes.index).then(balance => Number(balance))).to.be.above(0);
    });

    it("TIP6 test", async function () {
        /// ITIP4_1NFT
        let response = await nft.methods.supportsInterface({answerId: 0, interfaceID: "0x78084F7E"}).call();
        expect(response.value0).to.be.equal(true);

        /// ITIP4_3NFT
        response = await nft.methods.supportsInterface({answerId: 0, interfaceID: "0x4DF6250B"}).call();
        expect(response.value0).to.be.equal(true);

        /// ITIP6
        response = await nft.methods.supportsInterface({answerId: 0, interfaceID: "0x3204EC29"}).call();
        expect(response.value0).to.be.equal(true);
    });
    
    it("Transfer test with wrong owner", async function () {
        let response = await nft.methods.getInfo({answerId: 0}).call();
        let oldOwner = response.owner.toString();
        let oldManager = response.manager.toString();

        accountsFactory = await locklift.factory.getAccountsFactory(
          "Wallet",
        );
        const {account: wrongOwner, tx} = await accountsFactory.deployNewAccount({
            publicKey: signer.publicKey,
            initParams: {
              _randomNonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {},
            value: locklift.utils.toNano(0.5)
        }); 

        await wrongOwner.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.3),
          },
          nft =>
          nft.methods.transfer({
              to: wrongOwner.address,
              sendGasTo: new Address(zeroAddress),
              callbacks: []
          }),
        );
          
        response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.owner.toString()).to.be.equal(oldOwner);
        expect(response.manager.toString()).to.be.equal(oldManager);
      });

      it("Common transfer test", async function () {
        let response = await nft.methods.getInfo({answerId: 0}).call();
        let oldOwner = response.owner;
        let oldManager = response.manager;

        let indexRes = await nft.methods.resolveIndex({
          answerId: 0, 
          collection: collection.address, 
          owner: oldOwner
        }).call();
        let oldIndex = indexRes.index;
  
        const {account: newOwner, tx} = await accountsFactory.deployNewAccount({
            publicKey: signer.publicKey,
            initParams: {
              _randomNonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {},
            value: locklift.utils.toNano(1)
        }); 

        await manager.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.6),
          },
          nft =>
          nft.methods.transfer({
              to: newOwner.address,
              sendGasTo: manager.address,
              callbacks: []
          }),
        );

        const newOwnerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "OwnerChanged" });
        const newManagerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "ManagerChanged" });

        let ownChangedDelta = 0;
        if (pastOwnerChangedEvents != undefined) {
          ownChangedDelta = newOwnerChangedEvents.events.length - pastOwnerChangedEvents.events.length;
        } else {
          ownChangedDelta = newOwnerChangedEvents.events.length; 
        }

        let managerChangedDelta = 0;
        if (pastManagerChangedEvents != undefined) {
          managerChangedDelta = newManagerChangedEvents.events.length - pastManagerChangedEvents.events.length;
        } else {
          managerChangedDelta = newManagerChangedEvents.events.length; 
        }

        pastOwnerChangedEvents = newOwnerChangedEvents;
        pastManagerChangedEvents = newManagerChangedEvents;

        expect(ownChangedDelta).to.be.equal(1);
        expect(newOwnerChangedEvents.events[0].data.oldOwner.toString()).to.be.equal(oldOwner.toString());
        expect(newOwnerChangedEvents.events[0].data.newOwner.toString()).to.be.equal(newOwner.address.toString());
        expect(managerChangedDelta).to.be.equal(1);
        expect(newManagerChangedEvents.events[0].data.oldManager.toString()).to.be.equal(oldManager.toString());
        expect(newManagerChangedEvents.events[0].data.newManager.toString()).to.be.equal(newOwner.address.toString());

        response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.owner.toString()).to.be.equal(newOwner.address.toString());
        expect(response.manager.toString()).to.be.equal(newOwner.address.toString());

        expect(await locklift.provider.getBalance(oldIndex).then(balance => Number(balance))).to.be.eq(0);

        indexRes = await nft.methods.resolveIndex({
          answerId: 0, 
          collection: collection.address, 
          owner: newOwner.address
        }).call();
        let newIndex = indexRes.index;
        expect(await locklift.provider.getBalance(newIndex).then(balance => Number(balance))).to.be.above(0);

        let index= await locklift.factory.getDeployedContract(
          "Index",
          new Address(newIndex.toString()),
        ); 

        let infoRes = await index.methods.getInfo({answerId: 0}).call();
        expect(infoRes.collection.toString()).to.be.equal(collection.address.toString());
        expect(infoRes.owner.toString()).to.be.equal(newOwner.address.toString());
        expect(infoRes.nft.toString()).to.be.equal(nft.address.toString());

        manager = newOwner;
      });

      it("Change manager test with wrong manager", async function () {
        let response = await nft.methods.getInfo({answerId: 0}).call();
        let oldManager = response.manager.toString();

        accountsFactory = await locklift.factory.getAccountsFactory(
          "Wallet",
        );
        const {account: wrongManager, tx} = await accountsFactory.deployNewAccount({
            publicKey: signer.publicKey,
            initParams: {
              _randomNonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {},
            value: locklift.utils.toNano(0.5)
        }); 

        await wrongManager.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.3),
          },
          nft =>
          nft.methods.changeManager({
              newManager: wrongManager.address,
              sendGasTo: new Address(zeroAddress),
              callbacks: []
          }),
        );
          
        response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.manager.toString()).to.be.equal(oldManager);
      });

      it("Change manager with the same manager test", async function () {
          await manager.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.3),
          },
          nft =>
          nft.methods.changeManager({
              newManager: manager.address,
              sendGasTo: manager.address,
              callbacks: []
          }),
        );

        const newManagerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "ManagerChanged" });

        let managerChangedDelta = 0;
        if (pastManagerChangedEvents != undefined) {
          managerChangedDelta = newManagerChangedEvents.events.length - pastManagerChangedEvents.events.length;
        } else {
          managerChangedDelta = newManagerChangedEvents.events.length; 
        }

        pastManagerChangedEvents = newManagerChangedEvents;

        expect(managerChangedDelta).to.be.equal(0);
          
        let response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.manager.toString()).to.be.equal(manager.address.toString());
      });

      it("Common change manager test", async function () {
        const {account: newManager, tx} = await accountsFactory.deployNewAccount({
            publicKey: signer.publicKey,
            initParams: {
              _randomNonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {},
            value: locklift.utils.toNano(1.5)
        }); 

        await manager.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.3),
          },
          nft =>
          nft.methods.changeManager({
              newManager: newManager.address,
              sendGasTo: manager.address,
              callbacks: []
          }),
        );

        const newManagerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "ManagerChanged" });

        let managerChangedDelta = 0;
        if (pastManagerChangedEvents != undefined) {
          managerChangedDelta = newManagerChangedEvents.events.length - pastManagerChangedEvents.events.length;
        } else {
          managerChangedDelta = newManagerChangedEvents.events.length; 
        }

        pastManagerChangedEvents = newManagerChangedEvents;

        expect(managerChangedDelta).to.be.equal(1);
        expect(newManagerChangedEvents.events[0].data.oldManager.toString()).to.be.equal(manager.address.toString());
        expect(newManagerChangedEvents.events[0].data.newManager.toString()).to.be.equal(newManager.address.toString());
       
        let response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.manager.toString()).to.be.equal(newManager.address.toString());

        manager = newManager;
      });

      it("Change owner test with wrong owner", async function () {
        let response = await nft.methods.getInfo({answerId: 0}).call();
        let oldOwner = response.owner.toString();

        accountsFactory = await locklift.factory.getAccountsFactory(
          "Wallet",
        );
        const {account: wrongOwner, tx} = await accountsFactory.deployNewAccount({
            publicKey: signer.publicKey,
            initParams: {
              _randomNonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {},
            value: locklift.utils.toNano(0.5)
        }); 

        await wrongOwner.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.3),
          },
          nft =>
          nft.methods.changeOwner({
              newOwner: wrongOwner.address,
              sendGasTo: new Address(zeroAddress),
              callbacks: []
          }),
        );
          
        response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.owner.toString()).to.be.equal(oldOwner);
      });

      it("Change owner with the same owner test", async function () {
        let response = await nft.methods.getInfo({answerId: 0}).call();
        let oldOwner = response.owner.toString();

        await manager.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.3),
          },
          nft =>
          nft.methods.changeOwner({
              newOwner: oldOwner,
              sendGasTo: manager.address,
              callbacks: []
          }),
        );

        const newOwnerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "OwnerChanged" });

        let ownChangedDelta = 0;
        if (pastOwnerChangedEvents != undefined) {
          ownChangedDelta = newOwnerChangedEvents.events.length - pastOwnerChangedEvents.events.length;
        } else {
          ownChangedDelta = newOwnerChangedEvents.events.length; 
        }
        
        pastOwnerChangedEvents = newOwnerChangedEvents;

        expect(ownChangedDelta).to.be.equal(0);
          
        response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.owner.toString()).to.be.equal(oldOwner);
      });

      it("Common change owner test", async function () {
        let response = await nft.methods.getInfo({answerId: 0}).call();
        let oldOwner = response.owner;

        let indexRes = await nft.methods.resolveIndex({
          answerId: 0, 
          collection: collection.address, 
          owner: oldOwner
        }).call();
        let oldIndex = indexRes.index;

        const {account: newOwner, tx} = await accountsFactory.deployNewAccount({
            publicKey: signer.publicKey,
            initParams: {
              _randomNonce: locklift.utils.getRandomNonce(),
            },
            constructorParams: {},
            value: locklift.utils.toNano(0.5)
        }); 

        await manager.runTarget(
          {
              contract: nft,
              value: locklift.utils.toNano(0.6),
          },
          nft =>
          nft.methods.changeOwner({
              newOwner: newOwner.address,
              sendGasTo: manager.address,
              callbacks: []
          }),
        );

        const newOwnerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "OwnerChanged" });

        let ownChangedDelta = 0;
        if (pastOwnerChangedEvents != undefined) {
          ownChangedDelta = newOwnerChangedEvents.events.length - pastOwnerChangedEvents.events.length;
        } else {
          ownChangedDelta = newOwnerChangedEvents.events.length; 
        }

        pastOwnerChangedEvents = newOwnerChangedEvents;

        expect(ownChangedDelta).to.be.equal(1);
        expect(newOwnerChangedEvents.events[0].data.oldOwner.toString()).to.be.equal(oldOwner.toString());
        expect(newOwnerChangedEvents.events[0].data.newOwner.toString()).to.be.equal(newOwner.address.toString());
       
        response = await nft.methods.getInfo({answerId: 0}).call();
        expect(response.owner.toString()).to.be.equal(newOwner.address.toString());

        indexRes = await nft.methods.resolveIndex({
          answerId: 0, 
          collection: collection.address, 
          owner: newOwner.address
        }).call();
        let newIndex = indexRes.index;

        expect(await locklift.provider.getBalance(oldIndex).then(balance => Number(balance))).to.be.eq(0);
        expect(await locklift.provider.getBalance(newIndex).then(balance => Number(balance))).to.be.above(0);

        let index= await locklift.factory.getDeployedContract(
          "Index",
          new Address(newIndex.toString()),
        ); 

        let infoRes = await index.methods.getInfo({answerId: 0}).call();
        expect(infoRes.collection.toString()).to.be.equal(collection.address.toString());
        expect(infoRes.owner.toString()).to.be.equal(newOwner.address.toString());
        expect(infoRes.nft.toString()).to.be.equal(nft.address.toString());

        manager = newOwner;
      });
    //   it("Transfer test with callbacks", async function () {
    //     let response = await nft.methods.getInfo({answerId: 0}).call();

    //     const {account: callbackReceiver} = await accountsFactory.deployNewAccount({
    //       publicKey: signer.publicKey,
    //       initParams: {
    //         _randomNonce: locklift.utils.getRandomNonce(),
    //       },
    //       constructorParams: {},
    //       value: locklift.utils.toNano(0.5)
    //   }); 

    //   const {account: newOwner} = await accountsFactory.deployNewAccount({
    //       publicKey: signer.publicKey,
    //       initParams: {
    //         _randomNonce: locklift.utils.getRandomNonce(),
    //       },
    //       constructorParams: {},
    //       value: locklift.utils.toNano(0.5)
    //   }); 

    //   let callbacks;
    //   callbacks[callbackReceiver.address] = { value: locklift.utils.toNano(0.05), payload: "te6ccgEBAQEAMAAAW1t00puAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLA=" };
    //   await owner.runTarget(
    //     {
    //         contract: nft,
    //         value: locklift.utils.toNano(0.3),
    //     },
    //     nft =>
    //     nft.methods.transfer({
    //         to: newOwner.address,
    //         sendGasTo: owner.address,
    //         callbacks: [
    //           callbackReceiver.address, 
    //           { 
    //             value: locklift.utils.toNano(0.05),
    //             payload: "te6ccgEBAQEAMAAAW1t00puAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACLA="
    //           }
    //         ]
    //     }),
    //   );

    //   expect(await locklift.provider.getBalance(callbackReceiver.address).then(balance => Number(balance))).to.be.above(0);

    //   const newOwnerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "OwnerChanged" });
    //   const newManagerChangedEvents = await nft.getPastEvents({ filter: event => event.event === "ManagerChanged" });

    //   let ownChangedDelta = 0;
    //   if (pastOwnerChangedEvents != undefined) {
    //     ownChangedDelta = newOwnerChangedEvents.events.length - pastOwnerChangedEvents.events.length;
    //   } else {
    //     ownChangedDelta = newOwnerChangedEvents.events.length; 
    //   }

    //   let managerChangedDelta = 0;
    //   if (pastManagerChangedEvents != undefined) {
    //     managerChangedDelta = newManagerChangedEvents.events.length - pastManagerChangedEvents.events.length;
    //   } else {
    //     managerChangedDelta = newManagerChangedEvents.events.length; 
    //   }

    //   pastOwnerChangedEvents = newOwnerChangedEvents;
    //   pastManagerChangedEvents = newManagerChangedEvents;

    //   expect(ownChangedDelta).to.be.equal(1);
    //   expect(newOwnerChangedEvents.events[newOwnerChangedEvents.events.length - 1].data.oldOwner.toString()).to.be.equal(owner.address.toString());
    //   expect(newOwnerChangedEvents.events[newOwnerChangedEvents.events.length - 1].data.newOwner.toString()).to.be.equal(newOwner.address.toString());
    //   expect(managerChangedDelta).to.be.equal(1);
    //   expect(newManagerChangedEvents.events[newManagerChangedEvents.events.length - 1].data.oldManager.toString()).to.be.equal(owner.address.toString());
    //   expect(newManagerChangedEvents.events[newManagerChangedEvents.events.length - 1].data.newManager.toString()).to.be.equal(newOwner.address.toString());

    //   response = await nft.methods.getInfo({answerId: 0}).call();
    //   expect(response.owner.toString()).to.be.equal(newOwner.address.toString());
    //   expect(response.manager.toString()).to.be.equal(newOwner.address.toString());

    //   owner = newOwner;
    // });
  });
});
