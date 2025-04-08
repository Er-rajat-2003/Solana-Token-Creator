import {
    getOrCreateAssociatedTokenAccount,
    transfer,
} from "@solana/spl-token";

/**
 * Transfers SPL tokens to a recipient.
 */
export const transferTokens = async (
    connection,
    mintAddress,
    senderPublicKey,
    recipientPublicKey,
    amount,
    wallet
) => {
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mintAddress,
        senderPublicKey
    );

    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mintAddress,
        recipientPublicKey
    );

    const txSignature = await transfer(
        connection,
        wallet,
        senderTokenAccount.address,
        recipientTokenAccount.address,
        senderPublicKey,
        amount
    );

    return txSignature;
};
