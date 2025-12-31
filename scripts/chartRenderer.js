// Chart Renderer - Handles all Chart.js visualizations

let pieChartInstance = null;
let barChartInstance = null;
let lineChartInstance = null;

// Color scheme for categories - Calmer colors for dark mode
const categoryColors = {
    Shopping: 'rgba(124, 58, 237, 0.8)',
    Food: 'rgba(52, 211, 153, 0.8)',
    Other: 'rgba(251, 191, 36, 0.8)'
};

const categoryBorders = {
    Shopping: 'rgba(167, 139, 250, 1)',
    Food: 'rgba(110, 231, 183, 1)',
    Other: 'rgba(252, 211, 77, 1)'
};

// Render pie chart for spending breakdown
function renderPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    const breakdown = getSpendingBreakdown(getCurrentMonthValue());
    const categories = Object.keys(breakdown);
    const amounts = Object.values(breakdown);
    const total = amounts.reduce((sum, val) => sum + val, 0);
    
    // Destroy existing chart if it exists
    if (pieChartInstance) {
        pieChartInstance.destroy();
    }
    
    if (total === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: categories.map(cat => categoryColors[cat] || 'rgba(201, 203, 207, 0.8)'),
                borderColor: categories.map(cat => categoryBorders[cat] || 'rgba(201, 203, 207, 1)'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Render bar chart for budget vs spending
function renderBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    
    const data = getBudgetVsSpending(getCurrentMonthValue());
    
    // Destroy existing chart if it exists
    if (barChartInstance) {
        barChartInstance.destroy();
    }
    
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.categories,
            datasets: [
                {
                    label: 'Budget',
                    data: data.budgets,
                    backgroundColor: 'rgba(52, 211, 153, 0.6)',
                    borderColor: 'rgba(110, 231, 183, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Spending',
                    data: data.spending,
                    backgroundColor: 'rgba(124, 58, 237, 0.6)',
                    borderColor: 'rgba(167, 139, 250, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#cbd5e1',
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.5)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.5)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f1f5f9',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Render line chart for savings trend
function renderLineChart() {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;
    
    const savingsData = getAllTimeSavings();
    
    // Destroy existing chart if it exists
    if (lineChartInstance) {
        lineChartInstance.destroy();
    }
    
    if (savingsData.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    const labels = savingsData.map(d => {
        const [year, month] = d.month.split('-');
        return new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    const savings = savingsData.map(d => d.savings);
    
    lineChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Savings',
                data: savings,
                borderColor: 'rgba(52, 211, 153, 1)',
                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(110, 231, 183, 1)',
                pointBorderColor: 'rgba(52, 211, 153, 1)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    ticks: {
                        color: '#cbd5e1',
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.5)'
                    }
                },
                x: {
                    ticks: {
                        color: '#cbd5e1'
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.5)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#f1f5f9',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return 'Savings: $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Render progress bars for goals and budget status
function renderProgressBars() {
    const progressBarsContainer = document.getElementById('progressBars');
    if (!progressBarsContainer) return;
    
    const goals = getAllGoals();
    const currentMonth = getCurrentMonthValue();
    const budget = getMonthBudget(currentMonth);
    const categories = ['Shopping', 'Food', 'Other'];
    
    let html = '<div class="progress-section">';
    
    // Goals progress
    if (goals.length > 0) {
        html += '<h4>Goals Progress</h4>';
        goals.forEach(goal => {
            const progress = calculateGoalProgress(goal.id);
            if (progress) {
                const percentage = Math.min(progress.percentage, 100);
                html += `
                    <div class="progress-item">
                        <div class="progress-label">
                            <span>${goal.name}</span>
                            <span>${formatCurrency(progress.current)} / ${formatCurrency(progress.target)}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar goal-progress" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    // Budget status
    html += '<h4>Budget Status</h4>';
    categories.forEach(category => {
        const budgetLimit = budget[category] || 0;
        if (budgetLimit > 0) {
            const spent = calculateCategorySpending(currentMonth, category);
            const percentage = Math.min((spent / budgetLimit) * 100, 100);
            const status = getBudgetStatus(currentMonth, category);
            const statusClass = status === 'over' ? 'over-budget' : status === 'warning' ? 'warning-budget' : 'under-budget';
            
            html += `
                <div class="progress-item">
                    <div class="progress-label">
                        <span>${category}</span>
                        <span>${formatCurrency(spent)} / ${formatCurrency(budgetLimit)}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar ${statusClass}" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="progress-item">
                    <div class="progress-label">
                        <span>${category}</span>
                        <span>No budget set</span>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    progressBarsContainer.innerHTML = html;
}

// Update all charts
function updateAllCharts() {
    renderPieChart();
    renderBarChart();
    renderLineChart();
    renderProgressBars();
}

