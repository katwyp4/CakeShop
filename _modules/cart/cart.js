document.addEventListener("DOMContentLoaded", function () {
    const cart = JSON.parse(localStorage.getItem("cart")) || []; // Pobierz koszyk z localStorage

    const cartItemsContainer = document.getElementById("cart-items");
    const totalPriceContainer = document.getElementById("total-price");

    function displayCartItems() {
        cartItemsContainer.innerHTML = ""; // Wyczyść zawartość koszyka
        let total = 0;
        let currentCakeIndex = 1; // Licznik tortów
        let readyCakeIndex = 1; // Licznik gotowych tortów

        // Wyświetlanie skonfigurowanych tortów
        for (let i = 0; i < cart.length; i += 3) {
            const cakeItems = cart.slice(i, i + 3); // Pobierz trzy elementy jako jeden tort

            if (cakeItems[0]?.type !== "ready") {
                // Kontener dla skonfigurowanego tortu
                const cakeSection = document.createElement("div");
                cakeSection.classList.add("cake-section");
                cakeSection.style.border = "1px solid #ddd";
                cakeSection.style.marginBottom = "10px";
                cakeSection.style.padding = "10px";
                cakeSection.style.borderRadius = "8px";

                // Nagłówek tortu
                cakeSection.innerHTML = `<h3>Tort ${currentCakeIndex}</h3>`;

                // Lista składników tortu
                cakeItems.forEach((item) => {
                    const cartItem = document.createElement("div");
                    cartItem.classList.add("cart-item");
                    cartItem.innerHTML = `<p>${item.name} - ${item.price} zł</p>`;
                    cakeSection.appendChild(cartItem);
                    total += item.price; // Dodaj cenę do sumy
                });

                // Dodanie przycisku "Usuń tort"
                const removeCakeButton = document.createElement("button");
                removeCakeButton.textContent = "Usuń tort";
                removeCakeButton.style.backgroundColor = "red";
                removeCakeButton.style.color = "white";
                removeCakeButton.style.border = "none";
                removeCakeButton.style.padding = "5px 10px";
                removeCakeButton.style.borderRadius = "4px";
                removeCakeButton.style.cursor = "pointer";
                removeCakeButton.onclick = function () {
                    removeConfiguredCake(i); // Usuń tort
                };
                cakeSection.appendChild(removeCakeButton);

                cartItemsContainer.appendChild(cakeSection);
                currentCakeIndex++; // Zwiększ licznik skonfigurowanych tortów
            }
        }

        // Wyświetlanie gotowych tortów
        cart.forEach((cake) => {
            if (cake.type === "ready") {
                const readyCakeSection = document.createElement("div");
                readyCakeSection.classList.add("ready-cake-section");
                readyCakeSection.style.border = "1px solid #ddd";
                readyCakeSection.style.marginBottom = "10px";
                readyCakeSection.style.padding = "10px";
                readyCakeSection.style.borderRadius = "8px";

                readyCakeSection.innerHTML = `
                    <h3>Gotowy Tort ${readyCakeIndex}</h3>
                    <p>${cake.name} - ${cake.price.toFixed(2)} zł</p>
                    <p>${cake.description}</p>
                `;

                // Dodanie przycisku "Usuń tort"
                const removeReadyCakeButton = document.createElement("button");
                removeReadyCakeButton.textContent = "Usuń gotowy tort";
                removeReadyCakeButton.style.backgroundColor = "red";
                removeReadyCakeButton.style.color = "white";
                removeReadyCakeButton.style.border = "none";
                removeReadyCakeButton.style.padding = "5px 10px";
                removeReadyCakeButton.style.borderRadius = "4px";
                removeReadyCakeButton.style.cursor = "pointer";
                removeReadyCakeButton.onclick = function () {
                    removeReadyCake(cart.indexOf(cake)); // Usuń gotowy tort
                };
                readyCakeSection.appendChild(removeReadyCakeButton);

                cartItemsContainer.appendChild(readyCakeSection);
                readyCakeIndex++; // Zwiększ licznik gotowych tortów

                total += cake.price; // Dodaj cenę do sumy
            }
        });

        totalPriceContainer.innerText = `${total.toFixed(2)} zł`; // Aktualizacja łącznej ceny
    }

    // Funkcja do usuwania skonfigurowanego tortu
    function removeConfiguredCake(index) {
        cart.splice(index, 3); // Usuń 3 elementy (składniki tortu)
        localStorage.setItem("cart", JSON.stringify(cart)); // Zaktualizuj koszyk w localStorage
        displayCartItems(); // Odśwież widok koszyka
    }

    // Funkcja do usuwania gotowego tortu
    function removeReadyCake(index) {
        cart.splice(index, 1); // Usuń jeden gotowy tort
        localStorage.setItem("cart", JSON.stringify(cart)); // Zaktualizuj koszyk w localStorage
        displayCartItems(); // Odśwież widok koszyka
    }

    // Obsługa przycisku "Dodaj kolejny tort"
    const addNewCakeButton = document.getElementById("add-new-cake");
    if (addNewCakeButton) {
        addNewCakeButton.addEventListener("click", function () {
            window.location.href = "/#cake-configuration"; // Przekierowanie do sekcji konfiguracji tortów
        });
    }

    document.getElementById("checkout-button").addEventListener("click", function () {
        window.location.href = "/_modules/order/order.html"; // Przekierowanie do strony podsumowania zamówienia
    });

    displayCartItems(); // Wyświetl koszyk przy ładowaniu strony
});
