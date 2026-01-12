async function sendResetLink() {
    const email = document.getElementById('forgot-email').value;
    const btn = document.getElementById('send-reset-btn');

    if (!email) return alert("Please enter your email.");

    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const res = await fetch(`${API}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        alert(data.message);
        if (res.ok) toggleForgot(false);
    } catch (err) {
        alert("Failed to send reset link.");
    } finally {
        btn.innerText = "Send Reset Link";
        btn.disabled = false;
    }
}
