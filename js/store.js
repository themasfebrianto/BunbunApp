// js/store.js
// Mengelola Data dan LocalStorage

const Store = {
    items: [],
    budget: 0,
    history: [],

    save() {
        localStorage.setItem('goshop_items', JSON.stringify(this.items));
        localStorage.setItem('goshop_budget', this.budget.toString());
        localStorage.setItem('goshop_history', JSON.stringify(this.history));
    },

    load() {
        const items = localStorage.getItem('goshop_items');
        const budget = localStorage.getItem('goshop_budget');
        const history = localStorage.getItem('goshop_history');

        if (items) this.items = JSON.parse(items);
        if (budget) this.budget = parseFloat(budget);
        if (history) this.history = JSON.parse(history);
    },

    addItem(item) {
        this.items.push(item);
        this.save();
    },

    deleteItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.save();
    },

    updateItem(itemId, updates) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            Object.assign(item, updates);
            this.save();
        }
    },

    resetItems() {
        this.items.forEach(item => item.isPurchased = false);
        this.save();
    },

    setBudget(amount) {
        this.budget = parseFloat(amount) || 0;
        this.save();
    },

    addHistory(record) {
        this.history.unshift(record);
        if (this.history.length > 10) this.history = this.history.slice(0, 10);
        
        // Clear items and reset budget after shopping is complete
        this.items = this.items.filter(i => !i.isPurchased);
        this.budget = 0;
        this.save();
    }
};
