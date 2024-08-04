const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  signDisplay: "always",
});

const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const status = document.getElementById("status");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");

form.addEventListener("submit", addTransaction);

function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  balance.textContent = formatter.format(balanceTotal).substring(1);
  income.textContent = formatter.format(incomeTotal);
  expense.textContent = formatter.format(expenseTotal * -1);
}

function renderList() {
  list.innerHTML = "";

  status.textContent = "";
  if (transactions.length === 0) {
    status.textContent = "No transactions.";
    return;
  }

  transactions.forEach(({ id, name, amount, date, type, category }) => {
    const sign = type === "income" ? 1 : -1;

    const li = document.createElement("li");

    li.innerHTML = `
      <div class="name">
        <h4>${name}</h4>
        <p>${new Date(date).toLocaleDateString()} (${category})</p>
      </div>

      <div class="amount ${type}">
        <span>${formatter.format(amount * sign)}</span>
      </div>
    
      <div class="action">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" onclick="deleteTransaction(${id})">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    `;

    list.appendChild(li);
  });
}


renderList();
updateTotal();

function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);
  transactions.splice(index, 1);

  updateTotal();
  saveTransactions();
  renderList();
}

function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(this);

  const newTransaction = {
    id: transactions.length + 1,
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: new Date(formData.get("date")),
    type: formData.get("type") === "on" ? "income" : "expense",
    category: formData.get("category") 
  };

  transactions.push(newTransaction);

  this.reset();
  updateTotal();
  saveTransactions();
  renderList();
}


function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}
let myChart = null; 
function drawChart() {
  const categories = transactions.reduce((acc, trx) => {
    const amount = trx.type === "income" ? trx.amount : -trx.amount;
    if (acc[trx.category]) {
      acc[trx.category] += amount;
    } else {
      acc[trx.category] = amount;
    }
    return acc;
  }, {});

  const data = {
    labels: Object.keys(categories),
    datasets: [{
      label: 'Transaction Amount by Category',
      data: Object.values(categories),
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  if (myChart) {
    myChart.data = data; 
    myChart.update();
  } else {
    const config = {
      type: 'pie',
      data: data,
    };
    myChart = new Chart(document.getElementById('expenseChart'), config);
  }
}
document.getElementById('viewDataButton').addEventListener('click', drawChart);
