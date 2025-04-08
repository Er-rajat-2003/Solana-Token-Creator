// src/App.js
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createNewToken } from './utils/createToken';
import { transferTokens } from './utils/transferTokens';
import { PublicKey } from '@solana/web3.js';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { Coins } from 'lucide-react';
import './App.css';

const App = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [mintAddress, setMintAddress] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesOptions = {
    background: {
      color: {
        value: "#0f172a"
      }
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: { enable: true, mode: "push" },
        onHover: { enable: true, mode: "repulse" },
        resize: true
      },
      modes: {
        push: { quantity: 4 },
        repulse: { distance: 100, duration: 0.4 }
      }
    },
    particles: {
      color: { value: "#ffffff" },
      links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.5, width: 1 },
      collisions: { enable: true },
      move: { direction: "none", enable: true, outModes: "bounce", random: false, speed: 2, straight: false },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.5 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 5 } }
    },
    detectRetina: true
  };

  const handleCreateToken = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first.');
      return;
    }

    if (!tokenName || !tokenSymbol) {
      alert('Please enter both token name and symbol.');
      return;
    }

    setLoading(true);

    try {
      const tokenAddress = await createNewToken(
        connection,
        {
          publicKey,
          sendTransaction,
          signTransaction,
        },
        tokenName,
        tokenSymbol,
        decimals
      );

      console.log('Token created at:', tokenAddress.toBase58());
      alert(`Token Created!\nToken Mint Address:\n${tokenAddress.toBase58()}`);
      setMintAddress(tokenAddress);
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Something went wrong while creating the token.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferTokens = async () => {
    if (!mintAddress || !recipient || !transferAmount) {
      alert('Please fill in all transfer fields.');
      return;
    }

    try {
      const signature = await transferTokens(
        connection,
        mintAddress,
        publicKey,
        new PublicKey(recipient),
        parseInt(transferAmount),
        {
          publicKey,
          sendTransaction,
          signTransaction
        }
      );

      alert(`Tokens Transferred!\nTx Signature:\n${signature}`);
      console.log('Transfer successful:', signature);
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Token transfer failed.');
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 500, margin: '50px auto', textAlign: 'center', color: '#fff' }}>
        <h1><Coins style={{ verticalAlign: 'middle' }} /> Solana SPL Token Creator</h1>
        <WalletMultiButton />

        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '0 16px', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="Token Name"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Token Symbol"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            style={styles.input}
          />
          <input
            type="number"
            placeholder="Decimals (e.g. 9)"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            style={styles.input}
          />

          <button
            onClick={handleCreateToken}
            disabled={!publicKey || !tokenName || !tokenSymbol || loading}
            style={{
              ...styles.button,
              backgroundColor: publicKey && tokenName && tokenSymbol ? '#4F46E5' : '#ccc',
              cursor: publicKey && tokenName && tokenSymbol ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? 'Creating...' : '➕ Create SPL Token'}
          </button>

          {mintAddress && (
            <div style={{ marginTop: 20 }}>
              <strong>Token Mint Address:</strong>
              <br />
              <code>{mintAddress.toBase58()}</code>
            </div>
          )}

          {mintAddress && (
            <>
              <br /><br />
              <input
                type="text"
                placeholder="Recipient Wallet Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="Amount to Transfer"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                style={styles.input}
              />
              <button
                onClick={handleTransferTokens}
                style={{
                  ...styles.button,
                  backgroundColor: recipient && transferAmount ? '#10B981' : '#ccc',
                  cursor: recipient && transferAmount ? 'pointer' : 'not-allowed',
                }}
              >
                Transfer Tokens
              </button>
            </>
          )}
        </div>
        <footer style={{ marginTop: 60, fontSize: 14, color: '#aaa', lineHeight: '1.6' }}>
          <div>© 2025 Rajat Varshney <strong>Persist Ventures</strong></div>

        </footer>
      </div>
    </div>
  );
};

const styles = {
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '6px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '6px',
    border: 'none',
    color: '#fff',
    marginTop: '10px',
  },
};

export default App;
