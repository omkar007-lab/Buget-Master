
    // DOM Elements
    const expenseList = document.getElementById('expense-list');
    const newCategoryInput = document.getElementById('new-category');
    const newAmountInput = document.getElementById('new-amount');
    const addExpenseButton = document.getElementById('add-expense');
    const totalExpensesElement = document.getElementById('total-expenses');
    const monthlyIncomeInput = document.getElementById('monthly-income');
    const savingsGoalInput = document.getElementById('savings-goal');
    const initialSavingsInput = document.getElementById('initial-savings');
    const calculateButton = document.getElementById('calculate-btn');
    const savingsSummary = document.getElementById('savings-summary');
    const summaryIncome = document.getElementById('summary-income');
    const summaryExpenses = document.getElementById('summary-expenses');
    const summaryAvailable = document.getElementById('summary-available');
    const recommendationsSection = document.getElementById('recommendations-section');
    const chartSection = document.getElementById('chart-section');
    const getFeedbackButton = document.getElementById('get-feedback-btn');
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackText = document.getElementById('feedback-text');
    const resetDataButton = document.getElementById('reset-data');
    
    const customPercentInput = document.getElementById('custom-percent');
    const customPercentValue = document.getElementById('custom-percent-value');
    const customAmountElement = document.getElementById('custom-amount');
    const customTimeElement = document.getElementById('custom-time');
    const updateCustomPlanButton = document.getElementById('update-custom-plan');
    
    // Chart related elements
    const chartTabButtons = document.querySelectorAll('.tab-button');
    const savingsChart = document.getElementById('savings-chart');
    
    // Global state
    let expenses = [];
    let monthlyIncome = 0;
    let savingsGoal = 0;
    let initialSavings = 0;
    let chart = null;
    let currentChartType = 'line';
    
    // Initialize the app
    function init() {
      loadFromLocalStorage();
      renderExpenseList();
      calculateTotalExpenses();
      
      // Set up event listeners
      addExpenseButton.addEventListener('click', addExpense);
      calculateButton.addEventListener('click', calculateSavingsPlans);
      getFeedbackButton.addEventListener('click', getFeedback);
      resetDataButton.addEventListener('click', resetAllData);
      
      customPercentInput.addEventListener('input', updateCustomPercentValue);
      updateCustomPlanButton.addEventListener('click', updateChartWithCustomPlan);
      
      // Set up chart tab event listeners
      chartTabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.id;
          currentChartType = tabId.split('-')[1]; // Extract 'line', 'bar', etc.
          
          // Update active tab styling
          chartTabButtons.forEach(btn => btn.classList.remove('tab-active'));
          button.classList.add('tab-active');
          
          // Update the chart
          updateChart();
        });
      });
    }
    
    // Load data from localStorage
    function loadFromLocalStorage() {
      const savedExpenses = localStorage.getItem('budgetMaster_expenses');
      const savedIncome = localStorage.getItem('budgetMaster_income');
      const savedGoal = localStorage.getItem('budgetMaster_savingsGoal');
      const savedInitialSavings = localStorage.getItem('budgetMaster_initialSavings');
      
      if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
      }
      
      if (savedIncome) {
        monthlyIncome = parseFloat(savedIncome);
        monthlyIncomeInput.value = monthlyIncome;
      }
      
      if (savedGoal) {
        savingsGoal = parseFloat(savedGoal);
        savingsGoalInput.value = savingsGoal;
      }
      
      if (savedInitialSavings) {
        initialSavings = parseFloat(savedInitialSavings);
        initialSavingsInput.value = initialSavings;
      }
      
      // If we have all necessary data, auto-calculate plans
      if (savedIncome && savedGoal && expenses.length > 0) {
        calculateSavingsPlans();
      }
    }
    
    // Save data to localStorage
    function saveToLocalStorage() {
      localStorage.setItem('budgetMaster_expenses', JSON.stringify(expenses));
      localStorage.setItem('budgetMaster_income', monthlyIncome.toString());
      localStorage.setItem('budgetMaster_savingsGoal', savingsGoal.toString());
      localStorage.setItem('budgetMaster_initialSavings', initialSavings.toString());
    }
    
    // Render expense list
    function renderExpenseList() {
      expenseList.innerHTML = '';
      
      if (expenses.length === 0) {
        expenseList.innerHTML = '<p class="text-gray-500 italic">No expenses added yet. Add your monthly expenses below.</p>';
        return;
      }
      
      expenses.forEach((expense, index) => {
        const expenseItem = document.createElement('div');
        expenseItem.className = 'flex justify-between items-center py-2 border-b border-gray-100';
        expenseItem.innerHTML = `
          <span class="text-gray-800">${expense.category}</span>
          <div class="flex items-center">
            <span class="text-gray-800 mr-3">$${expense.amount.toFixed(2)}</span>
            <button class="text-red-500 hover:text-red-700" data-index="${index}">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        
        expenseList.appendChild(expenseItem);
        
        // Add event listener to delete button
        const deleteButton = expenseItem.querySelector('button');
        deleteButton.addEventListener('click', () => {
          deleteExpense(index);
        });
      });
    }
    
    // Add a new expense
    function addExpense() {
      const category = newCategoryInput.value.trim();
      const amountStr = newAmountInput.value.trim();
      
      if (!category) {
        alert('Please enter an expense category.');
        return;
      }
      
      if (!amountStr || isNaN(parseFloat(amountStr))) {
        alert('Please enter a valid amount.');
        return;
      }
      
      const amount = parseFloat(amountStr);
      
      expenses.push({ category, amount });
      saveToLocalStorage();
      
      // Clear inputs
      newCategoryInput.value = '';
      newAmountInput.value = '';
      
      renderExpenseList();
      calculateTotalExpenses();
    }
    
    // Delete an expense
    function deleteExpense(index) {
      expenses.splice(index, 1);
      saveToLocalStorage();
      renderExpenseList();
      calculateTotalExpenses();
    }
    
    // Calculate total expenses
    function calculateTotalExpenses() {
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      totalExpensesElement.textContent = `$${total.toFixed(2)}`;
      return total;
    }
    
    // Calculate savings plans
    function calculateSavingsPlans() {
      monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
      savingsGoal = parseFloat(savingsGoalInput.value) || 0;
      initialSavings = parseFloat(initialSavingsInput.value) || 0;
      
      if (monthlyIncome <= 0) {
        alert('Please enter a valid monthly income.');
        return;
      }
      
      if (savingsGoal <= 0) {
        alert('Please enter a valid savings goal.');
        return;
      }
      
      // Save inputs to localStorage
      saveToLocalStorage();
      
      // Calculate total expenses
      const totalExpenses = calculateTotalExpenses();
      
      // Calculate available money for savings
      const availableForSavings = monthlyIncome - totalExpenses;
      
      if (availableForSavings <= 0) {
        alert('Your expenses exceed your income. Please adjust your budget to create savings capacity.');
        return;
      }
      
      // Update summary
      summaryIncome.textContent = `$${monthlyIncome.toFixed(2)}`;
      summaryExpenses.textContent = `$${totalExpenses.toFixed(2)}`;
      summaryAvailable.textContent = `$${availableForSavings.toFixed(2)}`;
      savingsSummary.classList.remove('hidden');
      
      // Calculate different savings plans
      const remainingGoal = savingsGoal - initialSavings;
      
      // Conservative plan (10%)
      const conservativeRate = 0.10;
      const conservativeSaving = monthlyIncome * conservativeRate;
      const conservativeMonths = Math.ceil(remainingGoal / conservativeSaving);
      
      // Moderate plan (20%)
      const moderateRate = 0.20;
      const moderateSaving = monthlyIncome * moderateRate;
      const moderateMonths = Math.ceil(remainingGoal / moderateSaving);
      
      // Aggressive plan (30%)
      const aggressiveRate = 0.30;
      const aggressiveSaving = monthlyIncome * aggressiveRate;
      const aggressiveMonths = Math.ceil(remainingGoal / aggressiveSaving);
      
      // Update recommendations section
      document.querySelectorAll('.conservative-percent').forEach(el => el.textContent = `${(conservativeRate * 100).toFixed(0)}%`);
      document.querySelectorAll('.conservative-amount').forEach(el => el.textContent = `$${conservativeSaving.toFixed(2)}`);
      document.querySelectorAll('.conservative-time').forEach(el => {
        const years = Math.floor(conservativeMonths / 12);
        const months = conservativeMonths % 12;
        el.textContent = years > 0 ? `${years} years, ${months} months` : `${conservativeMonths} months`;
      });
      
      document.querySelectorAll('.moderate-percent').forEach(el => el.textContent = `${(moderateRate * 100).toFixed(0)}%`);
      document.querySelectorAll('.moderate-amount').forEach(el => el.textContent = `$${moderateSaving.toFixed(2)}`);
      document.querySelectorAll('.moderate-time').forEach(el => {
        const years = Math.floor(moderateMonths / 12);
        const months = moderateMonths % 12;
        el.textContent = years > 0 ? `${years} years, ${months} months` : `${moderateMonths} months`;
      });
      
      document.querySelectorAll('.aggressive-percent').forEach(el => el.textContent = `${(aggressiveRate * 100).toFixed(0)}%`);
      document.querySelectorAll('.aggressive-amount').forEach(el => el.textContent = `$${aggressiveSaving.toFixed(2)}`);
      document.querySelectorAll('.aggressive-time').forEach(el => {
        const years = Math.floor(aggressiveMonths / 12);
        const months = aggressiveMonths % 12;
        el.textContent = years > 0 ? `${years} years, ${months} months` : `${aggressiveMonths} months`;
      });
      
      // Update custom plan
      updateCustomPercentValue();
      
      // Show recommendations and chart sections
      recommendationsSection.classList.remove('hidden');
      chartSection.classList.remove('hidden');
      
      // Create or update chart
      createOrUpdateChart(conservativeMonths, moderateMonths, aggressiveMonths);
    }
    
    // Update custom percent value display
    function updateCustomPercentValue() {
      const customPercent = parseInt(customPercentInput.value);
      customPercentValue.textContent = `${customPercent}%`;
      
      // Update the custom amount and time if we have valid income and goal
      if (monthlyIncome > 0 && savingsGoal > 0) {
        const customSaving = (monthlyIncome * (customPercent / 100)).toFixed(2);
        const remainingGoal = savingsGoal - initialSavings;
        const customMonths = Math.ceil(remainingGoal / customSaving);
        
        customAmountElement.textContent = `$${customSaving}`;
        
        const years = Math.floor(customMonths / 12);
        const months = customMonths % 12;
        customTimeElement.textContent = years > 0 ? `${years} years, ${months} months` : `${customMonths} months`;
      }
    }
    
    // Create or update the savings chart
    function createOrUpdateChart(conservativeMonths, moderateMonths, aggressiveMonths) {
      // Destroy existing chart if it exists
      if (chart) {
        chart.destroy();
      }
      
      const remainingGoal = savingsGoal - initialSavings;
      const conservativeSaving = monthlyIncome * 0.1;
      const moderateSaving = monthlyIncome * 0.2;
      const aggressiveSaving = monthlyIncome * 0.3;
      
      // Generate data for each plan
      const conservativeData = [];
      const moderateData = [];
      const aggressiveData = [];
      const labels = [];
      
      // Max months needed for any plan
      const maxMonths = Math.max(conservativeMonths, moderateMonths, aggressiveMonths);
      
      for (let i = 0; i <= maxMonths; i++) {
        labels.push(i);
        
        // Calculate cumulative savings for each plan
        const conservativeAmount = initialSavings + (conservativeSaving * i);
        const moderateAmount = initialSavings + (moderateSaving * i);
        const aggressiveAmount = initialSavings + (aggressiveSaving * i);
        
        // Cap at the goal amount
        conservativeData.push(Math.min(conservativeAmount, savingsGoal));
        moderateData.push(Math.min(moderateAmount, savingsGoal));
        aggressiveData.push(Math.min(aggressiveAmount, savingsGoal));
      }
      
      // Set up chart options based on the current chart type
      let chartConfig = {
        type: currentChartType === 'combo' ? 'bar' : currentChartType,
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Conservative (10%)',
              data: conservativeData,
              borderColor: 'rgba(72, 187, 120, 1)',
              backgroundColor: 'rgba(72, 187, 120, 0.2)',
              tension: 0.4
            },
            {
              label: 'Moderate (20%)',
              data: moderateData,
              borderColor: 'rgba(66, 153, 225, 1)',
              backgroundColor: 'rgba(66, 153, 225, 0.2)',
              tension: 0.4
            },
            {
              label: 'Aggressive (30%)',
              data: aggressiveData,
              borderColor: 'rgba(159, 122, 234, 1)',
              backgroundColor: 'rgba(159, 122, 234, 0.2)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Months'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Savings ($)'
              },
              beginAtZero: true
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Savings Progress Over Time'
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += `$${context.parsed.y.toFixed(2)}`;
                  return label;
                }
              }
            }
          },
          // Line for goal amount
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                yMin: savingsGoal,
                yMax: savingsGoal,
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                label: {
                  content: `Goal: $${savingsGoal}`,
                  enabled: true,
                  position: 'end'
                }
              }
            }
          }
        }
      };
      
      // Special handling for combination chart type
      if (currentChartType === 'combo') {
        chartConfig.data.datasets[0].type = 'line';
        chartConfig.data.datasets[1].type = 'bar';
        chartConfig.data.datasets[2].type = 'line';
        // Make the line datasets appear on top of the bar dataset
        chartConfig.data.datasets[0].order = 1;
        chartConfig.data.datasets[1].order = 3;
        chartConfig.data.datasets[2].order = 2;
      }
      
      // Special handling for area chart
      if (currentChartType === 'area') {
        chartConfig.type = 'line';
        chartConfig.data.datasets.forEach(dataset => {
          dataset.fill = true;
        });
      }
      
      // Create the chart
      chart = new Chart(savingsChart, chartConfig);
    }
    
    // Update chart with custom plan
    function updateChartWithCustomPlan() {
      const customPercent = parseInt(customPercentInput.value);
      const customSaving = monthlyIncome * (customPercent / 100);
      const remainingGoal = savingsGoal - initialSavings;
      const customMonths = Math.ceil(remainingGoal / customSaving);
      
      // Add custom plan to existing chart
      const customData = [];
      for (let i = 0; i <= customMonths; i++) {
        const customAmount = initialSavings + (customSaving * i);
        customData.push(Math.min(customAmount, savingsGoal));
      }
      
      // Add or update custom dataset
      const customDatasetExists = chart.data.datasets.some(dataset => dataset.label === `Custom (${customPercent}%)`);
      
      if (customDatasetExists) {
        // Find and update the custom dataset
        const customDatasetIndex = chart.data.datasets.findIndex(dataset => dataset.label.startsWith('Custom'));
        chart.data.datasets[customDatasetIndex].label = `Custom (${customPercent}%)`;
        chart.data.datasets[customDatasetIndex].data = customData;
      } else {
        // Add a new custom dataset
        chart.data.datasets.push({
          label: `Custom (${customPercent}%)`,
          data: customData,
          borderColor: 'rgba(237, 100, 166, 1)',
          backgroundColor: 'rgba(237, 100, 166, 0.2)',
          tension: 0.4,
          // For combo chart
          type: currentChartType === 'combo' ? 'line' : undefined,
          fill: currentChartType === 'area'
        });
      }
      
      // Make sure labels array is long enough
      const maxMonths = Math.max(...chart.data.datasets.map(dataset => dataset.data.length - 1), chart.data.labels.length - 1);
      chart.data.labels = Array.from({ length: maxMonths + 1 }, (_, i) => i);
      
      chart.update();
    }
    
    // Update chart based on selected type
    function updateChart() {
      if (chart) {
        // Store current datasets
        const datasets = chart.data.datasets;
        
        // Destroy current chart
        chart.destroy();
        
        // Creating new chart with same data but different type
        let newType = currentChartType;
        if (currentChartType === 'area') {
          newType = 'line';
        } else if (currentChartType === 'combo') {
          newType = 'bar';
        }
        
        chart = new Chart(savingsChart, {
          type: newType,
          data: {
            labels: chart.data.labels,
            datasets: datasets.map((dataset, index) => {
              // For combo chart
              if (currentChartType === 'combo') {
                if (index === 1) { // Middle dataset as bar
                  return {...dataset, type: 'bar', order: 3};
                } else { // Other datasets as lines
                  return {...dataset, type: 'line', order: index === 0 ? 1 : 2};
                }
              }
              
              // For area chart
              if (currentChartType === 'area') {
                return {...dataset, fill: true};
              }
              
              return {...dataset, fill: false};
            })
          },
          options: chart.options
        });
      }
    }
    
    // Get AI feedback on expenses
    function getFeedback() {
      if (expenses.length === 0 || monthlyIncome <= 0) {
        alert('Please add your expenses and income first');
        return;
      }
      
      getFeedbackButton.disabled = true;
      getFeedbackButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Getting feedback...';
      
      // Find the highest expense category
      const highestExpense = expenses.reduce((prev, current) => {
        return (prev.amount > current.amount) ? prev : current;
      });
      
      const highestExpensePercentage = (highestExpense.amount / monthlyIncome * 100).toFixed(1);
      
      // Simulate API call with setTimeout
      setTimeout(() => {
        // This is where we'd normally call an API endpoint
        const feedbackResponse = getFeedbackFromExpenses(highestExpense, highestExpensePercentage);
        
        feedbackText.textContent = feedbackResponse;
        feedbackContainer.classList.remove('hidden');
        const feedbackBubble = document.querySelector('.feedback-bubble');
        feedbackBubble.classList.add('show');
        
        getFeedbackButton.disabled = false;
        getFeedbackButton.innerHTML = '<i class="fas fa-comment-dots mr-1"></i> Get Feedback';
      }, 1500);
    }
    
    // Simulate API response - this would be replaced by a real API call
    function getFeedbackFromExpenses(highestExpense, percentage) {
      // Simple logic to generate feedback based on the highest expense
      if (highestExpense.category.toLowerCase().includes('car') || 
          highestExpense.category.toLowerCase().includes('auto') ||
          highestExpense.category.toLowerCase().includes('vehicle')) {
        return `Wow, you must really like driving! That's a nice car! Your ${highestExpense.category} takes up ${percentage}% of your income. Consider if there are ways to reduce this expense to reach your savings goal faster.`;
      } else if (highestExpense.category.toLowerCase().includes('house') || 
                 highestExpense.category.toLowerCase().includes('rent') ||
                 highestExpense.category.toLowerCase().includes('mortgage')) {
        return `I see your ${highestExpense.category} is your largest expense at ${percentage}% of your income. Housing is typically a big chunk of anyone's budget, but worth evaluating if it aligns with your savings goals.`;
      } else if (highestExpense.category.toLowerCase().includes('food') || 
                 highestExpense.category.toLowerCase().includes('grocery') ||
                 highestExpense.category.toLowerCase().includes('dining')) {
        return `You're spending ${percentage}% of your income on ${highestExpense.category}. Everyone needs to eat, but maybe there's room to trim this down? Meal prepping can work wonders for the budget!`;
      } else {
        return `I noticed ${highestExpense.category} is your largest expense at ${percentage}% of your income. Consider if this aligns with your financial priorities and savings goals.`;
      }
    }
    
    // Reset all data
    function resetAllData() {
      if (confirm('Are you sure you want to reset all your budget data? This cannot be undone.')) {
        localStorage.removeItem('budgetMaster_expenses');
        localStorage.removeItem('budgetMaster_income');
        localStorage.removeItem('budgetMaster_savingsGoal');
        localStorage.removeItem('budgetMaster_initialSavings');
        
        expenses = [];
        monthlyIncome = 0;
        savingsGoal = 0;
        initialSavings = 0;
        
        // Clear input fields
        monthlyIncomeInput.value = '';
        savingsGoalInput.value = '';
        initialSavingsInput.value = '';
        newCategoryInput.value = '';
        newAmountInput.value = '';
        
        // Reset UI elements
        renderExpenseList();
        calculateTotalExpenses();
        savingsSummary.classList.add('hidden');
        recommendationsSection.classList.add('hidden');
        chartSection.classList.add('hidden');
        feedbackContainer.classList.add('hidden');
        
        // Destroy chart if it exists
        if (chart) {
          chart.destroy();
          chart = null;
        }
      }
    }
    
    // Initialize the app
    init();