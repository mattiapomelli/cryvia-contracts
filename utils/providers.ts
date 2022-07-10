import { ethers } from 'ethers'

const networkUrls: Record<string, string> = {
  mumbai: process.env.MUMBAI_URL || '',
}

export function getProvider(network = 'mumbai') {
  return new ethers.providers.JsonRpcProvider(networkUrls[network])
}
