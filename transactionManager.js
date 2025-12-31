// Transaction Manager - Handles CRUD operations for transactions

// Generate unique ID for transactions
function generateTransactionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add a new transaction
function addTransaction(transactionData) {
    const { amount, date, category, description, type = 'spending' } = transactionData;
    
    const transaction = {
        id: generateTransactionId(),
        amount: parseFloat(amount),
        date: date,
        category: category || null,
        description: description || '',
        type: type // 'spending' or 'fixed'
    };
    
    return updateData(data => {
        data.transactions.push(transaction);
        return data;
    });
}

// Delete a transaction by ID
function deleteTransaction(transactionId) {
    return updateData(data => {
        data.transactions = data.transactions.filter(t => t.id !== transactionId);
        return data;
    });
}

// Edit a transaction by ID
function editTransaction(transactionId, updates) {
    return updateData(data => {
        const index = data.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
            data.transactions[index] = {
                ...data.transactions[index],
                ...updates,
                amount: updates.amount !== undefined ? parseFloat(updates.amount) : data.transactions[index].amount
            };
        }
        return data;
    });
}

// Get transaction by ID
function getTransactionById(transactionId) {
    const data = loadData();
    return data.transactions.find(t => t.id === transactionId);
}

// Get transactions by category for a specific month
function getTransactionsByCategory(month, category) {
    const monthTransactions = getMonthData(month);
    return monthTransactions.filter(t => t.category === category && t.type === 'spending');
}

// Get all spending transactions for a month
function getSpendingTransactions(month) {
    const monthTransactions = getMonthData(month);
    return monthTransactions.filter(t => t.type === 'spending');
}

// Get all fixed cost transactions for a month
function getFixedCostTransactions(month) {
    const monthTransactions = getMonthData(month);
    return monthTransactions.filter(t => t.type === 'fixed');
}

// Get all transactions for a month
function getAllTransactions(month) {
    return getMonthData(month);
}

// Get transactions for a specific date
function getTransactionsByDate(date) {
    const data = loadData();
    return data.transactions.filter(transaction => transaction.date === date);
}

