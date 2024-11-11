document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showLoginButton = document.getElementById("show-login");
    const showRegisterButton = document.getElementById("show-register");

    showLoginButton.addEventListener("click", function() {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        showLoginButton.classList.add("active");
        showRegisterButton.classList.remove("active");
    });

    showRegisterButton.addEventListener("click", function() {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        showRegisterButton.classList.add("active");
        showLoginButton.classList.remove("active");
    });

    if (loginForm) {
        console.log("Formularz login-form został znaleziony:", loginForm);
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const formData = new FormData(loginForm); 

            fetch("/_modules/login/log.php", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = "http://localhost:3000";
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error("Error:", error));
        });
    } else {
        console.error("Nie znaleziono formularza login-form");
    }
});
