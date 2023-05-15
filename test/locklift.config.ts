import { LockliftConfig } from "locklift";
import { FactorySource } from "./build/factorySource";

import { lockliftChai } from "locklift";
import chai from "chai";
chai.use(lockliftChai);

declare global {
  const locklift: import("locklift").Locklift<FactorySource>;
}

const LOCAL_NETWORK_ENDPOINT = "http://localhost/graphql";
const RFLD_ENDPOINT = "https://rfld-dapp.itgold.io/graphql";

const config: LockliftConfig = {
  compiler: {
    version: "0.62.0"
  },
  linker: {
    version: "0.15.48",
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
        address: "0:ece57bcc6c530283becbbd8a3b24d3c5987cdddc3c8b7b33be6e4a6312490415",
        key: "172af540e43a524763dd53b26a066d472a97c4de37d5498170564510608250c3",
      },
      tracing: {
        endpoint: LOCAL_NETWORK_ENDPOINT,
      },
      keys: {
        phrase: "goat cousin cotton supreme tide recipe cause surface empower chaos try anxiety",
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
        address: "0:f2169a6b1f1b42e8b8dfb45d3d459eedbd15d601b701fd7f9e2992beae43736a",
        key: "1cf6b8f2148058f70a3916768beb46e4f3d3a60597bef88181a544bc7cf00bcd",
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
