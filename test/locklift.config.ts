import { LockliftConfig } from "locklift";
import { FactorySource } from "./build/factorySource";
import { SimpleGiver, GiverWallet } from "./giverSettings";

declare global {
  const locklift: import("locklift").Locklift<FactorySource>;
}

const LOCAL_NETWORK_ENDPOINT = "http://localhost/graphql";
const RFLD_ENDPOINT = "https://rfld-dapp.itgold.io/graphql";

const config: LockliftConfig = {
  compiler: {
    version: "0.61.2"
  },
  linker: {
    version: "0.14.51",
  },
  networks: {
    local: {
      connection: {
        group: "localnet",
        type: "graphql",
        data: {
          endpoints: [LOCAL_NETWORK_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: true,
        },
      },
      giver: {
        giverFactory: (ever, keyPair, address) => new SimpleGiver(ever, keyPair, address),
        address: "0:ece57bcc6c530283becbbd8a3b24d3c5987cdddc3c8b7b33be6e4a6312490415",
        key: "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
      },
      tracing: {
        endpoint: LOCAL_NETWORK_ENDPOINT,
      },
      keys: {
        amount: 20,
      },
    },
    rfld: {
      connection: {
        group: "rfld",
        type: "graphql",
        data: {
          endpoints: [RFLD_ENDPOINT],
          latencyDetectionInterval: 1000,
          local: false,
        },
      },
      giver: {
        giverFactory: (ever, keyPair, address) => new GiverWallet(ever, keyPair, address),
        address: "0:3e0dffb41dd61c048cb322cfd43c21d9fc93b7596259d43cc3ac122539cbf4eb",
        key: "e237e6aff07ee21b7023f715b2c130d988631577454ec06908a2e5b78aad4d86",
      },
      tracing: {
        endpoint: RFLD_ENDPOINT,
      },
      keys: {
        phrase: "goat cousin cotton supreme tide recipe cause surface empower chaos try anxiety",
        amount: 20,
      },
    }
  },
  mocha: {
    timeout: 2000000,
  },
};

export default config;
