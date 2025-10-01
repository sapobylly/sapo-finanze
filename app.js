console.log('🔥 VERSIONE DEBUG SapoTracker v2.0 - CARICAMENTO');
// SapoTracker - Gestione Finanze Personali
class SapoTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('sapoTransactions')) || [];
        this.trendChart = null;
        this.categoryChart = null;
        this.init();
    }

    init() {
        console.log('🚀 Inizializzazione SapoTracker...');
        this.setupEventListeners();
        this.updateDashboard();
        this.initCharts();
        console.log('✅ SapoTracker inizializzato correttamente');
    }

    setupEventListeners() {
        // Income Form
        const incomeForm = document.getElementById('incomeForm');
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => this.handleIncomeSubmit(e));
        }

        // Expense Form
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => this.handleExpenseSubmit(e));
        }

        // Quick Expense Form
        const quickExpenseForm = document.getElementById('quickExpenseForm');
        if (quickExpenseForm) {
            quickExpenseForm.addEventListener('submit', (e) => this.handleQuickExpenseSubmit(e));
        }

        // Investment Form
        const investmentForm = document.getElementById('investmentForm');
        if (investmentForm) {
            investmentForm.addEventListener('submit', (e) => this.handleInvestmentSubmit(e));
        }

        console.log('📝 Event listeners configurati');
    }

    handleIncomeSubmit(e) {
        e.preventDefault();
        console.log('💰 Gestione submit entrata...');
        
        const formData = new FormData(e.target);
        const transaction = {
            id: Date.now(),
            type: 'income',
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            category: formData.get('category'),
            date: new Date().toISOString()
        };

        console.log('Transazione entrata:', transaction);
        this.addTransaction(transaction);
        this.closeModal('incomeModal');
        e.target.reset();
    }

    handleExpenseSubmit(e) {
        e.preventDefault();
        console.log('💸 Gestione submit spesa...');
        
        const formData = new FormData(e.target);
        const transaction = {
            id: Date.now(),
            type: 'expense',
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            category: formData.get('category'),
            date: new Date().toISOString()
        };

        console.log('Transazione spesa:', transaction);
        this.addTransaction(transaction);
        this.closeModal('expenseModal');
        e.target.reset();
    }

    handleQuickExpenseSubmit(e) {
        e.preventDefault();
        console.log('⚡ Gestione submit spesa rapida...');
        
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));
        
        if (amount && amount > 0) {
            const transaction = {
                id: Date.now(),
                type: 'expense',
                amount: amount,
                description: formData.get('description') || 'Spesa rapida',
                category: 'altro',
                date: new Date().toISOString()
            };

            console.log('Transazione spesa rapida:', transaction);
            this.addTransaction(transaction);
        }
        
        this.closeModal('quickExpenseModal');
        e.target.reset();
    }

    handleInvestmentSubmit(e) {
        e.preventDefault();
        console.log('📈 Gestione submit investimento...');
        
        const formData = new FormData(e.target);
        const transaction = {
            id: Date.now(),
            type: 'investment',
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            category: formData.get('category'),
            date: new Date().toISOString()
        };

        console.log('Transazione investimento:', transaction);
        this.addTransaction(transaction);
        this.closeModal('investmentModal');
        e.target.reset();
    }

    addTransaction(transaction) {
        console.log('➕ Aggiunta transazione:', transaction);
        this.transactions.push(transaction);
        this.saveTransactions();
        this.updateDashboard();
        this.updateCharts();
        this.showTransactionSuccess(transaction);
    }

    saveTransactions() {
        localStorage.setItem('sapoTransactions', JSON.stringify(this.transactions));
        console.log('💾 Transazioni salvate:', this.transactions.length);
    }

    updateDashboard() {
        console.log('🔄 Aggiornamento dashboard...');
        
        const totals = this.calculateTotals();
        
        // Update balance cards
        const currentBalance = document.getElementById('currentBalance');
        const totalIncome = document.getElementById('totalIncome');
        const totalExpenses = document.getElementById('totalExpenses');
        const totalInvestments = document.getElementById('totalInvestments');

        if (currentBalance) currentBalance.textContent = this.formatCurrency(totals.balance);
        if (totalIncome) totalIncome.textContent = this.formatCurrency(totals.income);
        if (totalExpenses) totalExpenses.textContent = this.formatCurrency(totals.expenses);
        if (totalInvestments) totalInvestments.textContent = this.formatCurrency(totals.investments);

        this.updateRecentTransactions();
        console.log('✅ Dashboard aggiornato:', totals);
    }

    calculateTotals() {
        const totals = {
            income: 0,
            expenses: 0,
            investments: 0,
            balance: 0
        };

        this.transactions.forEach(transaction => {
            switch (transaction.type) {
                case 'income':
                    totals.income += transaction.amount;
                    break;
                case 'expense':
                    totals.expenses += transaction.amount;
                    break;
                case 'investment':
                    totals.investments += transaction.amount;
                    break;
            }
        });

        totals.balance = totals.income - totals.expenses + totals.investments;
        
        return totals;
    }

    updateRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) return;

        const recentTransactions = this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (recentTransactions.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Nessuna transazione ancora</p>';
            return;
        }

        container.innerHTML = recentTransactions.map(transaction => {
            const icon = this.getTransactionIcon(transaction.type, transaction.category);
            const typeClass = `${transaction.type}-item`;
            const sign = transaction.type === 'expense' ? '-' : '+';
            const amountClass = transaction.type === 'expense' ? 'text-red-600' : 'text-green-600';

            return `
                <div class="transaction-item ${typeClass}">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-3">
                            <span class="text-2xl">${icon}</span>
                            <div>
                                <div class="font-semibold text-gray-800">${transaction.description}</div>
                                <div class="text-sm text-gray-500">${this.formatDate(transaction.date)} • ${transaction.category}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold ${amountClass}">${sign}${this.formatCurrency(Math.abs(transaction.amount))}</div>
                            <div class="text-xs text-gray-400">${this.getTypeLabel(transaction.type)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    initCharts() {
        console.log('📊 Inizializzazione grafici...');
        this.initTrendChart();
        this.initCategoryChart();
    }

    initTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.trendChart) {
            this.trendChart.destroy();
        }

        const monthlyData = this.getMonthlyData();

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Entrate',
                    data: monthlyData.income,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Spese',
                    data: monthlyData.expenses,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '€' + value.toFixed(0);
                            }
                        }
                    }
                }
            }
        });
    }

    initCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        const categoryData = this.getCategoryData();

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: [
                        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
                        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    }

    getMonthlyData() {
        const monthlyStats = {};
        const currentDate = new Date();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            monthlyStats[key] = { income: 0, expenses: 0 };
        }

        this.transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (monthlyStats[key]) {
                if (transaction.type === 'income') {
                    monthlyStats[key].income += transaction.amount;
                } else if (transaction.type === 'expense') {
                    monthlyStats[key].expenses += transaction.amount;
                }
            }
        });

        const labels = Object.keys(monthlyStats).map(key => {
            const [year, month] = key.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
        });

        return {
            labels,
            income: Object.values(monthlyStats).map(stat => stat.income),
            expenses: Object.values(monthlyStats).map(stat => stat.expenses)
        };
    }

    getCategoryData() {
        const categoryStats = {};

        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(transaction => {
                if (!categoryStats[transaction.category]) {
                    categoryStats[transaction.category] = 0;
                }
                categoryStats[transaction.category] += transaction.amount;
            });

        const sortedCategories = Object.entries(categoryStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        return {
            labels: sortedCategories.map(([category]) => this.getCategoryLabel(category)),
            data: sortedCategories.map(([,amount]) => amount)
        };
    }

    updateCharts() {
        console.log('📊 Aggiornamento grafici...');
        this.initTrendChart();
        this.initCategoryChart();
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('it-IT');
    }

    getTransactionIcon(type, category) {
        const icons = {
            income: {
                stipendio: '💼',
                freelance: '🖥️',
                investimenti: '📈',
                regali: '🎁',
                altro: '💰'
            },
            expense: {
                alimentari: '🛒',
                trasporti: '🚗',
                bollette: '⚡',
                svago: '🎉',
                salute: '🏥',
                abbigliamento: '👕',
                altro: '💸'
            },
            investment: {
                elettronica: '📱',
                veicoli: '🚗',
                immobili: '🏠',
                gioielli: '💍',
                arte: '🎨',
                altro: '📈'
            }
        };

        return icons[type]?.[category] || '💰';
    }

    getCategoryLabel(category) {
        const labels = {
            alimentari: '🛒 Alimentari',
            trasporti: '🚗 Trasporti',
            bollette: '⚡ Bollette',
            svago: '🎉 Svago',
            salute: '🏥 Salute',
            abbigliamento: '👕 Abbigliamento',
            altro: '🔄 Altro'
        };
        return labels[category] || category;
    }

    getTypeLabel(type) {
        const labels = {
            income: 'Entrata',
            expense: 'Spesa',
            investment: 'Investimento'
        };
        return labels[type] || type;
    }

    showTransactionSuccess(transaction) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="text-xl">✅</span>
                <div>
                    <div class="font-semibold">Transazione aggiunta!</div>
                    <div class="text-sm opacity-90">${transaction.description}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Modal functions
    openModal(modalId) {
        console.log(`🔓 Apertura modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        console.log(`🔒 Chiusura modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Global functions for HTML onclick handlers
function openModal(modalId) {
    if (window.sapoTracker) {
        window.sapoTracker.openModal(modalId);
    }
}

function closeModal(modalId) {
    if (window.sapoTracker) {
        window.sapoTracker.closeModal(modalId);
    }
}

function addQuickExpense(amount) {
    if (window.sapoTracker) {
        const transaction = {
            id: Date.now(),
            type: 'expense',
            amount: amount,
            description: `Spesa rapida €${amount}`,
            category: 'altro',
            date: new Date().toISOString()
        };
        
        console.log('⚡ Spesa rapida:', transaction);
        window.sapoTracker.addTransaction(transaction);
        window.sapoTracker.closeModal('quickExpenseModal');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM caricato, inizializzazione SapoTracker...');
    window.sapoTracker = new SapoTracker();
});

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        const modalId = event.target.id;
        closeModal(modalId);
    }
});

console.log('📱 SapoTracker script caricato');

// Debug e cache busting
console.log('✅ SapoTracker completamente caricato v2.0');
console.log('📊 Transazioni in memoria:', localStorage.getItem('sapoTransactions'));
