// Main App Logic - Initializes app and handles event listeners

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const transactionDateInput = document.getElementById('transactionDate');
    if (transactionDateInput) {
        transactionDateInput.value = today;
    }
    
    // Initialize UI
    updateAll();
    updateAllCharts();
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Income form
    const incomeForm = document.getElementById('incomeForm');
    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const source = document.getElementById('incomeSource').value.trim();
        const amount = parseFloat(document.getElementById('incomeAmount').value);
        const month = getCurrentMonthValue();
        
        if (source && amount && amount > 0) {
            addMonthIncome(month, source, amount);
            updateAll();
            updateAllCharts();
            incomeForm.reset();
            showNotification('Income added successfully');
        } else {
            showNotification('Please enter a valid income source and amount', 'error');
        }
    });
    
    // Transaction form
    const transactionForm = document.getElementById('transactionForm');
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const date = document.getElementById('transactionDate').value;
        const category = document.getElementById('transactionCategory').value;
        const description = document.getElementById('transactionDescription').value;
        
        if (amount && amount > 0 && date && category) {
            addTransaction({
                amount: amount,
                date: date,
                category: category,
                description: description,
                type: 'spending'
            });
            updateAll();
            updateAllCharts();
            transactionForm.reset();
            document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
            showNotification('Transaction added successfully');
        } else {
            showNotification('Please fill in all required fields', 'error');
        }
    });
    
    // Fixed costs buttons (add transaction)
    document.addEventListener('click', (e) => {
        if (e.target.closest('.fixed-cost-btn')) {
            const btn = e.target.closest('.fixed-cost-btn');
            const name = btn.dataset.name;
            const amount = parseFloat(btn.dataset.amount);
            const today = new Date().toISOString().split('T')[0];
            
            addTransaction({
                amount: amount,
                date: today,
                category: name,
                description: name,
                type: 'fixed'
            });
            
            updateAll();
            updateAllCharts();
            showNotification(`${name} added successfully`);
        }
        
        // Edit fixed cost template
        if (e.target.closest('.btn-edit-template')) {
            e.preventDefault();
            e.stopPropagation();
            const btn = e.target.closest('.btn-edit-template');
            const templateId = btn.dataset.id;
            const currentName = btn.dataset.name;
            const currentAmount = parseFloat(btn.dataset.amount);
            
            const newAmount = prompt(`Edit amount for ${currentName}:`, currentAmount);
            if (newAmount !== null && !isNaN(newAmount) && parseFloat(newAmount) >= 0) {
                updateFixedCostTemplate(templateId, { amount: parseFloat(newAmount) });
                updateAll();
                showNotification('Fixed cost template updated successfully');
            }
        }
    });
    
    // Fixed cost template form
    const fixedCostTemplateForm = document.getElementById('fixedCostTemplateForm');
    if (fixedCostTemplateForm) {
        fixedCostTemplateForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('templateName').value.trim();
            const amount = parseFloat(document.getElementById('templateAmount').value);
            
            if (name && amount && amount >= 0) {
                addFixedCostTemplate(name, amount);
                updateAll();
                fixedCostTemplateForm.reset();
                showNotification('Fixed cost template added successfully');
            } else {
                showNotification('Please enter a valid template name and amount', 'error');
            }
        });
    }
    
    // Budget save buttons
    document.querySelectorAll('.btn-save-budget').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            const inputId = `budget${category}`;
            const input = document.getElementById(inputId);
            const amount = parseFloat(input.value);
            const month = getCurrentMonthValue();
            
            if (amount && amount >= 0) {
                setMonthBudget(month, category, amount);
                updateAll();
                updateAllCharts();
                showNotification(`${category} budget set successfully`);
            } else {
                showNotification('Please enter a valid budget amount', 'error');
            }
        });
    });
    
    // Goal form
    const goalForm = document.getElementById('goalForm');
    goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('goalName').value.trim();
        const targetAmount = parseFloat(document.getElementById('goalTarget').value);
        
        if (name && targetAmount && targetAmount > 0) {
            updateData(data => {
                const newGoal = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    name: name,
                    targetAmount: targetAmount,
                    currentAmount: 0
                };
                data.goals.push(newGoal);
                return data;
            });
            
            updateAll();
            updateAllCharts();
            goalForm.reset();
            showNotification('Goal added successfully');
        } else {
            showNotification('Please enter a valid goal name and target amount', 'error');
        }
    });
    
    // Month selector
    const monthSelect = document.getElementById('monthSelect');
    monthSelect.addEventListener('change', (e) => {
        setCurrentMonth(e.target.value);
        updateAllCharts();
    });
    
    // Modal close button
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            closeDayBreakdown();
        });
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('dayBreakdownModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDayBreakdown();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('dayBreakdownModal');
            if (modal && modal.style.display === 'flex') {
                closeDayBreakdown();
            }
        }
    });
}

