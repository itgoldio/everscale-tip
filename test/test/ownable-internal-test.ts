import { expect } from "chai";
import { Contract, Signer } from "locklift";
import { SimpleKeystore } from "everscale-standalone-client/nodejs";
import { FactorySource } from "../build/factorySource";

let signer: Signer;
let accountsFactory;
let owner;
let alien;
let ownableInternal: Contract<FactorySource["OwnableInternalContract"]>;

const zeroAddress = '0:0000000000000000000000000000000000000000000000000000000000000000';

describe("Test Ownable internal contract", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
    accountsFactory = await locklift.factory.getAccountsFactory(
      "Wallet",
    );
    const {account: account, tx} = await accountsFactory.deployNewAccount({
        publicKey: signer.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
        value: locklift.utils.toNano(0.5)
    }); 
    owner = account;
  });

  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const ownIntData = await locklift.factory.getContractArtifacts("OwnableInternalContract");

      expect(ownIntData.code).not.to.equal(undefined, "Code should be available");
      expect(ownIntData.abi).not.to.equal(undefined, "ABI should be available");
      expect(ownIntData.tvc).not.to.equal(undefined, "tvc should be available");
    });

    it("Deploy contract", async function () {
      const { contract } = await locklift.factory.deployContract({
        contract: "OwnableInternalContract",
        publicKey: signer.publicKey,
        initParams: {
          _nonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {
          owner: owner.address,
        },
        value: locklift.utils.toNano(0.1),
      });
      ownableInternal = contract;

      expect(await locklift.provider.getBalance(ownableInternal.address).then(balance => Number(balance))).to.be.above(0);
      const pastEvents = await ownableInternal.getPastEvents({ filter: event => event.event === "OwnershipTransferred" });
      expect(pastEvents.events.length).to.be.equal(1);
      expect(pastEvents.events[0].data.oldOwner._address).to.be.equal(zeroAddress);
      expect(pastEvents.events[0].data.newOwner._address).to.be.equal(owner.address._address);
    });
    
    it("Only owner test", async function () {
      const {account: alienAccount, tx} = await accountsFactory.deployNewAccount({
        publicKey: signer.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
        value: locklift.utils.toNano(0.5)
      }); 

      await locklift.tracing.trace(
        await alienAccount.runTarget(
          {
              contract: ownableInternal,
              value: locklift.utils.toNano(0.1),
          },
          ownableInternal =>
          ownableInternal.methods.transferOwnership({
            newOwner: alienAccount.address
          }),
        ),
        {
          allowedCodes: {
            contracts: {
              [ownableInternal.address.toString()]: {
                compute: [100]
              },
            },
          },
        },
      );

      const response = await ownableInternal.methods.owner().call();
      expect(response.owner_.toString()).to.be.equal(owner.address.toString());

      const pastEvents = await ownableInternal.getPastEvents({ filter: event => event.event === "OwnershipTransferred" });
      expect(pastEvents.events.length).to.be.equal(1);
    });

    it("Get owner test", async function () {
      const response = await ownableInternal.methods.owner({}).call();
      expect(response.owner_.toString()).to.be.equal(owner.address.toString());
    });

    it("Transfer ownership test with zero new owner address", async function () {
      await locklift.tracing.trace(
        await owner.runTarget(
          {
              contract: ownableInternal,
              value: locklift.utils.toNano(0.1),
          },
          ownableInternal =>
          ownableInternal.methods.transferOwnership({
            newOwner: zeroAddress
          }),
        ),
        {
          allowedCodes: {
            contracts: {
              [ownableInternal.address.toString()]: {
                compute: [100]
              },
            },
          },
        },
      );

      const response = await ownableInternal.methods.owner().call();
      expect(response.owner_.toString()).to.be.equal(owner.address.toString());

      const pastEvents = await ownableInternal.getPastEvents({ filter: event => event.event === "OwnershipTransferred" });
      expect(pastEvents.events.length).to.be.equal(1);
    });

    it("Common transfer ownership test", async function () {
      const {account: newOwner, tx} = await accountsFactory.deployNewAccount({
        publicKey: signer.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
        value: locklift.utils.toNano(0.5)
      }); 
      
      await owner.runTarget(
        {
            contract: ownableInternal,
            value: locklift.utils.toNano(0.1),
        },
        ownableInternal =>
        ownableInternal.methods.transferOwnership({
          newOwner: newOwner.address
        }),
      );

      const response = await ownableInternal.methods.owner({}).call();
      expect(response.owner_.toString()).to.be.equal(newOwner.address.toString());

      const pastEvents = await ownableInternal.getPastEvents({ filter: event => event.event === "OwnershipTransferred" });
      expect(pastEvents.events.length).to.be.equal(2);
    });
  });
});
