import { BrowserProvider } from 'ethers'

/** @param {string | null | undefined} addr */
export function shortAddress(addr) {
  if (!addr || typeof addr !== 'string') return ''
  const a = addr.trim()
  if (a.length < 12) return a
  return `${a.slice(0, 6)}...${a.slice(-4)}`
}

function toHexChainId(decimal) {
  const n = Number(decimal)
  if (!Number.isFinite(n) || n < 0) return null
  return `0x${n.toString(16)}`
}

/** @returns {Promise<{ account: string; chainId: number }>} */
export async function connectMetaMask() {
  const eth = window.ethereum
  if (!eth) {
    throw new Error('No wallet found. Install MetaMask or another EVM wallet.')
  }
  const provider = new BrowserProvider(eth)
  const accounts = await eth.request({ method: 'eth_requestAccounts' })
  const account = accounts[0]
  if (!account) throw new Error('No account returned from wallet.')

  const raw = import.meta.env.VITE_WIREFLUID_CHAIN_ID
  if (raw != null && String(raw).trim() !== '') {
    const expectedHex = toHexChainId(raw)
    if (expectedHex) {
      const current = await eth.request({ method: 'eth_chainId' })
      if (current.toLowerCase() !== expectedHex.toLowerCase()) {
        await switchOrAddWireFluid(eth, expectedHex)
      }
    }
  }

  const network = await provider.getNetwork()
  return { account, chainId: Number(network.chainId) }
}

/** @param {any} eth @param {string} chainIdHex */
async function switchOrAddWireFluid(eth, chainIdHex) {
  const name = import.meta.env.VITE_WIREFLUID_NAME || 'WireFluid'
  const symbol = import.meta.env.VITE_WIREFLUID_SYMBOL || 'WF'
  const rpc = import.meta.env.VITE_WIREFLUID_RPC || 'https://rpc.wirefluid.com'
  const explorer = import.meta.env.VITE_WIREFLUID_EXPLORER || ''

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (e) {
    const code = e?.code
    if (code === 4902 || code === -32603) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: name,
            nativeCurrency: { name, symbol, decimals: 18 },
            rpcUrls: [rpc],
            blockExplorerUrls: explorer ? [explorer] : undefined,
          },
        ],
      })
      return
    }
    throw e
  }
}
