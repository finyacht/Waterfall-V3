// Initialize Chart.js
let budgetChart;
let investmentChart;

// DOM Elements
const netSalaryInput = document.getElementById('net-salary');
const needsAmountInput = document.getElementById('needs-amount');
const wantsAmountInput = document.getElementById('wants-amount');
const savingsAmountInput = document.getElementById('savings-amount');
const stocksPercentageInput = document.getElementById('stocks-percentage');
const stocksGrowthInput = document.getElementById('stocks-return-rate');
const stocksGrowthPatternSelect = document.getElementById('stocks-growth-pattern');
const bankPercentageInput = document.getElementById('bank-percentage');
const bankGrowthInput = document.getElementById('bank-interest-rate');
const stocksCompoundingSelect = document.getElementById('stocks-compounding');
const bankCompoundingSelect = document.getElementById('bank-compounding');
const budgetRuleButtons = document.querySelectorAll('.budget-rule-btn');
const statusIcons = document.querySelectorAll('.status-icon');
const projectionYearsSelect = document.getElementById('projection-years');
const investmentDetailsToggle = document.getElementById('investment-details-toggle');
const mathExplanation = document.getElementById('math-explanation');
const totalProgress = document.getElementById('total-progress');
const totalPercentage = document.getElementById('total-percentage');

// Track current investment settings
let stocksGrowthPattern = 'yearly'; // reinvest, monthly, yearly, maturity
let stocksCompoundingFrequency = 'monthly';
let bankCompoundingFrequency = 'monthly';
let stocksRedeemFrequency = 'yearly';
let bankRedeemFrequency = 'yearly';
let bankCompoundingType = 'compound';
let showAdvancedExplanations = false;

// Budget Rules with descriptions
const budgetRules = {
    '50-30-20': { 
        needs: 50, 
        wants: 30, 
        savings: 20,
        description: 'The 50-30-20 rule suggests allocating 50% of your income to needs (essential expenses), 30% to wants (non-essential expenses), and 20% to savings and debt repayment.',
        examples: {
            needs: 'Rent/mortgage, utilities, groceries, insurance, minimum debt payments',
            wants: 'Dining out, entertainment, shopping, hobbies, vacations',
            savings: 'Emergency fund, retirement accounts, investments, additional debt payments'
        }
    },
    '60-20-20': { 
        needs: 60, 
        wants: 20, 
        savings: 20,
        description: 'The 60-20-20 rule is a more conservative approach, allocating 60% to needs, 20% to wants, and 20% to savings, suitable for those with higher essential expenses.',
        examples: {
            needs: 'Housing in expensive areas, medical expenses, family necessities',
            wants: 'Occasional treats, basic entertainment, modest shopping',
            savings: 'Retirement savings, education fund, long-term investments'
        }
    },
    'custom': { 
        needs: 0, 
        wants: 0, 
        savings: 0,
        description: 'Custom allocation allows you to set your own percentages based on your unique financial situation and goals.',
        examples: {
            needs: 'Essential expenses that must be paid',
            wants: 'Non-essential expenses that improve quality of life',
            savings: 'Money set aside for future goals and security'
        }
    }
};

// Initialize tooltips
function initializeTooltips() {
    const buttons = document.querySelectorAll('.budget-rule-btn');
    buttons.forEach(button => {
        const rule = button.dataset.rule;
        button.title = budgetRules[rule].description;
    });

    // Add tooltips for budget categories
    const currentRule = getCurrentRule();
    const needsTitle = document.querySelector('.needs-title');
    const wantsTitle = document.querySelector('.wants-title');
    const savingsTitle = document.querySelector('.savings-title');

    needsTitle.title = `Examples: ${budgetRules[currentRule].examples.needs}`;
    wantsTitle.title = `Examples: ${budgetRules[currentRule].examples.wants}`;
    savingsTitle.title = `Examples: ${budgetRules[currentRule].examples.savings}`;
}

