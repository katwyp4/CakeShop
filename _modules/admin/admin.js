function showNotification(type, message) {
    const notifications = document.getElementById("notifications");
    const notification = document.createElement("div");

    notification.className = `notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        margin: 5px;
        padding: 10px 20px;
        border-radius: 5px;
        font-size: 14px;
        color: white;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
        opacity: 1;
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    `;

    notifications.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
    

function fetchCakes() {
    fetch('/_modules/admin/admin.php?action=getCakes')
        .then(response => response.json())
        .then(cakes => {
            const cakesTable = document.getElementById("cake-list");
            cakesTable.innerHTML = "";

            cakes.forEach(cake => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${cake.cake_id}</td>
                    <td>${cake.cake_name}</td>
                    <td>${cake.cake_description}</td>
                    <td>${cake.cake_price} zł</td>
                    <td><img src="${cake.cake_image}" alt="${cake.cake_name}" style="max-width: 100px;"></td>
                    <td><button onclick="deleteCake(${cake.cake_id})">Usuń</button></td>
                `;
                cakesTable.appendChild(row);
            });
        })
        .catch(error => console.error("Błąd przy pobieraniu tortów:", error));
}
    
    

    function deleteCake(cakeId) {
        console.log("Próba usunięcia tortu o ID:", cakeId);
    
        fetch('/_modules/admin/admin.php?action=deleteCake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cake_id: cakeId })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP status ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                console.log("Odpowiedź serwera:", result);
    
                if (result.status === 'success') {
                    showNotification("success", "Tort został usunięty.");
                    fetchCakes(); // Odśwież listę tortów
                } 
            })
            .catch(error => {

            });
    }

    function fetchIngredientsByType(type) {

        const tableBody = document.getElementById(`${type}-list`);
        if (!tableBody) {
            return;
        }
   
        fetch(`/_modules/admin/admin.php?action=getIngredientsByType&type=${type}`)
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    tableBody.innerHTML = "";
                    result.data.forEach(ingredient => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${ingredient.ingredient_name}</td>
                            <td>${ingredient.ingredient_price} zł</td>
                            <td><button onclick="deleteIngredient(${ingredient.ingredient_id}, '${type}')">Usuń</button></td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    console.error("Błąd serwera:", result.message);
                }
            })
            .catch();
    }

    function deleteIngredient(ingredientId, type) {
        fetch('/_modules/admin/admin.php?action=deleteIngredient', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredient_id: ingredientId })
        })
            .then(response => response.json())
            .then(result => {
                if (result.status === 'success') {
                    showNotification("success", "Składnik został usunięty.");
                    fetchIngredientsByType(type);
                }
            })
            .catch(error => console.error("Błąd przy usuwaniu składnika:", error));
    }
    
window.deleteCake = deleteCake;
window.deleteIngredient = deleteIngredient;


document.addEventListener("DOMContentLoaded", function () {
    fetchCakes();
    fetchIngredientsByType('rozmiar');
    fetchIngredientsByType('smak');
    fetchIngredientsByType('dodatek');
});




function deleteIngredient(ingredientId, type) {
    console.log(`Próba usunięcia składnika o ID: ${ingredientId}, Typ: ${type}`);

    fetch('/_modules/admin/admin.php?action=deleteIngredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient_id: ingredientId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.status === 'success') {
                showNotification("success", "Składnik został usunięty.");
                fetchIngredientsByType(type); // Odśwież listę składników
            } else {
                console.error("Błąd usuwania składnika:", result.message);
                showNotification("error", "Nie udało się usunąć składnika: " + result.message);
            }
        })
        .catch(error => {
            console.error("Błąd połączenia z serwerem:", error);
            showNotification("error", "Wystąpił błąd podczas komunikacji z serwerem.");
        });
}



    



window.deleteIngredient = deleteIngredient;
    
    // Wywołaj funkcję dla każdego typu składnika
    fetchIngredientsByType('rozmiar');
    fetchIngredientsByType('smak');
    fetchIngredientsByType('dodatek');
    


    
    
    

    document.getElementById("add-cake-form").addEventListener("submit", function (e) {
        e.preventDefault(); // Zapobiegaj przeładowaniu strony
        
        const name = document.getElementById("cake-name").value.trim();
        const description = document.getElementById("cake-description").value.trim();
        const price = parseFloat(document.getElementById("cake-price").value);
        const image = document.getElementById("cake-image").value.trim();
        
        if (name && description && !isNaN(price) && image) {
            fetch('/_modules/admin/admin.php?action=addCake', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, price, image })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.status === 'success') {
                        showNotification("success", result.message);
                        document.getElementById("add-cake-form").reset();
                        fetchCakes(); // Odśwież listę tortów
                    } else {
                        showNotification("error", result.message);
                    }
                })
                .catch(error => {
     
                });
        } else {
            showNotification("error", "Wypełnij wszystkie pola!");
        }
    });
    
    
    
    document.getElementById("add-ingredient-form").addEventListener("submit", function (e) {
        e.preventDefault();
        
        const name = document.getElementById("ingredient-name").value.trim();
        const type = document.getElementById("ingredient-type").value;
        const price = parseFloat(document.getElementById("ingredient-price").value);
        
        if (name && type && !isNaN(price)) {
            fetch('/_modules/admin/admin.php?action=addIngredient', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, price })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.status === 'success') {
                        showNotification("success", result.message);
                        document.getElementById("add-ingredient-form").reset();
                        fetchIngredientsByType(type); // Odśwież listę składników
                    } else {
                        showNotification("error", result.message);
                    }
                })
                .catch(error => {
                    console.error("Błąd przy dodawaniu składnika:", error);
                    showNotification("error", "Wystąpił błąd podczas komunikacji z serwerem.");
                });
        } else {
            showNotification("error", "Wypełnij wszystkie pola!");
        }
    });
    
    document.addEventListener("DOMContentLoaded", function () {
        // Funkcja do pobierania i wyświetlania użytkowników
        function fetchUsers() {
            fetch('/_modules/admin/admin.php?action=getUsers')
                .then(response => response.json())
                .then(users => {
                    const usersTable = document.getElementById("user-list");
                    usersTable.innerHTML = ""; // Wyczyść istniejące wiersze
    
                    users.forEach(user => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${user.client_id}</td>
                            <td>${user.name}</td>
                            <td>${user.last_name}</td>
                            <td>${user.email}</td>
                            <td>${user.is_admin ? "Tak" : "Nie"}</td>
                        `;
                        usersTable.appendChild(row);
                    });
                })
                .catch(error => console.error("Błąd przy pobieraniu użytkowników:", error));
        }

        function updateOrderStatus(orderId, status) {
            fetch('/_modules/admin/admin.php?action=updateOrderStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, status: status })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.status === 'success') {
                        showNotification("success", "Status zamówienia został zaktualizowany.");
                    } else {
                        showNotification("error", result.message);
                    }
                })
                .catch(error => {
                    console.error("Błąd przy aktualizacji statusu zamówienia:", error);
                    showNotification("error", "Wystąpił błąd przy aktualizacji statusu zamówienia.");
                });
        }
        
        // Expose to global scope
        window.updateOrderStatus = updateOrderStatus;
        

   
        function fetchOrders() {
            fetch('/_modules/admin/admin.php?action=getOrders')
                .then(response => response.json())
                .then(orders => {
                    const ordersTable = document.getElementById("order-list");
                    ordersTable.innerHTML = ""; // Wyczyść istniejące wiersze
        
                    orders.forEach(order => {
                        const row = document.createElement("tr");
                        row.innerHTML = `
                            <td>${order.order_id}</td>
                            <td>${order.user_name} ${order.user_last_name}</td>
                            <td>${order.total_price} zł</td>
                            <td>${order.order_date}</td>
                            <td>
                                <select onchange="updateOrderStatus(${order.order_id}, this.value)">
                                    <option value="nowe" ${order.status === 'nowe' ? 'selected' : ''}>Nowe</option>
                                    <option value="w trakcie" ${order.status === 'w trakcie' ? 'selected' : ''}>W trakcie</option>
                                    <option value="zakończone" ${order.status === 'zakończone' ? 'selected' : ''}>Zakończone</option>
                                </select>
                            </td>
                             <td>${order.street ? `${order.street}, ${order.city}, ${order.zip}` : "Brak adresu"}</td>
                            <td>
                                ${renderOrderItems(order.items)}
                            </td>
                        `;
                        ordersTable.appendChild(row);
                    });
                })
                .catch(error => console.error("Błąd przy pobieraniu zamówień:", error));
        }
        
        function renderOrderItems(items) {
            if (items.length === 0) {
                return 'Brak elementów zamówienia';
            }
        
            let readyCakes = items.filter(item => item.cake_type === 'ready');
            let configuredCakes = items.filter(item => item.cake_type === 'configured');
        
            let renderedReadyCakes = readyCakes.map((item, index) => `
                <div>
                    <strong>Tort ${index + 1} (Gotowy):</strong> ${item.cake_name}<br>
                    Cena: ${item.item_price !== null ? `${item.item_price} zł` : 'Brak ceny'}
                </div>
            `).join('<hr>');
        
            let renderedConfiguredCakes = groupConfiguredCakes(configuredCakes).map((cake, index) => `
                <div>
                    <strong>Tort ${index + 1} (Skonfigurowany):</strong><br>
                    Cena: ${cake.item_price !== null ? `${cake.item_price} zł` : 'Brak ceny'}<br>
                    Składniki: ${cake.ingredients.join(', ') || 'Brak'}
                </div>
            `).join('<hr>');
        
            return `
                ${renderedReadyCakes}
                ${renderedConfiguredCakes}
            `;
        }
        
        function groupConfiguredCakes(items) {
            const groupedCakes = [];
            let currentCake = { ingredients: [], item_price: 0 };
        
            items.forEach((item, index) => {
                // Dodaj składnik do tortu
                currentCake.ingredients.push(item.cake_name);
        
                // Sumuj cenę składnika
                currentCake.item_price += parseFloat(item.item_price || 0);
        
                // Jeśli mamy komplet 3 składników, dodajemy tort do grupy i zaczynamy nowy
                if ((index + 1) % 3 === 0) {
                    groupedCakes.push(currentCake);
                    currentCake = { ingredients: [], item_price: 0 };
                }
            });
        
            // Dodajemy ostatni tort, jeśli jest niedokończony (np. przy błędach w danych)
            if (currentCake.ingredients.length > 0) {
                groupedCakes.push(currentCake);
            }
        
            return groupedCakes;
        }
        
        
        
        

    // Wywołaj funkcje przy załadowaniu strony
    fetchUsers();
    fetchCakes();
    fetchIngredientsByType();
    fetchOrders();
});
