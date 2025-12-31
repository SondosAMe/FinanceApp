// UI Controller - Handles all UI rendering and updates

// Format month for display (YYYY-MM to "Month Year")
function formatMonth(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Update dashboard metrics
function updateDashboard() {
    const month = getCurrentMonthValue();
    const income = getMonthIncome(month);
    const spending = calculateTotalSpending(month);
    const fixedCosts = calculateTotalFixedCosts(month);
    const savings = calculateTotalSavings(month);
    
    document.getElementById('incomeDisplay').textContent = formatCurrency(income);
    document.getElementById('spendingDisplay').textContent = formatCurrency(spending);
    document.getElementById('fixedCostsDisplay').textContent = formatCurrency(fixedCosts);
    document.getElementById('savingsDisplay').textContent = formatCurrency(savings);
    
    // Update savings color
    const savingsEl = document.getElementById('savingsDisplay');
    savingsEl.className = savings >= 0 ? 'metric-value savings positive' : 'metric-value savings negative';
}

// Generate months from December 2025 through December 2026
function generatePresetMonths() {
    const months = [];
    // December 2025
    months.push('2025-12');
    // All months of 2026
    for (let month = 1; month <= 12; month++) {
        const monthStr = `2026-${String(month).padStart(2, '0')}`;
        months.push(monthStr);
    }
    return months;
}

// Update month selector
function updateMonthSelector() {
    const monthSelect = document.getElementById('monthSelect');
    const dataMonths = getAvailableMonths();
    const presetMonths = generatePresetMonths();
    const currentMonth = getCurrentMonthValue();
    
    // Combine preset months with data months, remove duplicates
    const allMonths = new Set([...presetMonths, ...dataMonths]);
    
    // Add current month if not in list
    if (!allMonths.has(getCurrentMonth())) {
        allMonths.add(getCurrentMonth());
    }
    
    // Convert to array and sort (newest first)
    const sortedMonths = Array.from(allMonths).sort().reverse();
    
    monthSelect.innerHTML = '';
    sortedMonths.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = formatMonth(month);
        if (month === currentMonth) {
            option.selected = true;
        }
        monthSelect.appendChild(option);
    });
}

// Render transactions list
function renderTransactionsList() {
    const transactionsList = document.getElementById('transactionsList');
    const month = getCurrentMonthValue();
    const transactions = getAllTransactions(month);
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-message">No transactions for this month.</p>';
        return;
    }
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    transactionsList.innerHTML = transactions.map(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const categoryBadge = transaction.category 
            ? `<span class="category-badge category-${transaction.category.toLowerCase()}">${transaction.category}</span>`
            : '';
        
        const typeBadge = transaction.type === 'fixed' 
            ? '<span class="type-badge fixed">Fixed</span>'
            : '<span class="type-badge spending">Spending</span>';
        
        return `
            <div class="transaction-item">
                <div class="transaction-main">
                    <div class="transaction-info">
                        <div class="transaction-header">
                            ${categoryBadge}
                            ${typeBadge}
                        </div>
                        <div class="transaction-date">${date}</div>
                        ${transaction.description ? `<div class="transaction-description">${transaction.description}</div>` : ''}
                    </div>
                    <div class="transaction-amount">${formatCurrency(transaction.amount)}</div>
                </div>
                <div class="transaction-actions">
                    <button class="btn-delete" data-id="${transaction.id}">Delete</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add delete event listeners
    transactionsList.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(id);
                updateAll();
                showNotification('Transaction deleted successfully');
            }
        });
    });
}

// Render goals list
function renderGoalsList() {
    const goalsList = document.getElementById('goalsList');
    const goals = getAllGoals();
    
    if (goals.length === 0) {
        goalsList.innerHTML = '<p class="empty-message">No goals set. Add a goal to start tracking!</p>';
        return;
    }
    
    goalsList.innerHTML = goals.map(goal => {
        const progress = calculateGoalProgress(goal.id);
        const percentage = progress ? progress.percentage : 0;
        const current = progress ? progress.current : 0;
        const target = progress ? progress.target : goal.targetAmount;
        
        return `
            <div class="goal-item">
                <div class="goal-header">
                    <h4>${goal.name}</h4>
                    <button class="btn-delete-goal" data-id="${goal.id}">Delete</button>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="goal-amounts">
                        <span>${formatCurrency(current)}</span>
                        <span>of ${formatCurrency(target)}</span>
                    </div>
                </div>
                <div class="goal-add-amount">
                    <input type="number" class="goal-amount-input" data-id="${goal.id}" step="0.01" min="0" placeholder="Add amount">
                    <button class="btn-add-to-goal" data-id="${goal.id}">Add</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Add event listeners for adding to goals
    goalsList.querySelectorAll('.btn-add-to-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = e.target.dataset.id;
            const input = document.querySelector(`.goal-amount-input[data-id="${goalId}"]`);
            const amount = parseFloat(input.value);
            
            if (amount && amount > 0) {
                addToGoal(goalId, amount);
                input.value = '';
                updateAll();
                showNotification('Amount added to goal');
            } else {
                showNotification('Please enter a valid amount', 'error');
            }
        });
    });
    
    // Add delete event listeners
    goalsList.querySelectorAll('.btn-delete-goal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const goalId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this goal?')) {
                updateData(data => {
                    data.goals = data.goals.filter(g => g.id !== goalId);
                    return data;
                });
                updateAll();
                showNotification('Goal deleted successfully');
            }
        });
    });
}

