import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";

const WalletCtx = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState("");
  const [chainId, setChainId] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const reconnect = async () => {
      if (!window.ethereum || localStorage.getItem("ph_wallet_connected") !== "1") return;
      const p = new BrowserProvider(window.ethereum);
      const accounts = await p.send("eth_accounts", []);
      if (accounts.length) {
        setProvider(p);
        setAccount(accounts[0].toLowerCase());
        const net = await p.getNetwork();
        setChainId(Number(net.chainId));
      }
    };
    reconnect();
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const onAccounts = (accounts) => setAccount((accounts?.[0] || "").toLowerCase());
    const onChain = (cid) => setChainId(Number(cid));
    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) throw new Error("NO_METAMASK");
    setConnecting(true);
    try {
      const p = new BrowserProvider(window.ethereum);
      const accounts = await p.send("eth_requestAccounts", []);
      const net = await p.getNetwork();
      setProvider(p);
      setAccount(accounts[0].toLowerCase());
      setChainId(Number(net.chainId));
      localStorage.setItem("ph_wallet_connected", "1");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setProvider(null);
    setAccount("");
    setChainId(0);
    localStorage.removeItem("ph_wallet_connected");
  };

  const value = useMemo(
    () => ({ account, chainId, connecting, provider, connect, disconnect }),
    [account, chainId, connecting, provider]
  );
  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}

export function useWallet() {
  return useContext(WalletCtx);
}
