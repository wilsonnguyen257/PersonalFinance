class PersonalFinanceApp {
    constructor() {
        this.accounts = [];
        this.transactions = [];
        this.budgets = [];
        this.filteredTransactions = [];
        this.userId = null;
        this.sessionToken = null;
        this.isLoading = false;
        this.checkSession();
    }

    // Authentication
    async checkSession() {
        const token = localStorage.getItem('sessionToken');
        if (token) {
            try {
                const res = await fetch(`/api/auth?action=verify&token=${token}`);
                if (res.ok) {
                    const data = await res.json();
                    this.sessionToken = token;
                    this.userId = data.username;
                    this.showMainApp();
                    await this.init();
                    return;
                }
            } catch (error) {
                console.warn('Session verification failed:', error);
            }
            localStorage.removeItem('sessionToken');
        }
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('currentUser').textContent = this.userId;
    }

    showLoginTab(tab) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const tabs = document.querySelectorAll('.tab-btn');
        
        tabs.forEach(t => t.classList.remove('active'));
        
        if (tab === 'login') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            tabs[0].classList.add('active');
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            tabs[1].classList.add('active');
        }
        
        // Clear errors
        document.getElementById('loginError').textContent = '';
        document.getElementById('registerError').textContent = '';
    }

    async login(event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const pin = document.getElementById('loginPin').value;
        const errorEl = document.getElementById('loginError');
        const btn = document.getElementById('loginBtn');
        
        btn.disabled = true;
        btn.textContent = 'Logging in...';
        errorEl.textContent = '';
        
        try {
            const res = await fetch('/api/auth?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, pin })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('sessionToken', data.sessionToken);
                this.sessionToken = data.sessionToken;
                this.userId = data.username;
                this.showMainApp();
                await this.init();
            } else {
                errorEl.textContent = data.error || 'Login failed';
            }
        } catch (error) {
            errorEl.textContent = 'Connection error. Please try again.';
        }
        
        btn.disabled = false;
        btn.textContent = 'Login';
    }

    async register(event) {
        event.preventDefault();
        const username = document.getElementById('registerUsername').value.trim();
        const pin = document.getElementById('registerPin').value;
        const pinConfirm = document.getElementById('registerPinConfirm').value;
        const errorEl = document.getElementById('registerError');
        const btn = document.getElementById('registerBtn');
        
        if (pin !== pinConfirm) {
            errorEl.textContent = 'PINs do not match';
            return;
        }
        
        if (!/^\d{4,}$/.test(pin)) {
            errorEl.textContent = 'PIN must be at least 4 digits';
            return;
        }
        
        btn.disabled = true;
        btn.textContent = 'Creating account...';
        errorEl.textContent = '';
        
        try {
            const res = await fetch('/api/auth?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, pin })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('sessionToken', data.sessionToken);
                this.sessionToken = data.sessionToken;
                this.userId = data.username;
                this.showMainApp();
                await this.init();
            } else {
                errorEl.textContent = data.error || 'Registration failed';
            }
        } catch (error) {
            errorEl.textContent = 'Connection error. Please try again.';
        }
        
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }

    async logout() {
        try {
            await fetch('/api/auth?action=logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.sessionToken })
            });
        } catch (error) {
            console.warn('Logout error:', error);
        }
        
        localStorage.removeItem('sessionToken');
        this.sessionToken = null;
        this.userId = null;
        this.accounts = [];
        this.transactions = [];
        this.budgets = [];
        this.showLoginScreen();
    }

    async init() {
        // Set today's date as default for transaction form
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
        
        // Load data from API or localStorage
        await this.loadData();
        this.render();
    }

    // Local Storage Management (fallback)
    saveDataLocally() {
        localStorage.setItem('accounts', JSON.stringify(this.accounts));
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
        localStorage.setItem('budgets', JSON.stringify(this.budgets));
    }

    loadDataLocally() {
        const accounts = localStorage.getItem('accounts');
        const transactions = localStorage.getItem('transactions');
        const budgets = localStorage.getItem('budgets');

        if (accounts) this.accounts = JSON.parse(accounts);
        if (transactions) this.transactions = JSON.parse(transactions);
        if (budgets) this.budgets = JSON.parse(budgets);
    }

    // API Data Management
    async saveData() {
        this.saveDataLocally(); // Always save to localStorage as backup
        
        try {
            await Promise.all([
                fetch(`/api/accounts?userId=${this.userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.accounts)
                }),
                fetch(`/api/transactions?userId=${this.userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.transactions)
                }),
                fetch(`/api/budgets?userId=${this.userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.budgets)
                })
            ]);
        } catch (error) {
            console.warn('Failed to save to cloud, using local storage:', error);
        }
    }

    async loadData() {
        try {
            const [accountsRes, transactionsRes, budgetsRes] = await Promise.all([
                fetch(`/api/accounts?userId=${this.userId}`),
                fetch(`/api/transactions?userId=${this.userId}`),
                fetch(`/api/budgets?userId=${this.userId}`)
            ]);

            if (accountsRes.ok) this.accounts = await accountsRes.json();
            if (transactionsRes.ok) this.transactions = await transactionsRes.json();
            if (budgetsRes.ok) this.budgets = await budgetsRes.json();
        } catch (error) {
            console.warn('Failed to load from cloud, using local storage:', error);
            this.loadDataLocally();
        }
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key.toLowerCase()) {
                case 'a':
                    this.showAddAccountModal();
                    break;
                case 't':
                    this.showAddTransactionModal();
                    break;
                case 'b':
                    this.showAddBudgetModal();
                    break;
                case '?':
                    this.showShortcuts();
                    break;
            }
        });
    }

    showShortcuts() {
        const toast = document.getElementById('shortcutsToast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 5000);
    }

    hideToast() {
        document.getElementById('shortcutsToast').classList.remove('show');
    }

    // Data Export/Import
    exportData() {
        const data = {
            accounts: this.accounts,
            transactions: this.transactions,
            budgets: this.budgets,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully!', 'success');
    }

    importData() {
        document.getElementById('fileInput').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (confirm('This will replace your current data. Continue?')) {
                    this.accounts = data.accounts || [];
                    this.transactions = data.transactions || [];
                    this.budgets = data.budgets || [];
                    await this.saveData();
                    this.render();
                    this.showNotification('Data imported successfully!', 'success');
                }
            } catch (error) {
                alert('Invalid file format. Please select a valid JSON export file.');
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    showNotification(message, type = 'info') {
        // Simple notification - could be enhanced
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    // Account Management
    async addAccount(event) {
        event.preventDefault();
        
        const account = {
            id: Date.now(),
            name: document.getElementById('accountName').value,
            type: document.getElementById('accountType').value,
            balance: parseFloat(document.getElementById('accountBalance').value)
        };

        this.accounts.push(account);
        await this.saveData();
        this.render();
        this.closeModal('accountModal');
        document.getElementById('accountForm').reset();
    }

    async deleteAccount(id) {
        if (confirm('Are you sure you want to delete this account?')) {
            this.accounts = this.accounts.filter(acc => acc.id !== id);
            await this.saveData();
            this.render();
        }
    }

    // Transaction Management
    async addTransaction(event) {
        event.preventDefault();

        const transaction = {
            id: Date.now(),
            type: document.getElementById('transactionType').value,
            description: document.getElementById('transactionDescription').value,
            amount: parseFloat(document.getElementById('transactionAmount').value),
            category: document.getElementById('transactionCategory').value,
            date: document.getElementById('transactionDate').value
        };

        this.transactions.push(transaction);
        await this.saveData();
        this.render();
        this.closeModal('transactionModal');
        document.getElementById('transactionForm').reset();
        
        // Reset date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
    }

    async deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            this.transactions = this.transactions.filter(txn => txn.id !== id);
            await this.saveData();
            this.render();
        }
    }

    // Budget Management
    async addBudget(event) {
        event.preventDefault();

        const budget = {
            id: Date.now(),
            category: document.getElementById('budgetCategory').value,
            limit: parseFloat(document.getElementById('budgetLimit').value)
        };

        this.budgets.push(budget);
        await this.saveData();
        this.render();
        this.closeModal('budgetModal');
        document.getElementById('budgetForm').reset();
    }

    async deleteBudget(id) {
        if (confirm('Are you sure you want to delete this budget category?')) {
            this.budgets = this.budgets.filter(budget => budget.id !== id);
            await this.saveData();
            this.render();
        }
    }

    // Transaction Filtering
    filterTransactions() {
        const searchTerm = document.getElementById('transactionSearch').value.toLowerCase();
        const filterType = document.getElementById('transactionFilter').value;

        this.filteredTransactions = this.transactions.filter(txn => {
            const matchesSearch = txn.description.toLowerCase().includes(searchTerm) ||
                                 txn.category.toLowerCase().includes(searchTerm);
            const matchesType = filterType === 'all' || txn.type === filterType;
            return matchesSearch && matchesType;
        });

        this.renderTransactions();
    }

    // Calculations
    calculateNetWorth() {
        const assetTypes = ['checking', 'savings', 'investment'];
        const liabilityTypes = ['credit', 'loan'];

        const assets = this.accounts
            .filter(acc => assetTypes.includes(acc.type))
            .reduce((sum, acc) => sum + acc.balance, 0);

        const liabilities = this.accounts
            .filter(acc => liabilityTypes.includes(acc.type))
            .reduce((sum, acc) => sum + Math.abs(acc.balance), 0);

        return {
            netWorth: assets - liabilities,
            assets,
            liabilities
        };
    }

    calculateMonthlyStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = this.transactions.filter(txn => {
            const txnDate = new Date(txn.date);
            return txnDate.getMonth() === currentMonth && txnDate.getFullYear() === currentYear;
        });

        const income = monthlyTransactions
            .filter(txn => txn.type === 'income')
            .reduce((sum, txn) => sum + txn.amount, 0);

        const expenses = monthlyTransactions
            .filter(txn => txn.type === 'expense')
            .reduce((sum, txn) => sum + txn.amount, 0);

        const totalBudget = this.budgets.reduce((sum, budget) => sum + budget.limit, 0);
        const remaining = totalBudget - expenses;

        return { income, expenses, remaining };
    }

    getBudgetSpending(category) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return this.transactions
            .filter(txn => {
                const txnDate = new Date(txn.date);
                return txn.type === 'expense' && 
                       txn.category.toLowerCase() === category.toLowerCase() &&
                       txnDate.getMonth() === currentMonth && 
                       txnDate.getFullYear() === currentYear;
            })
            .reduce((sum, txn) => sum + txn.amount, 0);
    }

    // Modal Management
    showAddAccountModal() {
        document.getElementById('accountModal').classList.add('active');
    }

    showAddTransactionModal() {
        document.getElementById('transactionModal').classList.add('active');
    }

    showAddBudgetModal() {
        document.getElementById('budgetModal').classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // Rendering
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    renderDashboard() {
        const { netWorth, assets, liabilities } = this.calculateNetWorth();
        const { income, expenses, remaining } = this.calculateMonthlyStats();

        document.getElementById('netWorth').textContent = this.formatCurrency(netWorth);
        document.getElementById('totalAssets').textContent = this.formatCurrency(assets);
        document.getElementById('totalLiabilities').textContent = this.formatCurrency(liabilities);
        document.getElementById('monthlyIncome').textContent = this.formatCurrency(income);
        document.getElementById('monthlyExpenses').textContent = this.formatCurrency(expenses);
        document.getElementById('budgetRemaining').textContent = this.formatCurrency(remaining);
    }

    renderAccounts() {
        const grid = document.getElementById('accountsGrid');
        
        if (this.accounts.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-text">No accounts yet. Add your first account to get started.</div>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.accounts.map(account => `
            <div class="account-card">
                <div class="account-header">
                    <div class="account-name">${account.name}</div>
                    <div class="account-type">${account.type}</div>
                </div>
                <div class="account-balance ${account.balance >= 0 ? 'positive' : 'negative'}">
                    ${this.formatCurrency(account.balance)}
                </div>
                <button class="btn btn-primary" style="margin-top: 0.75rem; font-size: 0.75rem; padding: 0.5rem;" 
                        onclick="app.deleteAccount(${account.id})">Delete</button>
            </div>
        `).join('');
    }

    renderTransactions() {
        const list = document.getElementById('transactionsList');
        
        // Use filtered transactions if filter is active
        const searchInput = document.getElementById('transactionSearch');
        const filterSelect = document.getElementById('transactionFilter');
        const displayTransactions = (searchInput && searchInput.value) || 
                                   (filterSelect && filterSelect.value !== 'all')
                                   ? this.filteredTransactions 
                                   : this.transactions;
        
        if (displayTransactions.length === 0 && this.transactions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">No transactions yet. Start tracking your income and expenses.</div>
                </div>
            `;
            return;
        }
        
        if (displayTransactions.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">No transactions match your search.</div>
                </div>
            `;
            return;
        }

        // Sort by date (most recent first)
        const sorted = [...displayTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        list.innerHTML = sorted.slice(0, 20).map(txn => `
            <div class="transaction-item ${txn.type}">
                <div class="transaction-info">
                    <div class="transaction-description">${txn.description}</div>
                    <div class="transaction-meta">
                        <span>${txn.category}</span>
                        <span>${this.formatDate(txn.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount ${txn.type === 'income' ? 'positive' : 'negative'}">
                    ${txn.type === 'income' ? '+' : '-'}${this.formatCurrency(txn.amount)}
                </div>
                <button class="btn" style="font-size: 0.75rem; padding: 0.5rem; margin-left: 1rem;" 
                        onclick="app.deleteTransaction(${txn.id})">×</button>
            </div>
        `).join('');
    }

    renderBudgets() {
        const list = document.getElementById('budgetList');
        
        if (this.budgets.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-text">No budgets set. Create budget categories to track your spending.</div>
                </div>
            `;
            return;
        }

        list.innerHTML = this.budgets.map(budget => {
            const spent = this.getBudgetSpending(budget.category);
            const percentage = (spent / budget.limit) * 100;
            const remaining = budget.limit - spent;
            
            let progressClass = '';
            if (percentage >= 90) progressClass = 'danger';
            else if (percentage >= 75) progressClass = 'warning';

            return `
                <div class="budget-item">
                    <div class="budget-header">
                        <div class="budget-category">${budget.category}</div>
                        <button class="btn" style="font-size: 0.75rem; padding: 0.5rem;" 
                                onclick="app.deleteBudget(${budget.id})">Delete</button>
                    </div>
                    <div class="budget-amounts">
                        <span>${this.formatCurrency(spent)} spent</span>
                        <span>•</span>
                        <span>${this.formatCurrency(remaining)} remaining</span>
                        <span>•</span>
                        <span>${this.formatCurrency(budget.limit)} limit</span>
                    </div>
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill ${progressClass}" 
                             style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    render() {
        this.renderDashboard();
        this.renderAccounts();
        this.filterTransactions();
        this.renderBudgets();
    }
}

// Initialize app
const app = new PersonalFinanceApp();

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
