const API_BASE_URL = "https://9b1g04smse.execute-api.us-east-1.amazonaws.com/dev";

// Registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Registration failed');
        
        alert('Registration Successful! Please login.');
    } catch (error) {
        alert(error.message);
    }
});

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert('Login Successful! Redirecting...');
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert(error.message);
    }
});

// Fetch and display expense data on dashboard page
async function fetchExpenses() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login first');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch expenses');

        const data = await response.json();
        displayChart(data);
    } catch (error) {
        alert(error.message);
    }
}

function displayChart(expenses) {
    const categories = expenses.map(exp => exp.category);
    const amounts = expenses.map(exp => exp.amount);

    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: ['red', 'blue', 'green', 'yellow', 'purple']
            }]
        }
    });
}

if (window.location.pathname.includes('dashboard.html')) {
    fetchExpenses();
}