// Initialize the charts
function initializeCharts() {
    // Budget Chart
    const budgetCtx = document.getElementById('budget-chart').getContext('2d');
    budgetChart = new Chart(budgetCtx, {
        type: 'doughnut',
        data: {
            labels: ['Needs', 'Wants', 'Savings'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    '#4F46E5', // Indigo for Needs
                    '#EC4899', // Pink for Wants
                    '#10B981'  // Emerald for Savings
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        padding: 15,
                        font: { size: 14 },
                        boxWidth: 12,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // Investment Chart
    const investmentCtx = document.getElementById('investment-chart').getContext('2d');
    investmentChart = new Chart(investmentCtx, {
        type: 'doughnut',
        data: {
            labels: ['Stocks', 'Savings Bank'],
            datasets: [{
                data: [40, 60],
                backgroundColor: [
                    '#F59E0B', // Amber for Stocks
                    '#3B82F6'  // Blue for Bank
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        padding: 15,
                        font: { size: 14 },
                        boxWidth: 12,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const savings = parseFloat(savingsAmountInput.value) || 0;
                            const percentage = context.raw;
                            const amount = savings * (percentage / 100);
                            return `${context.label}: ${formatCurrency(amount)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// Update budget amounts based on selected rule
function updateBudgetAmounts(rule) {
    const netSalary = parseFloat(netSalaryInput.value) || 0;
    const rulePercentages = budgetRules[rule];
    
    needsAmountInput.value = Math.round(netSalary * rulePercentages.needs / 100);
    wantsAmountInput.value = Math.round(netSalary * rulePercentages.wants / 100);
    savingsAmountInput.value = Math.round(netSalary * rulePercentages.savings / 100);
    
    updateBudgetStatus();
    updateCharts();
    updateSummary();
    calculateProjection();
}

// Update budget status indicators
function updateBudgetStatus() {
    const netSalary = parseFloat(netSalaryInput.value.replace(/,/g, '')) || 0;
    const needs = parseFloat(needsAmountInput.value.replace(/,/g, '')) || 0;
    const wants = parseFloat(wantsAmountInput.value.replace(/,/g, '')) || 0;
    const savings = parseFloat(savingsAmountInput.value.replace(/,/g, '')) || 0;
    
    // Force display of values if they're empty but DON'T reset them if they have values
    if (needs === 0 && wants === 0 && savings === 0 && netSalary > 0) {
        const rule = getCurrentRule();
        needsAmountInput.value = Math.round(netSalary * budgetRules[rule].needs / 100);
        wantsAmountInput.value = Math.round(netSalary * budgetRules[rule].wants / 100);
        savingsAmountInput.value = Math.round(netSalary * budgetRules[rule].savings / 100);
    }
    
    // Keep the existing field values - NEVER set to empty
    if (needsAmountInput.value === '') needsAmountInput.value = '0';
    if (wantsAmountInput.value === '') wantsAmountInput.value = '0';
    if (savingsAmountInput.value === '') savingsAmountInput.value = '0';
    
    const needsPercentage = (needs / netSalary) * 100 || 0;
    const wantsPercentage = (wants / netSalary) * 100 || 0;
    const savingsPercentage = (savings / netSalary) * 100 || 0;
    const totalPercentageValue = needsPercentage + wantsPercentage + savingsPercentage;
    
    // Update total percentage indicator with color change
    totalProgress.style.width = `${Math.min(totalPercentageValue, 100)}%`;
    totalProgress.style.background = totalPercentageValue > 100 
        ? '#EF4444'  // Red for overshoot
        : '#10B981'; // Green for normal
    totalPercentage.textContent = `${totalPercentageValue.toFixed(1)}%`;
    totalPercentage.style.color = totalPercentageValue > 100 ? '#EF4444' : '#10B981';
    
    // Update current savings display in investment explanation
    document.getElementById('current-savings').textContent = formatCurrency(savings).replace('$', '');
    
    const currentRule = getCurrentRule();
    
    // Update status icons and percentages
    document.querySelector('.needs-percentage').textContent = `${needsPercentage.toFixed(1)}%`;
    document.querySelector('.wants-percentage').textContent = `${wantsPercentage.toFixed(1)}%`;
    document.querySelector('.savings-percentage').textContent = `${savingsPercentage.toFixed(1)}%`;
    
    // Update status icons with tooltips
    statusIcons[0].textContent = needsPercentage > budgetRules[currentRule].needs ? '👎' : '👍';
    statusIcons[0].title = needsPercentage > budgetRules[currentRule].needs ? 
        'Outside budget: Spending too much on needs' : 
        'Within budget: Needs spending is on track';

    statusIcons[1].textContent = wantsPercentage > budgetRules[currentRule].wants ? '👎' : '👍';
    statusIcons[1].title = wantsPercentage > budgetRules[currentRule].wants ? 
        'Outside budget: Spending too much on wants' : 
        'Within budget: Wants spending is on track';

    statusIcons[2].textContent = savingsPercentage > budgetRules[currentRule].savings ? '👎' : '👍';
    statusIcons[2].title = savingsPercentage > budgetRules[currentRule].savings ? 
        'Outside budget: Saving more than planned' : 
        'Within budget: Savings are on track';

    updateInvestmentSliders();
}

// Get current selected budget rule
function getCurrentRule() {
    return document.querySelector('.budget-rule-btn.active').dataset.rule;
}

// Update charts
function updateCharts() {
    const needs = parseFloat(needsAmountInput.value) || 0;
    const wants = parseFloat(wantsAmountInput.value) || 0;
    const savings = parseFloat(savingsAmountInput.value) || 0;
    
    // Check if chart exists before updating
    if (budgetChart) {
        budgetChart.data.datasets[0].data = [needs, wants, savings];
        budgetChart.update();
    }
    
    // Update investment chart based on savings
    const stocksPercentage = parseFloat(stocksPercentageInput.value) || 40;
    const bankPercentage = parseFloat(bankPercentageInput.value) || 60;
    
    if (investmentChart) {
        investmentChart.data.datasets[0].data = [stocksPercentage, bankPercentage];
        investmentChart.update();
    }
    
    // Force update on investment amounts display
    document.querySelector('.stocks-amount').textContent = formatCurrency(savings * (stocksPercentage / 100));
    document.querySelector('.bank-amount').textContent = formatCurrency(savings * (bankPercentage / 100));
}

// Update summary based on view
function updateSummary() {
    const view = currentChartView || 'monthly';
    const monthlySavings = parseFloat(savingsAmountInput.value.replace(/,/g, '')) || 0;
    const stocksPercentage = parseFloat(stocksPercentageInput.value) || 40;
    const bankPercentage = parseFloat(bankPercentageInput.value) || 60;
    const stocksReturn = parseFloat(stocksGrowthInput.value) || 15;
    const bankInterest = parseFloat(bankGrowthInput.value) || 7;
    const years = parseInt(projectionYearsSelect.value) || 3;
    
    // Get the yearly data for calculations
    const yearlyData = calculateYearlyData();
    
    // Set multiplier based on view
    let multiplier = 1;
    let viewLabel = 'Monthly';
    
    switch(view) {
        case 'yearly':
            multiplier = 12;
            viewLabel = 'Annual';
            break;
        case 'projection':
            multiplier = 12 * years;
            viewLabel = `${years}-Year`;
            break;
    }
    
    // Calculate the savings amount based on view (base contributions)
    const viewSavings = monthlySavings * multiplier;
    document.getElementById('summary-savings').textContent = formatCurrency(viewSavings);
    
    // Calculate investment growth and breakdown
    let totalGrowth = 0;
    let stocksGrowthAmount = 0;
    let bankGrowthAmount = 0;
    
    if (yearlyData.length > 0) {
        if (view === 'monthly') {
            // For monthly view, show average monthly growth
            if (yearlyData[0]) {
                totalGrowth = yearlyData[0].growth / 12;
            }
        } else if (view === 'yearly') {
            // For yearly view, show growth after 1 year
            if (yearlyData[0]) {
                totalGrowth = yearlyData[0].growth;
            }
        } else {
            // For projection view, show total growth over the projection period
            const finalData = yearlyData[yearlyData.length - 1];
            totalGrowth = finalData.endingBalance - viewSavings;
        }
        
        // Calculate the breakdown between stocks and savings bank
        if (totalGrowth > 0) {
            // Handle edge cases of 100% allocations
            if (stocksPercentage === 100) {
                // All growth is from stocks
                stocksGrowthAmount = totalGrowth;
                bankGrowthAmount = 0;
            } else if (bankPercentage === 100 || stocksPercentage === 0) {
                // All growth is from bank
                stocksGrowthAmount = 0;
                bankGrowthAmount = totalGrowth;
            } else {
                // Mixed allocation - proportion based on allocation and growth rates
                const stocksWeighted = stocksPercentage * stocksReturn;
                const bankWeighted = bankPercentage * bankInterest;
                const totalWeighted = stocksWeighted + bankWeighted;
                
                if (totalWeighted > 0) {
                    stocksGrowthAmount = totalGrowth * (stocksWeighted / totalWeighted);
                    bankGrowthAmount = totalGrowth * (bankWeighted / totalWeighted);
                }
            }
        }
    }
    
    // Update growth values with actual growth, not allocation
    document.getElementById('summary-growth').textContent = formatCurrency(totalGrowth);
    document.getElementById('stocks-growth-amount').textContent = formatCurrency(stocksGrowthAmount);
    document.getElementById('bank-growth-amount').textContent = formatCurrency(bankGrowthAmount);
    
    // Calculate and update end balance (savings + growth)
    const endBalance = viewSavings + totalGrowth;
    document.getElementById('summary-balance').textContent = formatCurrency(endBalance);
    
    // Update card titles to reflect the current view
    const cardTitles = document.querySelectorAll('.card-title');
    cardTitles[0].textContent = `${viewLabel} Savings`;
    cardTitles[1].textContent = `${viewLabel} Investment Growth`;
    cardTitles[2].textContent = `${viewLabel} End Balance`;
}

// Function to toggle growth breakdown visibility
function toggleGrowthBreakdown(event) {
    const breakdownEl = event.currentTarget.nextElementSibling;
    if (breakdownEl.classList.contains('growth-breakdown')) {
        breakdownEl.classList.toggle('show');
    }
}

// Function to toggle advanced explanations
function toggleAdvancedExplanations() {
    showAdvancedExplanations = !showAdvancedExplanations;
    const explanationElements = document.querySelectorAll('.advanced-explanation');
    explanationElements.forEach(el => {
        el.style.display = showAdvancedExplanations ? 'block' : 'none';
    });
    const toggleButton = document.getElementById('toggle-explanations');
    if (toggleButton) {
        toggleButton.textContent = showAdvancedExplanations ? 'Hide Explanations' : 'Show Explanations';
    }
    updateMathExplanation();
}

// Calculate yearly data without updating UI
function calculateYearlyData() {
    const monthlySavings = parseFloat(savingsAmountInput.value) || 0;
    const stocksPercentage = parseFloat(stocksPercentageInput.value) || 0;
    const stocksReturn = parseFloat(stocksGrowthInput.value) || 15;
    const bankPercentage = parseFloat(bankPercentageInput.value) || 100;
    const bankInterest = parseFloat(bankGrowthInput.value) || 7;
    const years = parseInt(projectionYearsSelect.value) || 3;
    
    // Calculate monthly contributions
    const stocksMonthly = monthlySavings * (stocksPercentage / 100);
    const bankMonthly = monthlySavings * (bankPercentage / 100);
    
    let balance = 0;
    let stocksBalance = 0;
    let bankBalance = 0;
    let yearlyData = [];
    
    // Calculate compounding factors based on frequency settings
    let stocksCompoundFactor, bankCompoundFactor;
    let stocksAccumulatedGrowth = 0;
    let bankAccumulatedGrowth = 0;
    
    // Convert annual rates to appropriate factors
    
    // For stocks, we determine the compounding frequency based on growth pattern
    let stocksCompoundingFrequency;
    if (stocksGrowthPattern === 'reinvest') {
        // When reinvesting, use monthly compounding
        stocksCompoundingFrequency = 'monthly';
        // Convert annual rate to monthly: (1+r)^(1/12)-1
        stocksCompoundFactor = Math.pow(1 + (stocksReturn/100), 1/12) - 1;
    } else if (stocksGrowthPattern === 'monthly') {
        // For monthly redemption, calculate monthly growth
        stocksCompoundingFrequency = 'monthly';
        stocksCompoundFactor = Math.pow(1 + (stocksReturn/100), 1/12) - 1;
    } else if (stocksGrowthPattern === 'yearly') {
        // For yearly redemption, calculate annual rate divided into monthly portions
        stocksCompoundingFrequency = 'yearly';
        stocksCompoundFactor = stocksReturn/100;
    } else { // maturity
        // For maturity, use monthly compounding until maturity
        stocksCompoundingFrequency = 'monthly';
        stocksCompoundFactor = Math.pow(1 + (stocksReturn/100), 1/12) - 1;
    }
    
    // Bank rates based on compounding type and frequency
    if (bankCompoundingType === 'simple') {
        // Simple interest: For 10% annual, monthly should be exactly 10%/12 = 0.8333...%
        bankCompoundFactor = bankInterest / 100 / 12; // Division by 100 to convert percentage to decimal
    } else { // compound
        if (bankCompoundingFrequency === 'monthly') {
            bankCompoundFactor = Math.pow(1 + (bankInterest/100), 1/12) - 1;
        } else if (bankCompoundingFrequency === 'quarterly') {
            bankCompoundFactor = Math.pow(1 + (bankInterest/100), 1/4) - 1;
        } else { // yearly
            bankCompoundFactor = bankInterest/100;
        }
    }
    
    // For maturity redemption, we'll track the entire accumulated balance separately
    let stocksMaturityBalance = 0;
    let bankMaturityBalance = 0;
    
    for (let year = 1; year <= years; year++) {
        const startingBalance = balance;
        const yearStartStocksBalance = stocksBalance;
        const yearStartBankBalance = bankBalance;
        
        // For yearly compounding, apply growth at end of year or quarterly
        let yearlyStocksGrowth = 0;
        let yearlyBankGrowth = 0;
        
        // For simple interest on bank, we need to track the interest differently
        let bankSimpleInterestForYear = 0;
        
        // Calculate monthly contributions and growth
        for (let month = 1; month <= 12; month++) {
            // Stocks calculation
            if (stocksPercentage > 0) {
                // Add contribution first
                stocksBalance += stocksMonthly;
                
                // For maturity redemption, also track in separate balance
                if (stocksGrowthPattern === 'maturity') {
                    stocksMaturityBalance += stocksMonthly;
                }
                
                // Apply growth based on growth pattern and compounding frequency
                if (stocksGrowthPattern === 'reinvest') {
                    // For reinvestment (compound growth), apply monthly
                    let monthlyGrowth = stocksBalance * stocksCompoundFactor;
                    stocksBalance += monthlyGrowth;
                    yearlyStocksGrowth += monthlyGrowth;
                } else if (stocksGrowthPattern === 'monthly') {
                    // For monthly redemption, calculate and redeem growth monthly
                    let monthlyGrowth = stocksBalance * stocksCompoundFactor;
                    yearlyStocksGrowth += monthlyGrowth;
                    // Don't add to balance - it's redeemed each month
                } else if (stocksGrowthPattern === 'yearly' && month === 12) {
                    // For yearly redemption, calculate annual return and apply at year end
                    let yearlyGrowth = stocksBalance * stocksCompoundFactor;
                    yearlyStocksGrowth = yearlyGrowth;
                    // Don't add to balance - it's redeemed at year end
                } else if (stocksGrowthPattern === 'maturity') {
                    // For maturity, calculate monthly compound growth until maturity
                    stocksMaturityBalance *= (1 + stocksCompoundFactor);
                    if (year === years && month === 12) {
                        // At maturity, calculate total growth
                        yearlyStocksGrowth = stocksMaturityBalance - (stocksMonthly * 12 * year);
                    }
                }
            } else {
                // Just add contribution with no growth for stocks
                stocksBalance += stocksMonthly;
                
                // For maturity tracking
                if (stocksGrowthPattern === 'maturity') {
                    stocksMaturityBalance += stocksMonthly;
                }
            }
            
            // Bank calculation
            if (bankPercentage > 0) {
                // Add contribution first
                bankBalance += bankMonthly;
                
                // For maturity redemption, also track in separate balance
                if (bankRedeemFrequency === 'maturity') {
                    bankMaturityBalance += bankMonthly;
                }
                
                // Apply growth based on compounding type and frequency
                if (bankCompoundingType === 'simple') {
                    // Simple interest calculation - Calculate interest for this month's balance
                    // and apply only at the redemption frequency
                    
                    // For simple interest, calculate interest on the current balance
                    // based on how much time is left in the year for this deposit
                    const monthsRemaining = 13 - month; // 12 for first month, 1 for last month
                    const thisMonthInterest = bankMonthly * (bankInterest / 100) * (monthsRemaining / 12);
                    bankSimpleInterestForYear += thisMonthInterest;
                    
                    // Apply interest based on redemption setting at appropriate times
                    if (bankRedeemFrequency === 'monthly') {
                        // For monthly redemption, calculate interest on balance each month
                        const monthlySimpleInterest = bankBalance * (bankInterest / 100) / 12;
                        yearlyBankGrowth += monthlySimpleInterest;
                        
                        // Add to accumulated growth instead of balance - it's redeemed monthly
                        bankAccumulatedGrowth += monthlySimpleInterest;
                        
                        // At year end, reset accumulator and add to balance
                        if (month === 12) {
                            bankBalance += bankAccumulatedGrowth;
                            bankAccumulatedGrowth = 0;
                        }
                    } else if (bankRedeemFrequency === 'yearly' && month === 12) {
                        // For yearly redemption, add annual interest at year end
                        bankBalance += bankSimpleInterestForYear;
                        yearlyBankGrowth += bankSimpleInterestForYear;
                    } else if (bankRedeemFrequency === 'maturity') {
                        // For maturity, accumulate interest without adding to balance
                        if (month === 12) {
                            bankAccumulatedGrowth += bankSimpleInterestForYear;
                            yearlyBankGrowth += bankSimpleInterestForYear;
                        }
                    }
                } else {
                    // Compound interest based on frequency
                    if (bankCompoundingFrequency === 'monthly' || 
                       (bankCompoundingFrequency === 'quarterly' && month % 3 === 0) ||
                       (bankCompoundingFrequency === 'yearly' && month === 12)) {
                        
                        let monthlyInterest = 0;
                        
                        // Calculate interest based on compounding frequency
                        if (bankCompoundingFrequency === 'monthly') {
                            monthlyInterest = bankBalance * bankCompoundFactor;
                        } else if (bankCompoundingFrequency === 'quarterly' && month % 3 === 0) {
                            monthlyInterest = bankBalance * bankCompoundFactor;
                        } else if (bankCompoundingFrequency === 'yearly' && month === 12) {
                            monthlyInterest = bankBalance * bankCompoundFactor;
                        }
                        
                        // Track yearly growth for reporting
                        yearlyBankGrowth += monthlyInterest;
                        
                        // For maturity redemption, calculate compound interest but store separately
                        if (bankRedeemFrequency === 'maturity') {
                            // For maturity, calculate compound interest on maturity balance
                            if (bankCompoundingFrequency === 'monthly') {
                                bankMaturityBalance *= (1 + bankCompoundFactor);
                            } else if (bankCompoundingFrequency === 'quarterly' && month % 3 === 0) {
                                bankMaturityBalance *= (1 + bankCompoundFactor);
                            } else if (bankCompoundingFrequency === 'yearly' && month === 12) {
                                bankMaturityBalance *= (1 + bankCompoundFactor);
                            }
                            
                            // Accumulate interest for reporting but don't add to balance
                            bankAccumulatedGrowth += monthlyInterest;
                        } else if (bankRedeemFrequency === 'monthly') {
                            // For monthly redemption, add interest to accumulated growth
                            bankAccumulatedGrowth += monthlyInterest;
                            
                            // At year end, reset accumulator and add to balance
                            if (month === 12) {
                                bankBalance += bankAccumulatedGrowth;
                                bankAccumulatedGrowth = 0;
                            }
                        } else if (bankRedeemFrequency === 'yearly' && month === 12) {
                            // For yearly redemption, add accumulated interest at year end
                            bankBalance += monthlyInterest + bankAccumulatedGrowth;
                            bankAccumulatedGrowth = 0;
                        } else {
                            // Accumulate interest without adding to balance
                            bankAccumulatedGrowth += monthlyInterest;
                        }
                    }
                }
            } else {
                // Just add contribution with no growth for bank
                bankBalance += bankMonthly;
                
                // For maturity tracking
                if (bankRedeemFrequency === 'maturity') {
                    bankMaturityBalance += bankMonthly;
                }
            }
            
            // Update total balance based on redemption settings
            if (stocksGrowthPattern === 'maturity' && bankRedeemFrequency === 'maturity') {
                balance = stocksMaturityBalance + bankMaturityBalance;
            } else if (stocksGrowthPattern === 'maturity') {
                balance = stocksMaturityBalance + bankBalance;
            } else if (bankRedeemFrequency === 'maturity') {
                balance = stocksBalance + bankMaturityBalance;
            } else {
                balance = stocksBalance + bankBalance;
            }
        }
        
        // Calculate growth for the year
        let stocksGrowth, bankGrowth;
        
        // For stocks, growth depends on the pattern
        if (stocksGrowthPattern === 'maturity') {
            // For maturity, the growth is the difference between maturity balance and total contributions
            stocksGrowth = year === years ? (stocksMaturityBalance - (stocksMonthly * 12 * year)) : 0;
        } else if (stocksGrowthPattern === 'reinvest') {
            // For reinvestment, growth is included in the balance
            stocksGrowth = stocksBalance - yearStartStocksBalance - (stocksMonthly * 12);
        } else {
            // For monthly/yearly redemption, use tracked yearly growth
            stocksGrowth = yearlyStocksGrowth;
        }
        
        // For bank, growth depends on redemption frequency
        if (bankRedeemFrequency === 'maturity') {
            // For maturity, the growth is the difference between maturity balance and total contributions
            // Add the accumulated growth when at the final year
            if (year === years) {
                bankMaturityBalance += bankAccumulatedGrowth;
            }
            bankGrowth = bankMaturityBalance - (bankMonthly * 12 * year);
        } else if (bankCompoundingType === 'simple' && bankRedeemFrequency === 'yearly') {
            // For simple interest with yearly redemption, use our calculated yearly interest
            bankGrowth = bankSimpleInterestForYear;
        } else {
            // Regular growth calculation
            bankGrowth = bankBalance - yearStartBankBalance - (bankMonthly * 12);
        }
        
        const totalGrowth = stocksGrowth + bankGrowth;
        
        yearlyData.push({
            year,
            startingBalance,
            monthlySavings: monthlySavings * 12,
            growth: totalGrowth,
            stocksGrowth: stocksGrowth,
            bankGrowth: bankGrowth,
            endingBalance: balance
        });
    }
    
    return yearlyData;
}

// Update chart view and projection when view changes
function updateView(view) {
    currentChartView = view;
    updateChartView(view);
    updateInvestmentChartView(view);
    calculateProjection();
    updateSummary();
}

// Event listener for chart view buttons
document.querySelectorAll('.chart-view-btn').forEach(button => {
    button.addEventListener('click', () => {
        const view = button.dataset.view;
        document.querySelectorAll('.chart-view-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateView(view);
    });
});

// Calculate investment projection
function calculateProjection() {
    const monthlySavings = parseFloat(savingsAmountInput.value.replace(/,/g, '')) || 0;
    const stocksPercentage = parseFloat(stocksPercentageInput.value) || 40;
    const stocksReturn = parseFloat(stocksGrowthInput.value) || 15;
    const bankPercentage = parseFloat(bankPercentageInput.value) || 60;
    const bankInterest = parseFloat(bankGrowthInput.value) || 7;
    const years = parseInt(projectionYearsSelect.value) || 3;
    
    // Get the yearly data
    const yearlyData = calculateYearlyData();
    
    // Update the table and summary
    updateYearlyBreakdown(yearlyData);
    
    // Update the summary based on current view
    updateSummary();
}

// Update math explanation
function updateMathExplanation() {
    const monthlySavings = parseFloat(savingsAmountInput.value.replace(/,/g, '')) || 0;
    const stocksPercentage = parseFloat(stocksPercentageInput.value) || 40;
    const stocksReturn = parseFloat(stocksGrowthInput.value) || 15;
    const bankPercentage = parseFloat(bankPercentageInput.value) || 60;
    const bankInterest = parseFloat(bankGrowthInput.value) || 7;
    
    const stocksMonthly = monthlySavings * (stocksPercentage / 100);
    const bankMonthly = monthlySavings * (bankPercentage / 100);
    
    // Calculate effective rates based on pattern/frequency
    let monthlyStocksRate, monthlyBankRate;
    
    // Stock rates based on growth pattern
    if (stocksGrowthPattern === 'reinvest' || stocksGrowthPattern === 'monthly' || stocksGrowthPattern === 'maturity') {
        // For compound growth (reinvest) or monthly redemption, use monthly rate
        monthlyStocksRate = (Math.pow(1 + (stocksReturn/100), 1/12) - 1) * 100;
    } else { // yearly
        // For yearly redemption, just divide by 12 for illustrative purposes
        monthlyStocksRate = stocksReturn / 12;
    }
    
    // Bank rates based on compounding type and frequency
    if (bankCompoundingType === 'simple') {
        // Simple interest: For 10% annual, monthly should be exactly 10%/12 = 0.8333...%
        monthlyBankRate = bankInterest / 12;
    } else { // compound
        if (bankCompoundingFrequency === 'monthly') {
            monthlyBankRate = (Math.pow(1 + (bankInterest/100), 1/12) - 1) * 100;
        } else if (bankCompoundingFrequency === 'quarterly') {
            monthlyBankRate = (Math.pow(1 + (bankInterest/100), 1/4) - 1) * 100 / 3; // Quarterly rate divided by 3
        } else { // yearly
            monthlyBankRate = bankInterest / 12; // Annual rate divided by 12
        }
    }
    
    // Create formula explanations
    let stocksFormula = '';
    let stocksGrowthDescription = '';
    
    if (stocksGrowthPattern === 'reinvest') {
        stocksFormula = `(1 + ${stocksReturn}/100)<sup>1/12</sup> - 1 = ${(monthlyStocksRate/100).toFixed(5)}`;
        stocksGrowthDescription = `Reinvesting gains (compound growth)`;
    } else if (stocksGrowthPattern === 'monthly') {
        stocksFormula = `(1 + ${stocksReturn}/100)<sup>1/12</sup> - 1 = ${(monthlyStocksRate/100).toFixed(5)}`;
        stocksGrowthDescription = `Monthly redemption at ${monthlyStocksRate.toFixed(2)}% per month`;
    } else if (stocksGrowthPattern === 'yearly') {
        stocksFormula = `${stocksReturn}/12 = ${(stocksReturn/12).toFixed(2)}%`;
        stocksGrowthDescription = `Yearly redemption at ${stocksReturn}% per year`;
    } else if (stocksGrowthPattern === 'maturity') {
        stocksFormula = `(1 + ${stocksReturn}/100)<sup>1/12</sup> - 1 = ${(monthlyStocksRate/100).toFixed(5)}`;
        stocksGrowthDescription = `Compounding until maturity (redeem at end)`;
    }
    
    let bankFormula = '';
    if (bankCompoundingType === 'simple') {
        // Display exact division result for simple interest with proper precision (0.83%)
        const exactMonthlyRate = (bankInterest / 12).toFixed(2);
        bankFormula = `${bankInterest}/12 = ${exactMonthlyRate}%`;
    } else {
        if (bankCompoundingFrequency === 'monthly') {
            bankFormula = `(1 + ${bankInterest}/100)<sup>1/12</sup> - 1 = ${(monthlyBankRate/100).toFixed(5)}`;
        } else if (bankCompoundingFrequency === 'quarterly') {
            bankFormula = `(1 + ${bankInterest}/100)<sup>1/4</sup> - 1 = ${((Math.pow(1 + (bankInterest/100), 1/4) - 1)).toFixed(5)}`;
        } else {
            bankFormula = `${bankInterest}/12 = ${(bankInterest/12).toFixed(2)}%`;
        }
    }
    
    const explanation = `
        <p>Monthly Allocation:</p>
        <ul>
            <li>Stocks: ${formatCurrency(stocksMonthly)} (${stocksPercentage}% of savings at ${stocksReturn}% annual return)</li>
            <li>Savings Bank: ${formatCurrency(bankMonthly)} (${bankPercentage}% of savings at ${bankInterest}% interest rate)</li>
        </ul>
        <p>Growth Calculation:</p>
        <ul>
            <li>Stocks: ${stocksGrowthDescription}</li>
            <li>Effective Monthly Return Rate: ${monthlyStocksRate.toFixed(2)}%</li>
            <li>Bank: ${bankCompoundingType} interest, ${bankCompoundingFrequency} compounding, ${bankRedeemFrequency} redemption</li>
            <li>Effective Monthly Interest Rate: ${monthlyBankRate.toFixed(2)}%</li>
        </ul>
        <div class="advanced-explanation" style="display: ${showAdvancedExplanations ? 'block' : 'none'}">
            <p><strong>Rate Conversion Formulas:</strong></p>
            <ul>
                <li><strong>Stocks Monthly Rate:</strong> ${stocksFormula}</li>
                <li><strong>Bank Monthly Rate:</strong> ${bankFormula}</li>
            </ul>
            <p><small>Note: A 12% annual rate is not the same as 1% monthly. When compounded, 1% monthly equals approximately 12.68% annually.</small></p>
        </div>
    `;
    
    mathExplanation.innerHTML = explanation;
}

// Update projection summary
function updateProjectionSummary(finalBalance, years) {
    const monthlySavings = parseFloat(savingsAmountInput.value) || 0;
    const totalSavings = monthlySavings * 12 * years;
    const totalGrowth = finalBalance - totalSavings;
    
    document.getElementById('summary-projection').textContent = formatCurrency(finalBalance);
    document.getElementById('summary-growth').textContent = formatCurrency(totalGrowth);
}

// Update yearly breakdown table
function updateYearlyBreakdown(yearlyData) {
    const tbody = document.getElementById('results-table-body');
    const tableHeader = document.getElementById('results-table-header');
    
    // Clear both header and body rows
    tbody.innerHTML = '';
    if (tableHeader) {
        tableHeader.innerHTML = '';
    }
    
    const view = currentChartView || 'monthly';
    const years = parseInt(projectionYearsSelect.value) || 3;
    
    // Create single header row outside the table body
    const headerRow = document.createElement('tr');
    
    if (view === 'monthly') {
        // In monthly view, display monthly breakdown for all projected years
        const monthlySavings = parseFloat(savingsAmountInput.value.replace(/,/g, '')) || 0;
        const stocksPercentage = parseFloat(stocksPercentageInput.value) || 0;
        const bankPercentage = parseFloat(bankPercentageInput.value) || 100;
        
        // Set header for monthly view
        headerRow.innerHTML = `
            <th>Month</th>
            <th>Starting Balance</th>
            <th>Monthly Savings</th>
            <th class="operation-cell"></th>
            <th>Monthly Growth</th>
            <th class="operation-cell"></th>
            <th>Ending Balance</th>
        `;
        
        if (tableHeader) {
            tableHeader.appendChild(headerRow);
        }
        
        // Add monthly rows for all years in the projection
        let runningBalance = 0;
        
        // Loop through all months for all projected years
        for (let year = 1; year <= years; year++) {
            const yearData = yearlyData[year - 1];
            // Calculate average monthly growth for this year
            const averageMonthlyGrowth = yearData ? yearData.growth / 12 : 0;
            
            for (let month = 1; month <= 12; month++) {
                const absoluteMonth = ((year - 1) * 12) + month; // Calculate absolute month number
                const startBalance = runningBalance;
                const monthlyGrowth = averageMonthlyGrowth / 12; // Approximate monthly growth
                runningBalance += monthlySavings + monthlyGrowth;
                
                // Calculate proportion of growth based on allocation
                const stocksWeight = stocksPercentage > 0 ? stocksPercentage * parseFloat(stocksGrowthInput.value) : 0;
                const bankWeight = bankPercentage > 0 ? bankPercentage * parseFloat(bankGrowthInput.value) : 0;
                const totalWeight = stocksWeight + bankWeight;
                
                let stocksGrowthAmount = 0;
                let bankGrowthAmount = 0;
                
                if (totalWeight > 0) {
                    stocksGrowthAmount = monthlyGrowth * (stocksWeight / totalWeight);
                    bankGrowthAmount = monthlyGrowth * (bankWeight / totalWeight);
                }
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${absoluteMonth}</td>
                    <td>${formatCurrency(startBalance)}</td>
                    <td>${formatCurrency(monthlySavings)}</td>
                    <td class="operation-cell">+</td>
                    <td>
                        <div class="growth-cell">
                            <div class="growth-total" onclick="toggleGrowthBreakdown(event)">
                                ${formatCurrency(monthlyGrowth)}
                                <span class="toggle-breakdown">[Details]</span>
                            </div>
                            <div class="growth-breakdown">
                                <div class="stocks-growth">Stocks: ${formatCurrency(stocksGrowthAmount)}</div>
                                <div class="bank-growth">Bank: ${formatCurrency(bankGrowthAmount)}</div>
                            </div>
                        </div>
                    </td>
                    <td class="operation-cell">=</td>
                    <td>${formatCurrency(runningBalance)}</td>
                `;
                tbody.appendChild(row);
            }
        }
    } else if (view === 'yearly' || view === 'projection') {
        // For yearly or projection view, limit data based on view
        let dataToShow = yearlyData;
        
        // Set header for yearly/projection view
        headerRow.innerHTML = `
            <th>Year</th>
            <th>Starting Balance</th>
            <th>Annual Savings</th>
            <th class="operation-cell"></th>
            <th>Investment Growth</th>
            <th class="operation-cell"></th>
            <th>Ending Balance</th>
        `;
        
        if (tableHeader) {
            tableHeader.appendChild(headerRow);
        }
        
        dataToShow.forEach(data => {
            const row = document.createElement('tr');
            
            // Create an advanced explanation for the growth calculation
            let advancedExplanation = '';
            if (data.stocksGrowth > 0 || data.bankGrowth > 0) {
                advancedExplanation = `
                    <div class="advanced-explanation" style="display: ${showAdvancedExplanations ? 'block' : 'none'}">
                        <p><strong>How Growth is Calculated:</strong></p>
                        <ul>
                            <li><strong>Stocks:</strong> ${formatCurrency(data.stocksGrowth)}
                                <br><small>${stocksRedeemFrequency} redemption with ${stocksCompoundingFrequency} compounding</small>
                            </li>
                            <li><strong>Bank:</strong> ${formatCurrency(data.bankGrowth)}
                                <br><small>${bankCompoundingType} interest with ${bankCompoundingFrequency} compounding, ${bankRedeemFrequency} redemption</small>
                            </li>
                        </ul>
                    </div>
                `;
            }
            
            row.innerHTML = `
                <td>${data.year}</td>
                <td>${formatCurrency(data.startingBalance)}</td>
                <td>${formatCurrency(data.monthlySavings)}</td>
                <td class="operation-cell">+</td>
                <td>
                    <div class="growth-cell">
                        <div class="growth-total" onclick="toggleGrowthBreakdown(event)">
                            ${formatCurrency(data.growth)}
                            <span class="toggle-breakdown">[Details]</span>
                        </div>
                        <div class="growth-breakdown">
                            <div class="stocks-growth">Stocks: ${formatCurrency(data.stocksGrowth)}</div>
                            <div class="bank-growth">Bank: ${formatCurrency(data.bankGrowth)}</div>
                            ${advancedExplanation}
                        </div>
                    </div>
                </td>
                <td class="operation-cell">=</td>
                <td>${formatCurrency(data.endingBalance)}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Update slider percentage display and background
function updateSliderPercentage(slider, percentageElement) {
    const value = slider.value;
    percentageElement.textContent = `${value}%`;
    
    // Update slider background
    slider.style.setProperty('--slider-percentage', `${value}%`);
}

// Initialize sliders with full range
function initializeSliders() {
    const stocksSlider = document.getElementById('stocks-percentage');
    const bankSlider = document.getElementById('bank-percentage');
    
    // First fix the HTML attributes directly to ensure proper min/max
    stocksSlider.setAttribute('min', '0');
    stocksSlider.setAttribute('max', '100');
    bankSlider.setAttribute('min', '0');
    bankSlider.setAttribute('max', '100');
    
    // Set initial values
    stocksSlider.value = 40;
    bankSlider.value = 60;
    
    // Add input event listeners with direct DOM updates
    stocksSlider.addEventListener('input', (e) => {
        // Parse as integer to avoid floating point issues
        const value = parseInt(e.target.value, 10);
        // Update the DOM directly
        bankSlider.value = 100 - value;
        // Ensure proper handling of zero values
        if (value === 0) {
            bankSlider.value = 100;
        } else if (value === 100) {
            bankSlider.value = 0;
        }
        updateInvestmentSliders();
    });
    
    bankSlider.addEventListener('input', (e) => {
        // Parse as integer to avoid floating point issues
        const value = parseInt(e.target.value, 10);
        // Update the DOM directly
        stocksSlider.value = 100 - value;
        // Ensure proper handling of zero values
        if (value === 0) {
            stocksSlider.value = 100;
        } else if (value === 100) {
            stocksSlider.value = 0;
        }
        updateInvestmentSliders();
    });
    
    // Force an update to set initial values
    updateInvestmentSliders();
}

// Track current chart view
let currentChartView = 'monthly';

// Event Listeners
netSalaryInput.addEventListener('input', () => {
    if (getCurrentRule() !== 'custom') {
        updateBudgetAmounts(getCurrentRule());
    } else {
        updateBudgetStatus();
        updateCharts();
        updateSummary();
        calculateProjection();
    }
});

[needsAmountInput, wantsAmountInput, savingsAmountInput].forEach(input => {
    input.addEventListener('input', () => {
        updateBudgetStatus();
        updateCharts();
        updateSummary();
        calculateProjection();
    });
});

stocksGrowthInput.addEventListener('input', () => {
    updateMathExplanation();
    calculateProjection();
});

bankGrowthInput.addEventListener('input', () => {
    updateMathExplanation();
    calculateProjection();
});

budgetRuleButtons.forEach(button => {
    button.addEventListener('click', () => {
        budgetRuleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        if (button.dataset.rule !== 'custom') {
            updateBudgetAmounts(button.dataset.rule);
        }
    });
});

projectionYearsSelect.addEventListener('change', calculateProjection);

investmentDetailsToggle.addEventListener('click', () => {
    const isExpanded = investmentDetailsToggle.getAttribute('aria-expanded') === 'true';
    investmentDetailsToggle.setAttribute('aria-expanded', !isExpanded);
    mathExplanation.classList.toggle('show');
    
    // If opening the math explanation, make sure to update it
    if (!isExpanded) {
        updateMathExplanation();
    }
});

// Initialize the calculator - Make sure the comma formatter doesn't break inputs
document.addEventListener('DOMContentLoaded', () => {
    // Force an initial calculation - this runs FIRST
    const initialSalary = 5000;
    netSalaryInput.value = initialSalary;
    
    // Explicitly set the budget values for the default rule (50-30-20)
    needsAmountInput.value = Math.round(initialSalary * 0.5);
    wantsAmountInput.value = Math.round(initialSalary * 0.3);
    savingsAmountInput.value = Math.round(initialSalary * 0.2);
    
    // Remove problematic comma formatter that's causing blank fields
    /*
    [netSalaryInput, needsAmountInput, wantsAmountInput, savingsAmountInput].forEach(input => {
        input.addEventListener('blur', function() {
            const value = this.value.replace(/,/g, '');
            if (!isNaN(value) && value.trim() !== '') {
                this.value = Number(value).toLocaleString('en-US');
            }
        });
        
        input.addEventListener('focus', function() {
            this.value = this.value.replace(/,/g, '');
        });
    });
    */
    
    // Initialize components AFTER the values are set
    initializeTooltips();
    initializeCharts();
    initializeSliders();
    
    // Set view and update all UI elements
    currentChartView = 'monthly';
    document.querySelectorAll('.chart-view-btn').forEach(btn => {
        if (btn.dataset.view === 'monthly') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update everything
    updateBudgetStatus();
    updateCharts();
    updateChartView('monthly');
    updateInvestmentChartView('monthly');
    calculateProjection();
    updateSummary(); // Make sure summary is updated
    
    // Initial math explanation
    updateMathExplanation();

    // Event listeners for investment options
    if (stocksCompoundingSelect) {
        stocksCompoundingSelect.addEventListener('change', function() {
            stocksCompoundingFrequency = this.value;
            updateMathExplanation();
            calculateProjection();
        });
    }
    
    if (bankCompoundingSelect) {
        bankCompoundingSelect.addEventListener('change', function() {
            bankCompoundingFrequency = this.value;
            updateMathExplanation();
            calculateProjection();
        });
    }
    
    // Add event listeners for other settings
    document.getElementById('stocks-redeem-frequency').addEventListener('change', function() {
        stocksRedeemFrequency = this.value;
        updateMathExplanation();
        calculateProjection();
    });
    
    document.getElementById('bank-interest-type').addEventListener('change', function() {
        bankCompoundingType = this.value;
        const bankCompoundingSelect = document.getElementById('bank-compounding');
        const bankCompoundingContainer = bankCompoundingSelect.closest('.growth-input');
        
        // Show/hide compounding options based on interest type
        if (bankCompoundingType === 'simple') {
            bankCompoundingContainer.style.display = 'none';
        } else {
            bankCompoundingContainer.style.display = 'flex';
        }
        
        updateMathExplanation();
        calculateProjection();
    });

    // Add toggle function to window so it can be accessed from HTML
    window.toggleGrowthBreakdown = toggleGrowthBreakdown;
    window.toggleAdvancedExplanations = toggleAdvancedExplanations;
    
    // Add event listeners for bank redeem frequency
    document.getElementById('bank-redeem-frequency').addEventListener('change', function() {
        bankRedeemFrequency = this.value;
        updateMathExplanation();
        calculateProjection();
    });

    // Initialize UI state based on current selection
    const bankInterestType = document.getElementById('bank-interest-type');
    if (bankInterestType && bankInterestType.value === 'simple') {
        const bankCompoundingSelect = document.getElementById('bank-compounding');
        if (bankCompoundingSelect) {
            const bankCompoundingContainer = bankCompoundingSelect.closest('.growth-input');
            if (bankCompoundingContainer) {
                bankCompoundingContainer.style.display = 'none';
            }
        }
    }

    // Update stock growth pattern when dropdown changes
    stocksGrowthPatternSelect.addEventListener('change', function() {
        stocksGrowthPattern = this.value;
        updateMathExplanation();
        calculateProjection();
    });
});

// Parse numbers from input fields considering commas
function parseInputValue(input) {
    return parseFloat(input.value.replace(/,/g, '')) || 0;
}

// Update investment sliders based on savings amount
function updateInvestmentSliders() {
    const savings = parseFloat(savingsAmountInput.value.replace(/,/g, '')) || 0;
    const stocksPercentage = parseInt(stocksPercentageInput.value, 10) || 0;
    const bankPercentage = 100 - stocksPercentage;
    
    // Ensure values are exact integers for display
    const stocksAmount = Math.round(savings * (stocksPercentage / 100));
    const bankAmount = Math.round(savings * (bankPercentage / 100));
    
    // Update display amounts in the Investment Strategy section
    document.querySelector('.stocks-amount').textContent = formatCurrency(stocksAmount);
    document.querySelector('.bank-amount').textContent = formatCurrency(bankAmount);
    document.querySelector('.stocks-percentage').textContent = `${stocksPercentage}%`;
    document.querySelector('.bank-percentage').textContent = `${bankPercentage}%`;
    
    // Always update math explanation when sliders change
    updateMathExplanation();
    
    // Update investment chart with current view
    updateInvestmentChartView(currentChartView);
    
    // Update the projection and summary
    calculateProjection();
    updateSummary();
}

// Update charts based on view
function updateChartView(view) {
    const monthly = {
        needs: parseFloat(needsAmountInput.value) || 0,
        wants: parseFloat(wantsAmountInput.value) || 0,
        savings: parseFloat(savingsAmountInput.value) || 0
    };
    
    let multiplier = 1;
    switch(view) {
        case 'yearly':
            multiplier = 12;
            break;
        case 'projection':
            const years = parseInt(projectionYearsSelect.value) || 3;
            multiplier = 12 * years;
            break;
    }
    
    budgetChart.data.datasets[0].data = [
        monthly.needs * multiplier,
        monthly.wants * multiplier,
        monthly.savings * multiplier
    ];
    
    // Update chart labels based on view
    budgetChart.data.labels = ['Needs', 'Wants', 'Savings'].map(label => {
        switch(view) {
            case 'yearly':
                return `${label} (Annual)`;
            case 'projection':
                return `${label} (${projectionYearsSelect.value}yr)`;
            default:
                return `${label} (Monthly)`;
        }
    });
    
    budgetChart.update();
}

// Update investment chart based on view
function updateInvestmentChartView(view) {
    const savings = parseFloat(savingsAmountInput.value) || 0;
    const stocksPercentage = parseFloat(stocksPercentageInput.value) || 40;
    const bankPercentage = 100 - stocksPercentage;
    const years = parseInt(projectionYearsSelect.value) || 3;
    
    let multiplier = 1;
    switch(view) {
        case 'yearly':
            multiplier = 12;
            break;
        case 'projection':
            multiplier = 12 * years;
            break;
    }
    
    const stocksAmount = savings * (stocksPercentage / 100) * multiplier;
    const bankAmount = savings * (bankPercentage / 100) * multiplier;
    
    investmentChart.data.datasets[0].data = [stocksPercentage, bankPercentage];
    investmentChart.options.plugins.tooltip.callbacks.label = function(context) {
        const amount = context.dataIndex === 0 ? stocksAmount : bankAmount;
        const percentage = context.raw;
        return `${context.label}: ${formatCurrency(amount)} (${percentage}%)`;
    };
    
    // Update chart labels based on view
    investmentChart.data.labels = ['Stocks', 'Savings Bank'].map(label => {
        switch(view) {
            case 'yearly':
                return `${label} (Annual)`;
            case 'projection':
                return `${label} (${years}yr)`;
            default:
                return `${label} (Monthly)`;
        }
    });
    
    investmentChart.update();
}

// Helper function to parse currency strings back to numbers
function parseCurrency(currencyString) {
    if (!currencyString) return 0;
    return parseFloat(currencyString.replace(/[$,]/g, '')) || 0;
} 