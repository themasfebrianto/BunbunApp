// js/app.js
// Main Controller: Menghubungkan Data (Store) dan Tampilan (UI)

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    Store.load();
    UI.renderList(Store.items, Store.budget);
    UI.renderHistory(Store.history);
    setupEventListeners();
});

function setupEventListeners() {
    // FAB & Add Item
    const fabBtn = document.getElementById('fab-add-item');
    const addItemForm = document.getElementById('add-item-form-modal');
    const addModalCancelBtn = document.getElementById('add-modal-cancel-btn');

    fabBtn.addEventListener('click', () => UI.showModal(UI.elements.addItemModal, true));
    addModalCancelBtn.addEventListener('click', () => UI.hideModal(UI.elements.addItemModal, true));

    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('modal-item-name').value;
        const qty = document.getElementById('modal-item-qty').value;
        const price = document.getElementById('modal-item-price').value;

        Store.addItem({
            id: Date.now().toString(),
            name: name.trim(),
            qty: parseInt(qty) || 1,
            price: parseFloat(price) || 0,
            isPurchased: false,
            createdAt: Date.now()
        });

        UI.renderList(Store.items, Store.budget);

        // Reset Form
        document.getElementById('modal-item-name').value = '';
        document.getElementById('modal-item-qty').value = '1';
        document.getElementById('modal-item-price').value = '';
        UI.hideModal(UI.elements.addItemModal, true);
    });

    // Edit Item
    const editForm = document.getElementById('edit-item-form');
    const editModalCancelBtn = document.getElementById('edit-modal-cancel-btn');

    editModalCancelBtn.addEventListener('click', () => UI.hideModal(UI.elements.editModal));

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = UI.elements.editId.value;
        Store.updateItem(id, {
            name: UI.elements.editName.value.trim(),
            qty: parseInt(UI.elements.editQty.value) || 1,
            price: parseFloat(UI.elements.editPrice.value) || 0
        });
        UI.renderList(Store.items, Store.budget);
        UI.hideModal(UI.elements.editModal);
    });

    // Budget
    const budgetBtn = document.getElementById('budget-btn');
    const budgetForm = document.getElementById('budget-form');
    const budgetModalCancelBtn = document.getElementById('budget-modal-cancel-btn');
    const deleteBudgetBtn = document.getElementById('delete-budget-btn');

    budgetBtn.addEventListener('click', () => {
        UI.elements.budgetInput.value = Store.budget || '';
        UI.showModal(UI.elements.budgetModal);
    });

    budgetModalCancelBtn.addEventListener('click', () => UI.hideModal(UI.elements.budgetModal));

    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        Store.setBudget(UI.elements.budgetInput.value);
        UI.renderList(Store.items, Store.budget);
        UI.hideModal(UI.elements.budgetModal);
    });

    deleteBudgetBtn.addEventListener('click', () => {
        UI.showConfirmModal('Hapus Budget', 'Yakin mau hapus budget?', () => {
            Store.setBudget(0);
            UI.renderList(Store.items, Store.budget);
            UI.hideModal(UI.elements.budgetModal);
        });
    });

    // List Actions (Reset & Complete)
    UI.elements.resetBtn.addEventListener('click', () => {
        UI.showConfirmModal('Reset Status', 'Yakin mau reset semua status belanja?', () => {
            Store.resetItems();
            UI.renderList(Store.items, Store.budget);
        });
    });

    UI.elements.completeBtn.addEventListener('click', () => {
        UI.showConfirmModal('Selesai Belanja', 'Simpan belanjaan ini ke riwayat dan hapus dari daftar?', () => {
            const purchasedItems = Store.items.filter(i => i.isPurchased);
            if (purchasedItems.length === 0) {
                alert('Tidak ada item yang dibeli.');
                return;
            }

            let totalSpent = 0;
            purchasedItems.forEach(item => totalSpent += (item.price || 0) * item.qty);

            Store.addHistory({
                id: Date.now().toString(),
                date: new Date().toISOString(),
                items: purchasedItems,
                totalSpent: totalSpent,
                totalBudget: Store.budget // Store budget before reset
            });

            UI.renderList(Store.items, Store.budget); // Store.items is already filtered in addHistory
            UI.renderHistory(Store.history);

            UI.showConfirmModal('Selesai Belanja', `Belanja Selesai! Total: ${UI.formatRupiah(totalSpent)}`, () => { }, false, 'OK');
        });
    });

    // History
    const historyBtn = document.getElementById('history-btn');
    const historyModalCloseBtn = document.getElementById('history-modal-close-btn');

    historyBtn.addEventListener('click', () => UI.showModal(UI.elements.historyModal, true));
    historyModalCloseBtn.addEventListener('click', () => UI.hideModal(UI.elements.historyModal, true));

    // Global Modal Clicks (Close on backdrop click)
    [UI.elements.addItemModal, UI.elements.editModal, UI.elements.budgetModal, UI.elements.confirmModal, UI.elements.historyModal].forEach(modalEl => {
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                const isSheet = modalEl === UI.elements.addItemModal || modalEl === UI.elements.historyModal;
                UI.hideModal(modalEl, isSheet);
            }
        });
    });

    // Dynamic Item Actions (Delegation for performance)
    // We attach this to the list container instead of individual items
    UI.elements.listContainer.addEventListener('click', (e) => {
        // Toggle Checkbox
        if (e.target.type === 'checkbox') {
            const id = e.target.dataset.id;
            const item = Store.items.find(i => i.id === id);
            if (item) {
                item.isPurchased = !item.isPurchased;
                Store.save();
                UI.renderList(Store.items, Store.budget);
            }
        }

        // Edit Button
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const item = Store.items.find(i => i.id === id);
            if (item) {
                UI.populateEditForm(item);
                UI.showModal(UI.elements.editModal);
            }
        }

        // Delete Button
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            UI.showConfirmModal('Hapus Item', 'Yakin mau hapus item ini?', () => {
                Store.deleteItem(id);
                UI.renderList(Store.items, Store.budget);
            });
        }
    });
}
