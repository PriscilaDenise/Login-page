document.addEventListener("DOMContentLoaded", function() {
    // Signup validation
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const fullName = document.getElementById("fullName").value;
            const email = document.getElementById("signupEmail").value;
            const phone = document.getElementById("phoneNumber").value;
            const password = document.getElementById("signupPassword").value;
            const confirmPassword = document.getElementById("confirmPassword").value;
            
            if (!email.includes("@")) {
                alert("Please enter a valid email.");
                return;
            }
            if (!phone.startsWith("07") || phone.length !== 10) {
                alert("Phone number must start with 07 and be 10 digits long.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            
            localStorage.setItem("user", JSON.stringify({ fullName, email, phone, password }));
            alert("Signup successful! Redirecting to login page.");
            window.location.href = "index.html";
        });
    }

    // Login validation
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value;
            const password = document.getElementById("loginPassword").value;
            const user = JSON.parse(localStorage.getItem("user"));
            
            if (user && user.email === email && user.password === password) {
                localStorage.setItem("loggedIn", "true");
                alert("Login successful!");
                window.location.href = "home.html";
            } else {
                alert("Invalid email or password.");
            }
        });
    }

    // Logout functionality
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
            localStorage.removeItem("loggedIn");
            alert("Logged out successfully!");
            window.location.href = "index.html";
        });
    }

    // Display user data on home page
    if (window.location.pathname.includes("home.html")) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            document.getElementById("userName").textContent = user.fullName;
            document.getElementById("profileName").textContent = user.fullName;
            document.getElementById("profileEmail").textContent = user.email;
            document.getElementById("profilePhone").textContent = user.phone;
        }
    }
});