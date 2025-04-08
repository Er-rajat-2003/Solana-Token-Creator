import React, { useState } from "react";
import { transferTokens } from "./utils/transferTokens";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

const TransferTokenForm = ({ mintAddress }) => {
    const { publicKey, wallet } = useWallet();
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const connection = new Connection("https://api.devnet.solana.com");

    const handleTransfer = async () => {
        try {
            setLoading(true);
            setMessage("");

            const signature = await transferTokens(
                connection,
                new PublicKey(mintAddress),
                publicKey,
                new PublicKey(recipient),
                Number(amount),
                wallet.adapter
            );

            setMessage(` Transfer successful: ${signature}`);
        } catch (err) {
            setMessage(` Transfer failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transfer-box">
            <h2>Transfer Tokens</h2>
            <input
                type="text"
                placeholder="Recipient Wallet Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
            />
            <input
                type="number"
                placeholder="Amount to Transfer"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleTransfer} disabled={loading}>
                {loading ? "Transferring..." : "Send Tokens"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default TransferTokenForm;
