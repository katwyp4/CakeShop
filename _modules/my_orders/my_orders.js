document.addEventListener("DOMContentLoaded", function () {
    const ordersContainer = document.getElementById("order-list");

    function fetchOrders() {
        fetch('/_modules/my_orders/my_orders.php')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.status === "success") {
                    renderOrders(data.data); 
                } else {
                    console.error(data.message);
                    ordersContainer.innerHTML = `<tr><td colspan="5">${data.message}</td></tr>`;
                }
            })
            .catch((error) => {
                console.error("Błąd przy pobieraniu zamówień:", error);
                ordersContainer.innerHTML = `<tr><td colspan="5">Błąd przy pobieraniu zamówień</td></tr>`;
            });
    }

    function renderOrders(orders) {
        if (orders.length === 0) {
            ordersContainer.innerHTML = `<tr><td colspan="5">Brak zamówień</td></tr>`;
            return;
        }

        
        const groupedOrders = {};
        orders.forEach((order) => {
            if (!groupedOrders[order.order_id]) {
                groupedOrders[order.order_id] = {
                    total_price: order.total_price,
                    order_date: order.order_date,
                    street: order.street,
                    city: order.city,
                    zip: order.zip,
                    status: order.status,
                    items: [],
                };
            }
            groupedOrders[order.order_id].items.push({
                cake_name: order.cake_name,
                cake_type: order.cake_type,
                ingredients: order.ingredients,
                item_price: parseFloat(order.item_price) || 0,
            });
        });

        
        ordersContainer.innerHTML = "";
        Object.values(groupedOrders).forEach((order) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.total_price} zł</td>
                <td>${order.order_date}</td>
                <td>${order.street ? `${order.street}, ${order.city}, ${order.zip}` : "Brak adresu"}</td>
                <td>${order.status}</td>
                <td>${renderOrderItems(order.items)}</td>
            `;
            ordersContainer.appendChild(row);
        });
    }

    function renderOrderItems(items) {
        if (!items || items.length === 0) {
            return "Brak elementów zamówienia";
        }

        const readyCakes = items.filter((item) => item.cake_type === "ready");
        const configuredCakes = items.filter((item) => item.cake_type === "configured");

        
        const readyCakesHtml = readyCakes
            .map(
                (item, index) => `
            <div>
                <strong>Tort ${index + 1} (Gotowy):</strong> ${item.cake_name}<br>
                Cena: ${item.item_price.toFixed(2)} zł
            </div>`
            )
            .join("<hr>");

        
        const groupedConfiguredCakes = groupConfiguredCakes(configuredCakes);

        
        const configuredCakesHtml = groupedConfiguredCakes
            .map(
                (cake, index) => `
            <div>
                <strong>Tort ${index + 1} (Skonfigurowany):</strong><br>
                Cena: ${cake.total_price.toFixed(2)} zł<br>
                Składniki: ${cake.ingredients.join(", ")}
            </div>`
            )
            .join("<hr>");

        return readyCakesHtml + configuredCakesHtml;
    }

    function groupConfiguredCakes(configuredCakes) {
        const groupedCakes = [];
        let currentCake = { ingredients: [], total_price: 0 };

        configuredCakes.forEach((item, index) => {
            currentCake.ingredients.push(item.cake_name); 
            currentCake.total_price += item.item_price; 

            
            if ((index + 1) % 3 === 0) {
                groupedCakes.push(currentCake);
                currentCake = { ingredients: [], total_price: 0 }; 
            }
        });

        
        if (currentCake.ingredients.length > 0) {
            groupedCakes.push(currentCake);
        }

        return groupedCakes;
    }

    
    fetchOrders();
});
