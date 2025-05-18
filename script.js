// Toggle the sidebar menu (burger icon)
function toggleMenu() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.left = (sidebar.style.left === "0px") ? "-250px" : "0px";
}

function showSection(sectionName) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => section.classList.remove('active'));
  document.getElementById(sectionName).classList.add('active');
  document.getElementById("sidebar").style.left = "-250px";

  if (sectionName === 'analytics') {
    updateAnalytics(); // Ensure charts are updated when analytics is viewed
  }
}


// Declare global variables
let categoryBudgets = {
  Groceries: 0,
  Bills: 0,
  Entertainment: 0,
  Transport: 0
};

let categoryExpenses = {
  Groceries: 0,
  Bills: 0,
  Entertainment: 0,
  Transport: 0
};


let totalExpenses = 0;
const expenseList = [];
const expenseTrends = {
  Groceries: [],
  Bills: [],
  Entertainment: [],
  Transport: []
};

let pieChart = null; // Store reference to the pie chart
let lineChart = null; // Store reference to the line chart

const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const categorySelect = document.getElementById('categorySelect');
const expenseListElement = document.getElementById('expenseList');
const analyticsSection = document.getElementById('analyticsSection');

function setBudget() {
  categoryBudgets.Groceries = parseFloat(document.getElementById('groceriesBudget').value) || 0;
  categoryBudgets.Bills = parseFloat(document.getElementById('billsBudget').value) || 0;
  categoryBudgets.Entertainment = parseFloat(document.getElementById('entertainmentBudget').value) || 0;
  categoryBudgets.Transport = parseFloat(document.getElementById('transportBudget').value) || 0;

  updateSummary();

  // Clear input fields after setting the budget
  document.getElementById('groceriesBudget').value = '';
  document.getElementById('billsBudget').value = '';
  document.getElementById('entertainmentBudget').value = '';
  document.getElementById('transportBudget').value = '';
}







// Global Variables
const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'INR': '₹',
  'GBP': '£',
  'JPY': '¥'
};

let selectedCurrency = 'USD';

// Function to update displayed currency symbol
function updateCurrencySymbol() {
  document.querySelectorAll('.currency-symbol').forEach(el => {
      el.textContent = currencySymbols[selectedCurrency];
  });
  updateDisplayedValues();
}

// Function to update all displayed values with currency
function updateDisplayedValues() {
  document.querySelectorAll('.amount').forEach(el => {
      let amount = parseFloat(el.dataset.value) || 0;
      el.textContent = currencySymbols[selectedCurrency] + amount.toFixed(2);
  });
}

// Function to handle currency change
function changeCurrency(event) {
  selectedCurrency = event.target.value;
  updateCurrencySymbol();
}

// Attach event listener after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('currency-selector').addEventListener('change', changeCurrency);
});

// Function to add an expense
function addExpense() {
  const expenseAmount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('categorySelect').value;

  if (!expenseAmount || expenseAmount <= 0) {
    alert("Please enter a valid expense amount.");
    return;
  }

  categoryExpenses[category] += expenseAmount;
  updateSummary();

  // Clear input fields
  document.getElementById('expenseAmount').value = '';
}

function updateSummary() {
  let summaryContent = document.getElementById("summaryContent");
  summaryContent.innerHTML = '';

  for (let category in categoryBudgets) {
    let remaining = categoryBudgets[category] - categoryExpenses[category];
    let percentage = categoryBudgets[category] ? (categoryExpenses[category] / categoryBudgets[category]) * 100 : 0;
    let progressBarColor = remaining < 0 ? "red" : "#28a745";

    summaryContent.innerHTML += `
      <div class="summary-card">
        <p class="summary-category">${category}</p>
        <p class="summary-budget"><strong>Budget:</strong> ${currencySymbols[selectedCurrency]}${categoryBudgets[category].toFixed(2)}</p>
        <p class="summary-expense"><strong>Expenses:</strong> ${currencySymbols[selectedCurrency]}${categoryExpenses[category].toFixed(2)}</p>
        <p class="summary-remaining">
          <strong>Remaining:</strong> 
          <span class="${remaining < 0 ? 'remaining-negative' : 'remaining-positive'}">
            ${currencySymbols[selectedCurrency]}${remaining.toFixed(2)}
          </span>
        </p>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${Math.min(percentage, 100)}%; background: ${progressBarColor};"></div>
        </div>
      </div>
    `;
  }
}




