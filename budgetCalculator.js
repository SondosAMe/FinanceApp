// Budget Calculator - Handles all budget and financial calculations

// Calculate total spending for a category in a month
function calculateCategorySpending(month, category) {
    const transactions = getTransactionsByCategory(month, category);
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

// Calculate total spending for all categories in a month
function calculateTotalSpending(month) {
    const spendingTransactions = getSpendingTransactions(month);
    return spendingTransactions.reduce((total, transaction) => total + transaction.amount, 0);
}

// Calculate total fixed costs for a month
function calculateTotalFixedCosts(month) {
    const fixedTransactions = getFixedCostTransactions(month);
    return fixedTransactions.reduce((total, transaction) => total + transaction.amount, 0);
}

// Calculate remaining budget for a category
function calculateRemainingBudget(month, category) {
    const budget = getMonthBudget(month);
    const budgetLimit = budget[category] || 0;
    const spent = calculateCategorySpending(month, category);
    return budgetLimit - spent;
}

// Calculate total savings for a month
function calculateTotalSavings(month) {
    const income = getMonthIncome(month);
    const spending = calculateTotalSpending(month);
    const fixedCosts = calculateTotalFixedCosts(month);
    return income - spending - fixedCosts;
}

// Calculate goal progress
function calculateGoalProgress(goalId) {
    const data = loadData();
    const goal = data.goals.find(g => g.id === goalId);
    if (!goal) return null;
    
    return {
        current: goal.currentAmount || 0,
        target: goal.targetAmount,
        percentage: goal.targetAmount > 0 
            ? Math.min((goal.currentAmount || 0) / goal.targetAmount * 100, 100) 
            : 0
    };
}

// Get budget status for a category (over/under/on track)
function getBudgetStatus(month, category) {
    const budget = getMonthBudget(month);
    const budgetLimit = budget[category] || 0;
    const spent = calculateCategorySpending(month, category);
    
    if (budgetLimit === 0) return 'no-budget';
    if (spent > budgetLimit) return 'over';
    if (spent === budgetLimit) return 'at-limit';
    const percentage = (spent / budgetLimit) * 100;
    if (percentage >= 80) return 'warning';
    return 'under';
}

// Get spending breakdown by category for a month
function getSpendingBreakdown(month) {
    const categories = ['Shopping', 'Food', 'Other'];
    const breakdown = {};
    
    categories.forEach(category => {
        breakdown[category] = calculateCategorySpending(month, category);
    });
    
    return breakdown;
}

// Get all-time savings data for trend chart
function getAllTimeSavings() {
    const months = getAvailableMonths();
    const savingsData = [];
    
    months.forEach(month => {
        const savings = calculateTotalSavings(month);
        savingsData.push({
            month: month,
            savings: savings
        });
    });
    
    return savingsData.sort((a, b) => a.month.localeCompare(b.month));
}

// Get budget vs spending data for bar chart
function getBudgetVsSpending(month) {
    const budget = getMonthBudget(month);
    const categories = ['Shopping', 'Food', 'Other'];
    const data = {
        categories: [],
        budgets: [],
        spending: []
    };
    
    categories.forEach(category => {
        data.categories.push(category);
        data.budgets.push(budget[category] || 0);
        data.spending.push(calculateCategorySpending(month, category));
    });
    
    return data;
}

// Add amount to goal
function addToGoal(goalId, amount) {
    return updateData(data => {
        const goal = data.goals.find(g => g.id === goalId);
        if (goal) {
            goal.currentAmount = (goal.currentAmount || 0) + parseFloat(amount);
        }
        return data;
    });
}

// Get all goals
function getAllGoals() {
    const data = loadData();
    return data.goals;
}

