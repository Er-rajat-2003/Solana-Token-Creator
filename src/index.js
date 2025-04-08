// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

require('@solana/wallet-adapter-react-ui/styles.css'); // REQUIRED for default styles

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter()
];

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