function deleteExpense(index) {
  categoryExpenses[expenseList[index].category] -= expenseList[index].amount;
  totalExpenses -= expenseList[index].amount;
  expenseList.splice(index, 1); // Remove from array
  updateUI();
  renderExpenseList();
}


// Function to edit an expense
function editExpense(index) {
  const expense = expenseList[index];
  document.getElementById('expenseName').value = expense.name;
  document.getElementById('expenseAmount').value = expense.amount;
  document.getElementById('categorySelect').value = expense.category;
  
  deleteExpense(index); // Remove old entry before editing
}

// Function to update the UI
function updateUI() {
  // Loop through each category and update the UI elements
  for (let category in categoryBudgets) {
    const categoryBudgetElement = document.getElementById(`${category.toLowerCase()}Budget`);
    const categoryExpenseElement = document.getElementById(`${category.toLowerCase()}Expense`);
    const categoryRemainingElement = document.getElementById(`${category.toLowerCase()}Remaining`);
    const progressBar = document.getElementById(`${category.toLowerCase()}ProgressBar`);
    const statusMessage = document.getElementById(`${category.toLowerCase()}StatusMessage`);

    const remaining = categoryBudgets[category] - categoryExpenses[category];
    const progress = (categoryExpenses[category] / categoryBudgets[category]) * 100;

    categoryBudgetElement.innerText = `$${categoryBudgets[category].toFixed(2)}`;
    categoryExpenseElement.innerText = `$${categoryExpenses[category].toFixed(2)}`;
    categoryRemainingElement.innerText = `$${remaining.toFixed(2)}`;

    // Update the progress bar
    progressBar.style.width = progress + '%';

    // Set status message based on spending
    if (categoryExpenses[category] > categoryBudgets[category]) {
      statusMessage.innerText = "You are over budget!";
    } else if (categoryExpenses[category] === categoryBudgets[category]) {
      statusMessage.innerText = "You've hit your budget limit.";
    } else {
      statusMessage.innerText = "You're within budget.";
    }
  }

  // Update total spend per category in analytics
  updateAnalytics();
}

function updateAnalytics() {
  let totalSpend = {
    Groceries: categoryExpenses.Groceries,
    Bills: categoryExpenses.Bills,
    Entertainment: categoryExpenses.Entertainment,
    Transport: categoryExpenses.Transport
  };

  renderCategorySpendChart(totalSpend);
}

function renderCategorySpendChart(totalSpend) {
  const ctx = document.getElementById('categorySpendChart').getContext('2d');

  if (window.pieChart) {
    window.pieChart.destroy();
  }

  window.pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(totalSpend),
      datasets: [{
        data: Object.values(totalSpend),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow manual control
    }
  });
}

