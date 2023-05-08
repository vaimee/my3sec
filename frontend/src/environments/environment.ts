export const environment = {
  production: true,
  contracts: {
    my3secHub: '0x5771643101336a0104dE6b93f12e0AEC7d323473',
    my3secToken: '0xC2BaeD9A13d2e4AffBb81F9bC5566D5ef3d93C06',
    my3secProfiles: '0x3cD053F9a2295ffC480C32C6F3141d73099eCfE2',
    energyManager: '0x06E3287CAdB5881F65738AB371e4c3fa77653447',
  },
  chain: {
    rpcUrls: ['https://bellecour.iex.ec'],
    chainName: 'bellecour',
    chainId: '0x86',
    blockExplorerUrls: ['https://blockscout-bellecour.iex.ec/'],
    nativeCurrency: {
      symbol: 'RLC',
      decimals: 18,
    },
  },
  abiPaths: {
    my3secHub: '../../../assets/contracts/my3sec-hub.abi.json',
  },
};
