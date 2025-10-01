// SapoTracker - Gestione Finanze Personali

console.log('🔥 DEBUG: Inizializzazione app...');

// Variabili globali
let transactions = JSON.parse(localStorage.getItem('sapoTransactions')) || [];
let trendChart, categoryChart;

// Inizializzazione quando la pagina è caricata
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM caricato, inizializzazione...');
    setupEventListeners();
    updateDashboard();
    initCharts();
    console.log('✅ App inizializzata correttamente');
});

// Setup degli event listeners
function setupEventListeners() {
    console.log('📝 Configurazione event listeners...');
    
    // Income Form
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', handleIncomeSubmit);
        console.log('✅ Income form listener aggiunto');
    } else {
        console.error('❌ Income form non trovato');
    }

    // Expense Form
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
        console.log('✅ Expense form listener aggiunto');
    } else {
        console.error('❌ Expense form non trovato');
    }

    // Quick Expense Form
    const quickExpenseForm = document.getElementById('quickExpenseForm');
    if (quickExpenseForm) {
        quickExpenseForm.addEventListener('submit', handleQuickExpenseSubmit);
        console.log('✅ Quick expense form listener aggiunto');
    } else {
        console.error('❌ Quick expense form non trovato');
    }

    // Investment Form
    const investmentForm = document.getElementById('investmentForm');
    if (investmentForm) {
        investmentForm.addEventListener('submit', handleInvestmentSubmit);
        console.log('✅ Investment form listener aggiunto');
    } else {
        console.error('❌ Investment form non trovato');
    }

    console.log('📝 Event listeners configurati');
}

// Gestione submit entrate
function handleIncomeSubmit(e) {
    try {
        e.preventDefault();
        console.log('💰 Gestione submit entrata...');
        
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description');
        const category = formData.get('category');
        
        // Validazione
        if (!amount || amount <= 0) {
            alert('Inserisci un importo valido');
            return;
        }
        if (!description || description.trim() === '') {
            alert('Inserisci una descrizione');
            return;
        }
        if (!category || category === '') {
            alert('Seleziona una categoria');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            type: 'income',
            amount: amount,
            description: description.trim(),
            category: category,
            date: new Date().toISOString()
        };

        console.log('💰 Transazione entrata:', transaction);
        addTransaction(transaction);
        closeModal('incomeModal');
        e.target.reset();
        
    } catch (error) {
        console.error('❌ Errore nel salvataggio entrata:', error);
        alert('Errore nel salvataggio: ' + error.message);
    }
}

// Gestione submit spese
function handleExpenseSubmit(e) {
    try {
        e.preventDefault();
        console.log('💸 Gestione submit spesa...');
        
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description');
        const category = formData.get('category');
        
        // Validazione
        if (!amount || amount <= 0) {
            alert('Inserisci un importo valido');
            return;
        }
        if (!description || description.trim() === '') {
            alert('Inserisci una descrizione');
            return;
        }
        if (!category || category === '') {
            alert('Seleziona una categoria');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            type: 'expense',
            amount: amount,
            description: description.trim(),
            category: category,
            date: new Date().toISOString()
        };

        console.log('💸 Transazione spesa:', transaction);
        addTransaction(transaction);
        closeModal('expenseModal');
        e.target.reset();
        
    } catch (error) {
        console.error('❌ Errore nel salvataggio spesa:', error);
        alert('Errore nel salvataggio: ' + error.message);
    }
}

// Gestione submit spese rapide
function handleQuickExpenseSubmit(e) {
    try {
        e.preventDefault();
        console.log('⚡ Gestione submit spesa rapida...');
        
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description') || 'Spesa rapida';
        
        if (amount && amount > 0) {
            const transaction = {
                id: Date.now(),
                type: 'expense',
                amount: amount,
                description: description.trim(),
                category: 'altro',
                date: new Date().toISOString()
            };

            console.log('⚡ Transazione spesa rapida:', transaction);
            addTransaction(transaction);
        } else {
            alert('Inserisci un importo valido');
            return;
        }
        
        closeModal('quickExpenseModal');
        e.target.reset();
        
    } catch (error) {
        console.error('❌ Errore nel salvataggio spesa rapida:', error);
        alert('Errore nel salvataggio: ' + error.message);
    }
}

// Gestione submit investimenti
function handleInvestmentSubmit(e) {
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

    console.log('📈 Transazione investimento:', transaction);
    addTransaction(transaction);
    closeModal('investmentModal');
    e.target.reset();
}

// Aggiunta transazione
function addTransaction(transaction) {
    console.log('➕ Aggiunta transazione:', transaction);
    transactions.push(transaction);
    saveTransactions();
    updateDashboard();
    updateCharts();
    showTransactionSuccess(transaction);
}

