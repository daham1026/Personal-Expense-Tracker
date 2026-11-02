
const form = document.getElementById("transactionForm");
const typeInput = document.getElementById("type");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const filterType = document.getElementById("filterType");
const searchInput = document.getElementById("search");
const table = document.getElementById("transactionTable");
const emptyMessage = document.getElementById("emptyMessage");

let transactions = JSON.parse(
  localStorage.getItem("transactions") || "[]"
);

dateInput.value = new Date().toLocaleDateString("en-CA");

function formatMoney(amount) {
  return "LKR " + amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateTotals() {
  let income = 0;
  let expenses = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "Income") {
      income += transaction.amount;
    } else {
      expenses += transaction.amount;
    }
  });

  document.getElementById("totalIncome").textContent =
    formatMoney(income);

  document.getElementById("totalExpenses").textContent =
    formatMoney(expenses);

  document.getElementById("balance").textContent =
    formatMoney(income - expenses);
}

function renderTransactions() {
  table.replaceChildren();

  const selectedType = filterType.value;
  const searchText = searchInput.value.toLowerCase().trim();

  const filtered = transactions.filter(function (transaction) {
    const matchesType =
      selectedType === "All" || transaction.type === selectedType;

    const matchesSearch =
      transaction.description.toLowerCase().includes(searchText) ||
      transaction.category.toLowerCase().includes(searchText);

    return matchesType && matchesSearch;
  });

  filtered.forEach(function (transaction) {
    const row = document.createElement("tr");

    const values = [
      transaction.date,
      transaction.description,
      transaction.type,
      transaction.category,
      (transaction.type === "Income" ? "+ " : "- ") +
        formatMoney(transaction.amount)
    ];

    values.forEach(function (value, index) {
      const cell = document.createElement("td");
      cell.textContent = value;

      if (index === 2) {
        cell.className = transaction.type.toLowerCase();
      }

      row.appendChild(cell);
    });

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", function () {
      transactions = transactions.filter(function (item) {
        return item.id !== transaction.id;
      });

      saveTransactions();
      updateTotals();
      renderTransactions();
    });

    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
    table.appendChild(row);
  });

  emptyMessage.style.display = filtered.length === 0 ? "block" : "none";
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!description || !category || !date ||
      !Number.isFinite(amount) || amount <= 0) {
    alert("Please complete all fields and enter an amount greater than zero.");
    return;
  }

  const transaction = {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    type: typeInput.value,
    description: description,
    amount: amount,
    category: category,
    date: date
  };

  transactions.push(transaction);
  saveTransactions();
  updateTotals();
  renderTransactions();

  form.reset();
  dateInput.value = new Date().toLocaleDateString("en-CA");
});

form.addEventListener("reset", function () {
  setTimeout(function () {
    dateInput.value = new Date().toLocaleDateString("en-CA");
  }, 0);
});

filterType.addEventListener("change", renderTransactions);
searchInput.addEventListener("input", renderTransactions);

updateTotals();
renderTransactions();
