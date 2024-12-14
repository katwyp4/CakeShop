$(document).ready(function(){
    $(".owl-carousel").owlCarousel({
        items: 1,                
        loop: true,             
        autoplay: true,           
        autoplayTimeout: 3000,    
        autoplayHoverPause: true, 
        animateOut: 'fadeOut',    
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Pobierz koszyk z localStorage lub utwórz nowy, jeśli go nie ma
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCartCount();

    const steps = ["rozmiar", "smak", "dodatek"];
    let currentStepIndex = 0;

    // Funkcja pokazująca aktualny krok
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            const stepElement = document.getElementById(`step-${step}`);
            stepElement.style.display = index === stepIndex ? "block" : "none";
        });
    }

    // Funkcja dodająca produkt do koszyka
    function addToCart(itemName, itemPrice) {
        const item = { name: itemName, price: parseFloat(itemPrice) };
        cart.push(item);
        saveCart(); // Zapisz koszyk w localStorage
        updateCartCount(); // Zaktualizuj liczbę elementów w koszyku
        showCustomAlert(`${itemName} dodano do koszyka!`);
    }

    // Funkcja do zapisywania koszyka w localStorage
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Funkcja do aktualizacji liczby elementów w koszyku
    function updateCartCount() {
        const cartCount = document.getElementById("cart-count");
        cartCount.innerText = cart.length;
    }

    // Funkcja wyświetlająca niestandardowy alert
    function showCustomAlert(message) {
        const alertBox = document.createElement("div");
        alertBox.classList.add("alert");
        alertBox.innerText = message;
        document.body.appendChild(alertBox);

        // Wyświetlanie alertu przez 2 sekundy
        alertBox.style.display = "block";
        setTimeout(() => {
            alertBox.style.display = "none";
            document.body.removeChild(alertBox);
        }, 2000);
    }

    // Obsługa kliknięć przycisków "Dodaj do koszyka"
    document.body.addEventListener("click", function (event) {
        if (event.target.classList.contains("add-to-cart")) {
            const itemName = event.target.parentElement.querySelector("h3").innerText;
            const itemPrice = event.target.parentElement.querySelector("p").innerText.replace(" zł", "");
            const currentStep = steps[currentStepIndex];
            const step = event.target.getAttribute("data-step");

            if (step === currentStep) {
                addToCart(itemName, itemPrice); // Dodaj do koszyka

                // Przejdź do następnego kroku, jeśli istnieje
                if (currentStep === "dodatek") {
                    window.location.href = "/_modules/cart/cart.html";
                } else if (currentStepIndex < steps.length - 1) {
                    // Przejdź do następnego kroku, jeśli istnieje
                    currentStepIndex++;
                    showStep(currentStepIndex);
                }
            }
        }
    });

    // Pokaż pierwszy krok na start
    showStep(currentStepIndex);
});

document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-featured-cake")) {
        // Pobierz dane z atrybutów przycisku
        const name = event.target.getAttribute("data-name");
        const price = parseFloat(event.target.getAttribute("data-price"));
        const description = event.target.getAttribute("data-description");

        // Utwórz obiekt gotowego tortu
        const readyCake = {
            type: "ready", // Typ gotowy
            name: name,
            price: price,
            description: description
        };

        // Pobierz koszyk z localStorage lub utwórz nowy
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push(readyCake); // Dodaj gotowy tort do koszyka
        localStorage.setItem("cart", JSON.stringify(cart)); // Zapisz koszyk w localStorage

        // Wyświetl powiadomienie
        showCustomAlert(`${name} dodano do koszyka!`);
        updateCartCount(); // Zaktualizuj licznik koszyka
    }
});