// Render income list
function renderIncomeList() {
    const incomeList = document.getElementById('incomeList');
    const month = getCurrentMonthValue();
    const incomeEntries = getMonthIncomeEntries(month);
    
    if (incomeEntries.length === 0) {
        incomeList.innerHTML = '<p class="empty-message">No income entries for this month.</p>';
        return;
    }
    
    incomeList.innerHTML = incomeEntries.map(entry => `
        <div class="income-item">
            <div class="income-info">
                <span class="income-source">${entry.source || 'Income'}</span>
                <span class="income-amount">${formatCurrency(entry.amount || 0)}</span>
            </div>
            <button type="button" class="btn-delete-income" data-id="${entry.id || ''}">Delete</button>
        </div>
    `).join('');
    
    // Add delete event listeners
    incomeList.querySelectorAll('.btn-delete-income').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = btn.dataset.id || e.currentTarget.dataset.id;
            if (id && confirm('Are you sure you want to delete this income entry?')) {
                removeMonthIncome(month, id);
                updateAll();
                updateAllCharts();
                showNotification('Income entry deleted successfully');
            }
        });
    });
}

// Render fixed costs templates
function renderFixedCostsTemplates() {
    const fixedCostsGrid = document.getElementById('fixedCostsGrid');
    const data = loadData();
    const templates = data.fixedCostTemplates || [];
    
    if (templates.length === 0) {
        fixedCostsGrid.innerHTML = '<p class="empty-message">No fixed cost templates. Add one above!</p>';
        return;
    }
    
    fixedCostsGrid.innerHTML = templates.map(template => `
        <div class="fixed-cost-item">
            <button class="fixed-cost-btn" data-name="${template.name}" data-amount="${template.amount}" data-id="${template.id}">
                <div class="fixed-cost-name">${template.name}</div>
                <div class="fixed-cost-amount">${formatCurrency(template.amount)}</div>
            </button>
            <div class="fixed-cost-actions">
                <button class="btn-edit-template" data-id="${template.id}" data-name="${template.name}" data-amount="${template.amount}" title="Edit amount">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11.5 2.5a2.121 2.121 0 0 1 3 3L6.5 13.5l-4 1 1-4L11.5 2.5z"/>
                    </svg>
                </button>
                <button type="button" class="btn-delete-template" data-id="${template.id}" data-name="${template.name}" title="Delete template">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 4h10M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m2 0v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4h10zM6 7v4M10 7v4"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add delete event listeners
    fixedCostsGrid.querySelectorAll('.btn-delete-template').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const templateId = btn.dataset.id;
            const templateName = btn.dataset.name;
            if (confirm(`Are you sure you want to delete the "${templateName}" template?`)) {
                deleteFixedCostTemplate(templateId);
                updateAll();
                showNotification('Fixed cost template deleted successfully');
            }
        });
    });
}

// Update budget inputs with current values
function updateBudgetInputs() {
    const month = getCurrentMonthValue();
    const budget = getMonthBudget(month);
    document.getElementById('budgetShopping').value = budget.Shopping || '';
    document.getElementById('budgetFood').value = budget.Food || '';
    document.getElementById('budgetOther').value = budget.Other || '';
}

// Set current month
function setCurrentMonth(month) {
    setCurrentMonthValue(month);
    updateAll();
}


// Render calendar view
function renderCalendar() {
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;
    
    const month = getCurrentMonthValue();
    const [year, monthNum] = month.split('-').map(Number);
    const transactions = getAllTransactions(month);
    
    // Calculate spending per day
    const dailySpending = {};
    transactions.forEach(transaction => {
        const date = transaction.date;
        if (!dailySpending[date]) {
            dailySpending[date] = 0;
        }
        dailySpending[date] += transaction.amount;
    });
    
    // Get max spending for color scaling
    const maxSpending = Math.max(...Object.values(dailySpending), 1);
    
    // Get first day of month and number of days
    const firstDay = new Date(year, monthNum - 1, 1);
    const lastDay = new Date(year, monthNum, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Generate calendar HTML
    let html = '<div class="calendar">';
    html += '<div class="calendar-header">';
    html += '<div class="calendar-month-year">' + formatMonth(month) + '</div>';
    html += '</div>';
    html += '<div class="calendar-weekdays">';
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });
    html += '</div>';
    html += '<div class="calendar-days">';
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const spending = dailySpending[dateStr] || 0;
        const opacity = maxSpending > 0 ? Math.min(spending / maxSpending, 1) : 0;
        const intensity = Math.min(opacity * 100, 100);
        const hasTransactions = spending > 0;
        
        html += `<div class="calendar-day clickable" data-date="${dateStr}" style="background-color: rgba(239, 68, 68, ${0.3 + opacity * 0.7});" title="${dateStr}: ${formatCurrency(spending)}">`;
        html += `<div class="calendar-day-number">${day}</div>`;
        if (spending > 0) {
            html += `<div class="calendar-day-amount">${formatCurrency(spending)}</div>`;
        }
        html += '</div>';
    }
    
    html += '</div></div>';
    calendarContainer.innerHTML = html;
    
    // Add click handlers to all calendar days
    calendarContainer.querySelectorAll('.calendar-day.clickable').forEach(dayEl => {
        dayEl.addEventListener('click', () => {
            const date = dayEl.dataset.date;
            showDayBreakdown(date);
        });
    });
}

// Show day breakdown modal
function showDayBreakdown(date) {
    const modal = document.getElementById('dayBreakdownModal');
    const modalTitle = document.getElementById('modalDateTitle');
    const transactionsList = document.getElementById('dayTransactionsList');
    
    const transactions = getTransactionsByDate(date);
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modalTitle.textContent = `Transactions for ${formattedDate}`;
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-message">No transactions on this day.</p>';
    } else {
        const total = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        transactionsList.innerHTML = `
            <div class="day-summary">
                <div class="day-total">
                    <span>Total Spending:</span>
                    <span class="day-total-amount">${formatCurrency(total)}</span>
                </div>
                <div class="day-count">${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="day-transactions">
                ${transactions.map(transaction => {
                    const time = new Date(transaction.date + 'T12:00:00').toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                    
                    const categoryBadge = transaction.category 
                        ? `<span class="category-badge category-${transaction.category.toLowerCase()}">${transaction.category}</span>`
                        : '';
                    
                    const typeBadge = transaction.type === 'fixed' 
                        ? '<span class="type-badge fixed">Fixed</span>'
                        : '<span class="type-badge spending">Spending</span>';
                    
                    return `
                        <div class="day-transaction-item">
                            <div class="day-transaction-main">
                                <div class="day-transaction-info">
                                    <div class="day-transaction-header">
                                        ${categoryBadge}
                                        ${typeBadge}
                                    </div>
                                    ${transaction.description ? `<div class="day-transaction-description">${transaction.description}</div>` : ''}
                                    <div class="day-transaction-time">${time}</div>
                                </div>
                                <div class="day-transaction-amount">${formatCurrency(transaction.amount)}</div>
                            </div>
                            <div class="day-transaction-actions">
                                <button type="button" class="btn-delete" data-id="${transaction.id}">Delete</button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add delete event listeners
        transactionsList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this transaction?')) {
                    deleteTransaction(id);
                    updateAll();
                    updateAllCharts();
                    showDayBreakdown(date); // Refresh the modal
                    showNotification('Transaction deleted successfully');
                }
            });
        });
    }
    
    modal.style.display = 'flex';
}

// Close day breakdown modal
function closeDayBreakdown() {
    const modal = document.getElementById('dayBreakdownModal');
    modal.style.display = 'none';
}

// Update all UI elements
function updateAll() {
    updateDashboard();
    renderTransactionsList();
    renderGoalsList();
    renderIncomeList();
    updateBudgetInputs();
    renderFixedCostsTemplates();
    renderCalendar();
    updateMonthSelector();
    
    // Update charts (will be called from chartRenderer)
    if (typeof updateAllCharts === 'function') {
        updateAllCharts();
    }
}

