import {
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_PROGRAM_ID
} from '@solana/spl-token';

/**
 * Mint SPL tokens to a wallet
 * @param {Connection} connection - Solana connection object
 * @param {PublicKey} mintPublicKey - The token mint address
 * @param {PublicKey} destinationPublicKey - The wallet to receive the tokens
 * @param {number} amount - Number of tokens (in smallest unit, e.g., 1000000000 = 1 token with 9 decimals)
 * @param {object} wallet - Wallet adapter with publicKey and sendTransaction
 */
export const mintTokens = async (
    connection,
    mintPublicKey,
    destinationPublicKey,
    amount,
    wallet
) => {
    const { publicKey, sendTransaction } = wallet;

    if (!publicKey) throw new Error("Wallet not connected");

    // Step 1: Get or create associated token account for the recipient
    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mintPublicKey,
        destinationPublicKey
    );

    // Step 2: Mint tokens to the destination's token account
    await mintTo(
        connection,
        wallet,
        mintPublicKey,
        associatedTokenAccount.address,
        publicKey,
        amount
    );

    return associatedTokenAccount.address;
};