// Function to render expense trend line chart
function renderExpenseTrends() {
  const trendCanvas = document.getElementById('expenseTrendChart');

  // Destroy previous chart if exists
  if (lineChart) {
    lineChart.destroy();
  }

  // Collecting expense trends for each category
  const trendData = {
    labels: expenseTrends.Groceries.map(expense => expense.date.toLocaleDateString()), // Using dates as labels
    datasets: [
      {
        label: 'Groceries Spend',
        data: expenseTrends.Groceries.map(expense => expense.amount),
        borderColor: '#28a745',
        fill: false
      },
      {
        label: 'Bills Spend',
        data: expenseTrends.Bills.map(expense => expense.amount),
        borderColor: '#007bff',
        fill: false
      },
      {
        label: 'Entertainment Spend',
        data: expenseTrends.Entertainment.map(expense => expense.amount),
        borderColor: '#ffc107',
        fill: false
      },
      {
        label: 'Transport Spend',
        data: expenseTrends.Transport.map(expense => expense.amount),
        borderColor: '#dc3545',
        fill: false
      }
    ]
  };

  // Creating the line chart
  lineChart = new Chart(trendCanvas, {
    type: 'line',
    data: trendData,
    options: {
      responsive: true,
      scales: {
        x: {
          beginAtZero: true
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
}

// Function to render the expense list
function renderExpenseList() {
  expenseListElement.innerHTML = ''; // Clear the previous list

  expenseList.forEach((expense, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${expense.name} - $${expense.amount} (${expense.category})
      <button onclick="editExpense(${index})">Edit</button>
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    expenseListElement.appendChild(li);
  });
}


// Function to open the relevant tab
function openTab(evt, tabName) {
  // Hide all tab content
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].classList.remove("active");
  }

  // Remove "active" class from all buttons
  let tablinks = document.getElementsByClassName("tablink");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  // Show the current tab
  document.getElementById(tabName).classList.add("active");

  // Add "active" class to the clicked button
  evt.currentTarget.classList.add("active");
}

// Open the default tab (Category Spend)
document.getElementsByClassName("tablink")[0].click();



function exploreMore() {
  alert("Explore More: Navigate to additional features or resources!");
  // You can redirect to another section/page like:
  // showSection('analytics'); // Example
}

function haveFun() {
  alert("Have Fun: Maybe a fun finance tip, joke, or interactive content!");
  // You can add more fun interactions or open a new feature
}



function openFinancialLinks() {
  const confirmation = confirm("This link will take you to an external website about financial awareness. Do you want to continue?");
  
  if (confirmation) {
      const links = [
          "https://www.nerdwallet.com/article/finance/how-to-budget", // Budgeting guide
          "https://www.ramseysolutions.com/budgeting/how-to-budget", // Step-by-step budgeting
          "https://www.moneyunder30.com/how-to-save-money", // Money-saving tips
          "https://www.investopedia.com/articles/personal-finance/100516/10-basic-principles-financial-management.asp", // Financial management principles
          "https://www.bankrate.com/banking/savings/how-to-save-money/", // Best ways to save money
          "https://www.consumerfinance.gov/consumer-tools/budgeting-saving/", // Government financial education resources
      ];

      // Open each link in a new tab
      links.forEach(link => {
          window.open(link, "_blank");
      });
  }
}



function startFinancialQuiz() {
  const questions = [
      {
          question: "What is the 50/30/20 rule in budgeting?",
          options: [
              "50% needs, 30% wants, 20% savings",
              "50% savings, 30% wants, 20% needs",
              "50% investments, 30% taxes, 20% leisure",
              "50% luxury, 30% essentials, 20% donations"
          ],
          answer: 0
      },
      {
          question: "Which of the following is a liability?",
          options: [
              "Savings account",
              "Credit card debt",
              "Retirement fund",
              "Investment portfolio"
          ],
          answer: 1
      },
      {
          question: "Which financial habit is the best for saving money?",
          options: [
              "Spending first, saving what's left",
              "Saving a fixed amount before spending",
              "Relying on credit cards",
              "Ignoring budgets"
          ],
          answer: 1
      }
  ];

  let score = 0;

  for (let i = 0; i < questions.length; i++) {
      let userAnswer = prompt(
          `${questions[i].question}\n\n` +
          `1. ${questions[i].options[0]}\n` +
          `2. ${questions[i].options[1]}\n` +
          `3. ${questions[i].options[2]}\n` +
          `4. ${questions[i].options[3]}\n\n` +
          "Enter the number of your answer:"
      );

      if (parseInt(userAnswer) - 1 === questions[i].answer) {
          alert("✅ Correct!");
          score++;
      } else {
          alert("❌ Wrong answer. The correct answer is: " + questions[i].options[questions[i].answer]);
      }
  }

  alert(`🎉 Quiz Completed! Your Score: ${score} / ${questions.length}`);
}
