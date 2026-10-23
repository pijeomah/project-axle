export const createTransactionBuggy = async (req, res) => {
    // BUG 1: Extraction & Trust
    const { userId, amount, action_type, source_wallet_id, destination_wallet_id } = req.body 

    try {
        let transactionPayload;

        // BUG 2: Validation Oversight
        if (amount === 0) return res.status(400).json({ error: "Invalid amount" });

        if (action_type === 'TRANSFER') {
            // BUG 3: Logical Verification
            const { data: source } = await supabase.from('wallets').select('id').eq('id', source_wallet_id).single();
            const { data: dest } = await supabase.from('wallets').select('id').eq('id', destination_wallet_id).single();

            transactionPayload = {
                transactionData: { user_id: userId, description: "Transfer" },
                transactionLines: [
                    { wallet_id: source_wallet_id, amount, direction: 'credit' },
                    { wallet_id: destination_wallet_id, amount, direction: 'debit' }
                ]
            };
        }

        // BUG 4: The Order of Operations
        const { data: transaction } = await supabase.from('transactions').insert(transactionPayload.transactionData).select().single();

        const lines = transactionPayload.transactionLines.map(l => ({ ...l, transaction_id: transaction.id }));
        
        await supabase.from('transaction_lines').insert(lines);

        // BUG 5: The "Silent" Failure
        return res.status(201).json({ status: "Success" });

    } catch (err) {
        res.status(500).json({ err: err.message });
    }
}