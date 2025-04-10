import React, { useState,useCallback } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer, getAccount } from '@solana/spl-token';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { Coins } from 'lucide-react';

const App = () => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [mintAddress, setMintAddress] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [creatorBalance, setCreatorBalance] = useState(0);
  const [recipientBalance, setRecipientBalance] = useState(null);

  const { publicKey} = useWallet();
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const handleCreateToken = async () => {
    try {
      setLoading(true);
      const mint = await createMint(
        connection,
        Keypair.generate(), // Payer (You can replace this with wallet signer if needed)
        publicKey,
        null,
        decimals
      );

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        Keypair.generate(), // Again replace with payer if needed
        mint,
        publicKey
      );

      await mintTo(
        connection,
        Keypair.generate(),
        mint,
        fromTokenAccount.address,
        publicKey,
        1000 * 10 ** decimals
      );

      setMintAddress(mint);

      const accountInfo = await getAccount(connection, fromTokenAccount.address);
      setCreatorBalance(Number(accountInfo.amount) / 10 ** decimals);
    } catch (error) {
      console.error('Token creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferTokens = async () => {
    try {
      const mint = new PublicKey(mintAddress);
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, Keypair.generate(), mint, publicKey);
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, Keypair.generate(), mint, new PublicKey(recipient));

      await transfer(
        connection,
        Keypair.generate(),
        fromTokenAccount.address,
        toTokenAccount.address,
        publicKey,
        Number(transferAmount) * 10 ** decimals
      );

      const accountInfo = await getAccount(connection, toTokenAccount.address);
      setRecipientBalance(Number(accountInfo.amount) / 10 ** decimals);
    } catch (error) {
      console.error('Token transfer failed:', error);
    }
  };

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const particlesOptions = {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 80 },
      size: { value: 3 },
      color: { value: '#00f2ff' },
      links: { enable: true, color: '#00f2ff' },
      move: { enable: true, speed: 1 },
    },
  };

  return (
    <div style={{
      position: 'relative',
      height: '100vh',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite',
    }}>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />

      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 520,
        margin: '60px auto',
        padding: '40px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
        textAlign: 'center',
        color: '#e0f2fe',
        backdropFilter: 'blur(10px)',
      }}>
        <h1 style={{ marginBottom: 20, fontSize: 28 }}>
          <Coins style={{ verticalAlign: 'middle', color: '#22d3ee' }} />{' '}
          Solana SPL Token Creator
        </h1>

        <WalletMultiButton />

        <input type="text" placeholder="Token Name" value={tokenName} onChange={(e) => setTokenName(e.target.value)} style={styles.input} />
        <input type="text" placeholder="Token Symbol" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)} style={styles.input} />
        <input type="number" placeholder="Decimals (e.g. 9)" value={decimals} onChange={(e) => setDecimals(Number(e.target.value))} style={styles.input} />

        <button
          onClick={handleCreateToken}
          disabled={!publicKey || !tokenName || !tokenSymbol || loading}
          style={{
            ...styles.button,
            backgroundColor: publicKey && tokenName && tokenSymbol ? '#0ea5e9' : '#475569',
            cursor: publicKey && tokenName && tokenSymbol ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Creating...' : '➕ Create SPL Token'}
        </button>

        {mintAddress && (
          <div style={{ marginTop: 30, fontSize: 16 }}>
            <strong style={{ color: '#34d399' }}>✅ Token Mint Address:</strong><br />
            <code style={{ wordBreak: 'break-all' }}>{mintAddress.toBase58()}</code><br /><br />
            <strong style={{ color: '#eab308' }}>👤 Your Token Balance:</strong> {creatorBalance} {tokenSymbol}
          </div>
        )}

        {mintAddress && (
          <>
            <input type="text" placeholder="Recipient Wallet Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} style={styles.input} />
            <input type="number" placeholder="Amount to Transfer" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} style={styles.input} />
            <button
              onClick={handleTransferTokens}
              style={{
                ...styles.button,
                backgroundColor: recipient && transferAmount ? '#10b981' : '#475569',
                cursor: recipient && transferAmount ? 'pointer' : 'not-allowed'
              }}
            >
              🚀 Transfer Tokens
            </button>
            {recipientBalance !== null && (
              <div style={{ marginTop: 10, fontSize: 16 }}>
                <strong style={{ color: '#facc15' }}>🎯 Recipient Balance:</strong> {recipientBalance} {tokenSymbol}
              </div>
            )}
          </>
        )}

        <footer style={{ marginTop: 60, fontSize: 13, color: '#94a3b8', lineHeight: '1.6' }}>
          <div>© 2025 Rajat Varshney</div>
          <div>Assignment, <strong style={{ color: '#38bdf8' }}>Systemic Altruism</strong> & <strong style={{ color: '#a78bfa' }}>Persist Ventures</strong></div>
        </footer>
      </div>
    </div>
  );
};

const styles = {
  input: {
    width: '100%',
    padding: '14px',
    margin: '12px 0',
    fontSize: '16px',
    backgroundColor: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid #334155',
    borderRadius: '8px',
    outline: 'none',
    transition: '0.3s',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    color: '#fff',
    marginTop: '12px',
    transition: '0.3s',
  },
};

export default App;