// Salvataggio transazioni
function saveTransactions() {
    localStorage.setItem('sapoTransactions', JSON.stringify(transactions));
    console.log('💾 Transazioni salvate:', transactions.length);
}

// Aggiornamento dashboard
function updateDashboard() {
    console.log('🔄 Aggiornamento dashboard...');
    
    const totals = calculateTotals();
    
    // Aggiorna le card del saldo
    const currentBalance = document.getElementById('currentBalance');
    const totalIncome = document.getElementById('totalIncome');
    const totalExpenses = document.getElementById('totalExpenses');
    const totalInvestments = document.getElementById('totalInvestments');

    if (currentBalance) currentBalance.textContent = formatCurrency(totals.balance);
    if (totalIncome) totalIncome.textContent = formatCurrency(totals.income);
    if (totalExpenses) totalExpenses.textContent = formatCurrency(totals.expenses);
    if (totalInvestments) totalInvestments.textContent = formatCurrency(totals.investments);

    updateRecentTransactions();
    console.log('✅ Dashboard aggiornato:', totals);
}

// Calcolo totali
function calculateTotals() {
    const totals = {
        income: 0,
        expenses: 0,
        investments: 0,
        balance: 0
    };

    transactions.forEach(transaction => {
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

// Aggiornamento transazioni recenti
function updateRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    if (!container) return;

    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    if (recentTransactions.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Nessuna transazione ancora</p>';
        return;
    }

    container.innerHTML = recentTransactions.map(transaction => {
        const icon = getTransactionIcon(transaction.type, transaction.category);
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
                            <div class="text-sm text-gray-500">${formatDate(transaction.date)} • ${transaction.category}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold ${amountClass}">${sign}${formatCurrency(Math.abs(transaction.amount))}</div>
                        <div class="text-xs text-gray-400">${getTypeLabel(transaction.type)}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Inizializzazione grafici
function initCharts() {
    console.log('📊 Inizializzazione grafici...');
    initTrendChart();
    initCategoryChart();
}

// Grafico andamento
function initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    // Distruggi grafico esistente
    if (trendChart) {
        trendChart.destroy();
    }

    const monthlyData = getMonthlyData();

    trendChart = new Chart(ctx, {
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

// Grafico categorie
function initCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Distruggi grafico esistente
    if (categoryChart) {
        categoryChart.destroy();
    }

    const categoryData = getCategoryData();

    categoryChart = new Chart(ctx, {
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

// Dati mensili per grafico
function getMonthlyData() {
    const monthlyStats = {};
    const currentDate = new Date();
    
    // Inizializza ultimi 6 mesi
    for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyStats[key] = { income: 0, expenses: 0 };
    }

    transactions.forEach(transaction => {
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

// Dati categorie per grafico
function getCategoryData() {
    const categoryStats = {};

    transactions
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
        labels: sortedCategories.map(([category]) => getCategoryLabel(category)),
        data: sortedCategories.map(([,amount]) => amount)
    };
}

// Aggiornamento grafici
function updateCharts() {
    console.log('📊 Aggiornamento grafici...');
    initTrendChart();
    initCategoryChart();
}

// Funzioni utilità
function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('it-IT');
}

function getTransactionIcon(type, category) {
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

function getCategoryLabel(category) {
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

function getTypeLabel(type) {
    const labels = {
        income: 'Entrata',
        expense: 'Spesa',
        investment: 'Investimento'
    };
    return labels[type] || type;
}

function showTransactionSuccess(transaction) {
    // Crea notifica di successo
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

    // Animazione entrata
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Animazione uscita e rimozione
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Funzioni modali (globali per HTML)
function openModal(modalId) {
    console.log(`🔓 Apertura modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        console.error(`❌ Modal ${modalId} non trovato`);
    }
}

function closeModal(modalId) {
    console.log(`🔒 Chiusura modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function addQuickExpense(amount) {
    try {
        console.log(`⚡ Spesa rapida: €${amount}`);
        
        if (!amount || amount <= 0) {
            alert('Importo non valido');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            type: 'expense',
            amount: parseFloat(amount),
            description: `Spesa rapida €${amount}`,
            category: 'altro',
            date: new Date().toISOString()
        };
        
        console.log('⚡ Transazione creata:', transaction);
        addTransaction(transaction);
        closeModal('quickExpenseModal');
        
    } catch (error) {
        console.error('❌ Errore spesa rapida:', error);
        alert('Errore nella spesa rapida: ' + error.message);
    }
}

// Chiusura modali cliccando fuori
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        const modalId = event.target.id;
        closeModal(modalId);
    }
});

console.log('📱 SapoTracker script caricato - versione debug');
