
// Reset password functionality
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const otp = document.getElementById("otp").value;
        const newPassword = document.getElementById("newPassword").value;

        // Send reset password request to backend
        fetch("/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, otp, newPassword })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Password reset successful!");
                window.location.href = "index.html";
            } else {
                alert("Failed to reset password. Please try again.");
            }
        })
        .catch(error => {
            alert("An error occurred. Please try again later.");
        });
    });
}

