document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showLoginButton = document.getElementById("show-login");
    const showRegisterButton = document.getElementById("show-register");


    showLoginButton.addEventListener("click", function () {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    });

    showRegisterButton.addEventListener("click", function () {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });

    function displayErrors(containerId, errors) {
        const container = document.getElementById(containerId);
        container.innerHTML = errors.map(error => `<p>${error}</p>`).join('');
    }

    

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            const errors = [];

            if (!email || !password) {
                errors.push("Wszystkie pola muszą być wypełnione.");
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailPattern.test(email)) {
                errors.push("Podaj prawidłowy adres email.");
            }

            if (errors.length > 0) {
                displayErrors("login-errors", errors);
            } else {
                const formData = new FormData(loginForm);

                fetch("/_modules/login/log.php", {
                    method: "POST",
                    body: formData,
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.success) {
                            window.location.href = "http://localhost:3000";
                        } else {
                            displayErrors("login-errors", [data.message]);
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            }
        });
    }
});
