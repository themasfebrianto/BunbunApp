// js/ui.js
// Mengelola Tampilan (DOM)

const UI = {
    elements: {
        listContainer: document.getElementById('grocery-list'),
        emptyState: document.getElementById('empty-state'),
        resetBtn: document.getElementById('reset-list-btn'),
        completeBtn: document.getElementById('complete-shopping-btn'),
        budgetProgressBar: document.getElementById('budget-progress-bar'),
        budgetRemainingText: document.getElementById('budget-remaining-text'),
        listCostText: document.getElementById('list-cost-text'),
        historyListContainer: document.getElementById('history-list'),
        historyEmptyState: document.getElementById('history-empty-state'),
        budgetInput: document.getElementById('budget-amount'),

        // Modals
        addItemModal: document.getElementById('add-item-modal'),
        editModal: document.getElementById('edit-item-modal'),
        budgetModal: document.getElementById('budget-modal'),
        historyModal: document.getElementById('history-modal'),
        confirmModal: document.getElementById('confirmation-modal'),

        // Modal Inputs
        modalTitle: document.getElementById('modal-title'),
        modalMessage: document.getElementById('modal-message'),
        modalConfirmBtn: document.getElementById('modal-confirm-btn'),
        modalCancelBtn: document.getElementById('modal-cancel-btn'),

        editId: document.getElementById('edit-item-id'),
        editName: document.getElementById('edit-item-name'),
        editQty: document.getElementById('edit-item-qty'),
        editPrice: document.getElementById('edit-item-price'),
    },

    formatRupiah(number, includeCurrency = true) {
        if (!isFinite(number)) number = 0;
        const formatter = new Intl.NumberFormat('id-ID', {
            style: includeCurrency ? 'currency' : 'decimal',
            currency: 'IDR',
            minimumFractionDigits: 0
        });
        return formatter.format(number).replace(includeCurrency ? 'IDR' : '', includeCurrency ? 'Rp' : '').trim();
    },

    showModal(modalEl, isBottomSheet = false) {
        modalEl.classList.remove('invisible', 'opacity-0');
        modalEl.classList.add('opacity-100');
        if (isBottomSheet) {
            const sheet = modalEl.querySelector('.modal-bottom-sheet');
            if (sheet) setTimeout(() => sheet.classList.add('show'), 10);
        }
    },

    hideModal(modalEl, isBottomSheet = false) {
        if (isBottomSheet) {
            const sheet = modalEl.querySelector('.modal-bottom-sheet');
            if (sheet) sheet.classList.remove('show');
        }
        modalEl.classList.remove('opacity-100');
        modalEl.classList.add('opacity-0');
        setTimeout(() => modalEl.classList.add('invisible'), 300);
    },

    showConfirmModal(title, message, onConfirm, showCancel = true, confirmText = 'Ya, Lakukan') {
        this.elements.modalTitle.textContent = title;
        this.elements.modalMessage.textContent = message;
        this.elements.modalConfirmBtn.textContent = confirmText;
        this.elements.modalCancelBtn.style.display = showCancel ? 'inline-block' : 'none';

        // Set global action handler (defined in app.js or handled via custom event)
        // For simplicity, we'll assign it to a property on the button element itself
        this.elements.modalConfirmBtn.onclick = () => {
            onConfirm();
            this.hideModal(this.elements.confirmModal);
        };

        this.showModal(this.elements.confirmModal);
    },

    renderList(items, budget) {
        // 1. Calculate Totals
        let totalCost = 0;
        let hasPurchased = false;

        items.forEach(item => {
            totalCost += (item.price || 0) * item.qty;
            if (item.isPurchased) hasPurchased = true;
        });

        // 2. Update Budget UI
        const remaining = budget - totalCost;
        const progressPercent = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;

        this.elements.budgetProgressBar.style.width = `${progressPercent}%`;

        const remainingTextEl = this.elements.budgetRemainingText.querySelector('.text-2xl');
        remainingTextEl.textContent = this.formatRupiah(remaining);
        this.elements.listCostText.textContent = this.formatRupiah(totalCost);

        remainingTextEl.classList.remove('text-red-600', 'text-gray-900');
        if (remaining < 0) {
            remainingTextEl.classList.add('text-red-600');
        } else {
            remainingTextEl.classList.add('text-gray-900');
        }

        // 3. Render Items
        this.elements.listContainer.innerHTML = '';

        if (items.length === 0) {
            this.elements.emptyState.classList.remove('hidden');
            this.elements.resetBtn.disabled = true;
            this.elements.completeBtn.disabled = true;
            return;
        }

        this.elements.emptyState.classList.add('hidden');
        this.elements.resetBtn.disabled = !hasPurchased;
        this.elements.completeBtn.disabled = !hasPurchased;

        items.forEach(item => {
            const itemCost = (item.price || 0) * item.qty;
            const itemRow = document.createElement('div');
            itemRow.className = `item-row p-4 flex items-center justify-between ${item.isPurchased ? 'purchased' : ''}`;
            itemRow.innerHTML = `
                <div class="flex items-center flex-1">
                    <input type="checkbox" ${item.isPurchased ? 'checked' : ''} 
                        class="w-5 h-5 text-green-600 rounded focus:ring-green-500 mr-3 cursor-pointer"
                        data-id="${item.id}">
                    <div class="flex-1">
                        <p class="item-name font-semibold text-gray-900">${item.name}</p>
                        <p class="text-xs text-gray-500">
                            <span class="item-qty">${item.qty}x</span>
                            ${item.price > 0 ? `<span class="item-unit-price">@ ${this.formatRupiah(item.price, false)}</span>` : ''}
                        </p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="item-price font-bold text-gray-900">${item.price > 0 ? this.formatRupiah(itemCost) : '-'}</span>
                    <button class="edit-btn p-2 text-gray-400 hover:text-green-600 transition" data-id="${item.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="delete-btn p-2 text-gray-400 hover:text-red-600 transition" data-id="${item.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
            this.elements.listContainer.appendChild(itemRow);
        });
    },

    renderHistory(historyItems) {
        this.elements.historyListContainer.innerHTML = '';
        if (historyItems.length === 0) {
            this.elements.historyEmptyState.classList.remove('hidden');
            return;
        }
        this.elements.historyEmptyState.classList.add('hidden');

        historyItems.forEach(record => {
            const date = new Date(record.date);
            const formattedDate = date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            const historyCard = document.createElement('div');
            historyCard.className = 'bg-white p-4 rounded-xl border border-gray-100';

            let itemsHTML = '';
            record.items.forEach(item => {
                itemsHTML += `
                    <div class="flex justify-between text-sm py-1">
                        <span class="text-gray-700">${item.name} (${item.qty}x)</span>
                        <span class="text-gray-900 font-medium">${this.formatRupiah((item.price || 0) * item.qty)}</span>
                    </div>`;
            });

            historyCard.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="font-bold text-gray-900">${formattedDate}</p>
                        <p class="text-xs text-gray-500">${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500">Total Belanja</p>
                        <p class="text-lg font-bold text-green-600">${this.formatRupiah(record.totalSpent)}</p>
                    </div>
                </div>
                <div class="border-t border-gray-100 pt-2">${itemsHTML}</div>
                ${record.totalBudget > 0 ? `
                    <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
                        <span class="text-gray-500">Budget: ${this.formatRupiah(record.totalBudget)}</span>
                        <span class="${record.totalSpent <= record.totalBudget ? 'text-green-600' : 'text-red-600'} font-semibold">
                            ${record.totalSpent <= record.totalBudget ? 'Hemat!' : 'Over Budget'}
                        </span>
                    </div>
                ` : ''}
            `;
            this.elements.historyListContainer.appendChild(historyCard);
        });
    },

    populateEditForm(item) {
        this.elements.editId.value = item.id;
        this.elements.editName.value = item.name;
        this.elements.editQty.value = item.qty;
        this.elements.editPrice.value = item.price || '';
    }
};
