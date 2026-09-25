// Crypto checkout helpers: build a USDC transfer and verify an on-chain payment receipt.
// Runs in the buyer's browser (no server); also loaded by node tests.
const NETWORKS = {
  base: { chainId: 8453, name: 'Base', rpc: 'https://mainnet.base.org', explorer: 'https://basescan.org/tx/',
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
  ethereum: { chainId: 1, name: 'Ethereum', rpc: 'https://ethereum-rpc.publicnode.com', explorer: 'https://etherscan.io/tx/',
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  arbitrum: { chainId: 42161, name: 'Arbitrum One', rpc: 'https://arb1.arbitrum.io/rpc', explorer: 'https://arbiscan.io/tx/',
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
  polygon: { chainId: 137, name: 'Polygon', rpc: 'https://polygon-rpc.com', explorer: 'https://polygonscan.com/tx/',
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' },
};
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const USDC_DECIMALS = 6;

function toUnits(amount) {
  // "19.5" -> 19500000n without floating-point error
  const [whole, frac = ''] = String(amount).split('.');
  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt((frac + '000000').slice(0, USDC_DECIMALS) || '0');
}

function pad32(hexNoPrefix) {
  return hexNoPrefix.toLowerCase().padStart(64, '0');
}

function encodeTransfer(to, amount) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(to)) throw new Error('bad address');
  return '0xa9059cbb' + pad32(to.slice(2)) + pad32(toUnits(amount).toString(16));
}

// Returns the USDC amount (in base units) paid to `to` in this receipt, or throws with a reason.
function verifyReceipt(receipt, { token, to, minAmount }) {
  if (!receipt) throw new Error('Transaction not found yet – wait a minute and try again.');
  if (receipt.status !== '0x1') throw new Error('That transaction failed on-chain.');
  const want = '0x' + pad32(to.slice(2));
  let paid = 0n;
  for (const log of receipt.logs || []) {
    if (log.address.toLowerCase() === token.toLowerCase() && log.topics[0] === TRANSFER_TOPIC
        && log.topics[2].toLowerCase() === want) {
      paid += BigInt(log.data);
    }
  }
  if (paid === 0n) throw new Error('No USDC payment to the shop wallet found in that transaction.');
  if (paid < toUnits(minAmount)) throw new Error(`Payment too small: received ${Number(paid) / 1e6} USDC.`);
  return paid;
}

async function rpc(url, method, params) {
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const j = await res.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

const api = { NETWORKS, TRANSFER_TOPIC, toUnits, encodeTransfer, verifyReceipt, rpc };
if (typeof module !== 'undefined') module.exports = api;
else window.Crypto$ = api;
