import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
} from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";

/**
 * Creates a new SPL token and mints 1 million tokens to the user's wallet.
 * @returns {Promise<PublicKey>} The mint address of the created token.
 */
export const createNewToken = async (connection, wallet, name, symbol, decimals = 9) => {
    const mintAuthority = wallet.publicKey;
    const freezeAuthority = wallet.publicKey;

    // Generate a new Keypair for the token mint
    const mint = await createMint(
        connection,
        wallet, // payer
        mintAuthority,
        freezeAuthority,
        decimals
    );

    // Create token account (ATA) for the user if it doesn’t exist
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey
    );

    // Mint some initial supply (optional — let's mint 1 million tokens)
    await mintTo(
        connection,
        wallet,
        mint,
        tokenAccount.address,
        mintAuthority,
        1_000_000 * Math.pow(10, decimals)
    );

    return mint;
};
