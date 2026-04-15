export const NETWORK = {
  rpc: import.meta.env.VITE_WIREFLUID_RPC || "http://127.0.0.1:8545",
  chainId: parseInt(import.meta.env.VITE_WIREFLUID_CHAIN_ID || "31337", 10),
  name: import.meta.env.VITE_WIREFLUID_NAME || "Hardhat Local",
  symbol: import.meta.env.VITE_WIREFLUID_SYMBOL || "ETH",
  explorer: import.meta.env.VITE_WIREFLUID_EXPLORER || "https://explorer.wirefluid.com",
  isLocal: !import.meta.env.VITE_WIREFLUID_RPC
};
