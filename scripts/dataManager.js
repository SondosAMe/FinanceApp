// Data Manager - Handles localStorage operations and data structure

const STORAGE_KEY = 'financeAppData';

// Default data structure
const defaultData = {
    income: {}, // Changed to support arrays: { "2024-01": [{ source: "Salary", amount: 5000 }, ...] }
    transactions: [],
    budgets: {},
    goals: [],
    fixedCostTemplates: [
        { id: "1", name: "Car Payment", amount: 300 },
        { id: "2", name: "Gas", amount: 150 },
        { id: "3", name: "Phone bill", amount: 80 }
    ]
};

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Get current month in YYYY-MM format
function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Current month state (can be changed by user)
let currentMonth = getCurrentMonth();

// Get current selected month
function getCurrentMonthValue() {
    return currentMonth;
}

// Set current selected month
function setCurrentMonthValue(month) {
    currentMonth = month;
}

// Get all available months from data
function getAvailableMonths() {
    const data = loadData();
    const months = new Set();
    
    // Add months from income
    Object.keys(data.income).forEach(month => months.add(month));
    
    // Add months from transactions
    data.transactions.forEach(transaction => {
        const month = transaction.date.substring(0, 7);
        months.add(month);
    });
    
    // Add months from budgets
    Object.keys(data.budgets).forEach(month => months.add(month));
    
    return Array.from(months).sort().reverse();
}

// Load data from localStorage
function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            // Migrate old income format (single number) to new format (array)
            const income = data.income || {};
            Object.keys(income).forEach(month => {
                if (typeof income[month] === 'number') {
                    income[month] = [{ 
                        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                        source: "Income", 
                        amount: income[month] 
                    }];
                } else if (!Array.isArray(income[month])) {
                    income[month] = [];
                } else {
                    // Ensure all entries have IDs
                    income[month] = income[month].map(entry => {
                        if (!entry.id) {
                            entry.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                        }
                        return entry;
                    });
                }
            });
            // Migrate fixed cost templates to include IDs if missing
            const templates = data.fixedCostTemplates || defaultData.fixedCostTemplates;
            templates.forEach((template, index) => {
                if (!template.id) {
                    template.id = String(index + 1);
                }
            });
            // Ensure all required properties exist
            return {
                income: income,
                transactions: data.transactions || [],
                budgets: data.budgets || {},
                goals: data.goals || [],
                fixedCostTemplates: templates
            };
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
    return { ...defaultData };
}

// Save data to localStorage
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Get transactions for a specific month
function getMonthData(month) {
    const data = loadData();
    return data.transactions.filter(transaction => {
        const transactionMonth = transaction.date.substring(0, 7);
        return transactionMonth === month;
    });
}

// Get income for a specific month (total)
function getMonthIncome(month) {
    const data = loadData();
    const incomeArray = data.income[month] || [];
    if (Array.isArray(incomeArray)) {
        return incomeArray.reduce((total, entry) => total + (entry.amount || 0), 0);
    }
    return 0;
}

// Get income entries for a specific month
function getMonthIncomeEntries(month) {
    const data = loadData();
    return data.income[month] || [];
}

// Add income entry for a specific month
function addMonthIncome(month, source, amount) {
    const data = loadData();
    if (!data.income[month]) {
        data.income[month] = [];
    }
    if (!Array.isArray(data.income[month])) {
        data.income[month] = [{ source: "Income", amount: data.income[month] }];
    }
    data.income[month].push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        source: source || "Income",
        amount: parseFloat(amount)
    });
    return saveData(data);
}

// Remove income entry
function removeMonthIncome(month, incomeId) {
    if (!incomeId) {
        console.error('No income ID provided');
        return false;
    }
    const data = loadData();
    if (data.income[month] && Array.isArray(data.income[month])) {
        const beforeLength = data.income[month].length;
        data.income[month] = data.income[month].filter(entry => entry.id !== incomeId);
        const afterLength = data.income[month].length;
        
        if (beforeLength === afterLength) {
            console.warn('Income entry not found with ID:', incomeId);
            return false;
        }
        
        if (data.income[month].length === 0) {
            delete data.income[month];
        }
        return saveData(data);
    }
    return false;
}

// Update fixed cost template
function updateFixedCostTemplate(templateId, updates) {
    return updateData(data => {
        const template = data.fixedCostTemplates.find(t => t.id === templateId);
        if (template) {
            Object.assign(template, updates);
        }
        return data;
    });
}

// Add new fixed cost template
function addFixedCostTemplate(name, amount) {
    return updateData(data => {
        const newTemplate = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            name: name.trim(),
            amount: parseFloat(amount)
        };
        data.fixedCostTemplates.push(newTemplate);
        return data;
    });
}

// Delete fixed cost template
function deleteFixedCostTemplate(templateId) {
    return updateData(data => {
        data.fixedCostTemplates = data.fixedCostTemplates.filter(t => t.id !== templateId);
        return data;
    });
}

// Get budget for a specific month
function getMonthBudget(month) {
    const data = loadData();
    return data.budgets[month] || {};
}

// Set budget for a specific month
function setMonthBudget(month, category, amount) {
    const data = loadData();
    if (!data.budgets[month]) {
        data.budgets[month] = {};
    }
    data.budgets[month][category] = parseFloat(amount);
    return saveData(data);
}

// Get all data
function getAllData() {
    return loadData();
}

// Update data (for transactions, goals, etc.)
function updateData(updater) {
    const data = loadData();
    const updated = updater(data);
    return saveData(updated);
}

