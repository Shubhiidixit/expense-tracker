const apiBaseUrl = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

async function registerUser() {
    const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: '123456' })
    });
    const data = await response.json();
    console.log(data);
}
