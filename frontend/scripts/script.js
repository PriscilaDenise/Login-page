




//login functionality for the frontend
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        console.log('Attempting login with:', { email }); // Log attempt

        fetch("http://localhost:3050/api/auth/login", { //fetch the login api from the backend
            method: "POST", //post request to the backend
            headers: {
                "Content-Type": "application/json", //set the content type to json
                "Accept": "application/json" //accept the json response
            },
            body: JSON.stringify({ email, password }) //send the email and password to the backend
        })
        .then(response => {
            console.log('Response status:', response.status); // Log response status
            return response.json(); //return the response as json
        })
        .then(data => {
            console.log('Response data:', data); // Log response data
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
                alert("Login successful!");
                window.location.href = "home.html";
            } else {
                alert(data.message || "Invalid email or password.");
            }
        })
        .catch(error => {
            console.error("Login error details:", error); // More detailed error logging
            alert(`Error: ${error.message}`);
        });
    });
}




//signup functionality for the frontend
const signupForm = document.getElementById("signupForm"); //get the signup form from the html
if (signupForm) {
    signupForm.addEventListener("submit", function(event) { //add an event listener to the signup form
        event.preventDefault();// prevent the default behavior of the form
        const name = document.getElementById("fullName").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!email.includes("@")) {
            alert("Please enter a valid email.");
            return;
        }
        if (password !== confirmPassword) {//check if the password and confirm password are the same
            alert("Passwords do not match.");
            return;
        }

        fetch("http://localhost:3050/api/auth/signup", { //fetch the signup api from the backend
            method: "POST", //post request to the backend
            headers: {
                "Content-Type": "application/json", //set the content type to json
                "Accept": "application/json" //accept the json response
            },
            body: JSON.stringify({ name, email, password }) //send the name, email and password to the backend
        })
        .then(response => { //then the response from the backend
            console.log('Response status:', response.status); //log the response status
            return response.json(); //return the response as json
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.token) {
                localStorage.setItem("token", data.token); //store the token in the local storage
                alert("Signup successful! Return to login page.");
                window.location.href = "index.html";
            } else {
                alert(data.message || "Signup failed."); //alert the user if the signup failed
            }
        })
        .catch(error => {
            console.error("Signup error:", error);
            alert("An error occurred. Please try again later.");
        });
    });
}




//logout functionality for the frontend
const logoutButton = document.getElementById("logout");
if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        localStorage.removeItem("token");
        alert("Logged out successfully!");
        window.location.href = "index.html";
    });
}





// display user data on home and profile pages
function displayUserData() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "index.html"; // Redirect if no user data
        return;
    }

    // Check which page we're on and display accordingly
    if (window.location.pathname.includes("home.html")) {
        document.getElementById("userName").textContent = user.name;
    } 
    else if (window.location.pathname.includes("profile.html")) {
        document.getElementById("userName").textContent = user.name;
        document.getElementById("userEmail").textContent = user.email;
    }
}

// Call this when the page loads
document.addEventListener("DOMContentLoaded", function() {
    // Check if we're on home or profile page
    if (window.location.pathname.includes("home.html") || 
        window.location.pathname.includes("profile.html")) {
        displayUserData();
    }
});







        
        
        
        
        
        
        











