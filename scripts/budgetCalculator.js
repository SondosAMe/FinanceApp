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

// Get previous month in YYYY-MM format
function getPreviousMonth(month) {
    const [year, monthNum] = month.split('-').map(Number);
    let prevYear = year;
    let prevMonth = monthNum - 1;
    
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
    }
    
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

// Calculate monthly savings only (without carryover) - for a single month
function calculateMonthlySavings(month) {
    const income = getMonthIncome(month);
    const spending = calculateTotalSpending(month);
    const fixedCosts = calculateTotalFixedCosts(month);
    return income - spending - fixedCosts;
}

// Calculate total savings for a month (including carryover from previous month)
// This calculates cumulative savings from December 2025 up to the given month
function calculateTotalSavings(month) {
    // Define the starting month (December 2025)
    const startMonth = '2025-12';
    
    // If calculating for start month, just return monthly savings (no carryover before this)
    if (month === startMonth) {
        const monthly = calculateMonthlySavings(month);
        return monthly > 0 ? monthly : 0;
    }
    
    // Get all months from start to current, sorted chronologically
    const presetMonths = ['2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', 
                          '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
    const allMonths = getAvailableMonths();
    const combinedMonths = [...new Set([...presetMonths, ...allMonths])].sort();
    
    // Find the index of start month and current month
    const startIndex = combinedMonths.indexOf(startMonth);
    const monthIndex = combinedMonths.indexOf(month);
    
    if (monthIndex === -1) {
        // Month not found, just return monthly savings
        return Math.max(calculateMonthlySavings(month), 0);
    }
    
    // If current month is before start month, just return monthly savings
    if (startIndex === -1 || monthIndex < startIndex) {
        return Math.max(calculateMonthlySavings(month), 0);
    }
    
    // Calculate cumulative savings from start month (Dec 2025) up to current month
    let cumulativeSavings = 0;
    for (let i = startIndex; i <= monthIndex; i++) {
        const currentMonth = combinedMonths[i];
        const monthlySavings = calculateMonthlySavings(currentMonth);
        cumulativeSavings += monthlySavings;
        // Only carry forward positive savings (don't accumulate debt)
        if (cumulativeSavings < 0) {
            cumulativeSavings = 0;
        }
    }
    
    return cumulativeSavings;
}

// Calculate carryover savings from previous month
function getCarryoverSavings(month) {
    // If it's the start month (Dec 2025), no carryover
    if (month === '2025-12') {
        return 0;
    }
    
    const previousMonth = getPreviousMonth(month);
    const previousTotal = calculateTotalSavings(previousMonth);
    // Only carry over positive savings
    return previousTotal > 0 ? previousTotal : 0;
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

