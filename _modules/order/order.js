document.addEventListener("DOMContentLoaded", function () {
    fetch("/_modules/login/log.php?action=checkSession")
        .then((response) => response.json())
        .then((data) => {
            if (!data.loggedIn) {
                
                const notification = document.getElementById("notification");
                notification.classList.remove("hidden");
                notification.classList.add("visible");

                
                setTimeout(() => {
                    notification.classList.remove("visible");
                    notification.classList.add("hidden");

                    
                    setTimeout(() => {
                        window.location.href = "/_modules/login/log.html";
                    }, 500); 
                }, 3000); 
            }
        })
        .catch((error) => {
            console.error("Wystąpił błąd podczas sprawdzania sesji:", error);
        });

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const summaryItemsContainer = document.getElementById("summary-items");
    const summaryTotalContainer = document.getElementById("summary-total");
    const deliveryForm = document.getElementById("delivery-form");
    const addressFields = document.getElementById("address-fields");

    
    function displayOrderSummary() {
        summaryItemsContainer.innerHTML = ""; 
        let total = 0;

        cart.forEach((item) => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("summary-item");
            itemElement.innerHTML = `<p>${item.name} (${item.type || 'Skonfigurowany'}) - ${item.price} zł</p>`;
            summaryItemsContainer.appendChild(itemElement);
            total += item.price; 
        });

        summaryTotalContainer.innerText = `${total.toFixed(2)} zł`; 
    }

    function showNotification(message, type = "info") {
        const notification = document.getElementById("order-notification");
        notification.textContent = message;
    
        
        notification.classList.remove("hidden");
        notification.classList.add("visible", type);
    
        
        setTimeout(() => {
            notification.classList.remove("visible");
            notification.classList.add("hidden");
    
            
            setTimeout(() => {
                notification.classList.remove(type);
            }, 500); 
        }, 3000);
    }
    

    
    deliveryForm.addEventListener("change", function () {
        const selectedDelivery = document.querySelector("input[name='delivery']:checked").value;
        if (selectedDelivery === "address") {
            addressFields.style.display = "block"; 
        } else {
            addressFields.style.display = "none"; 
        }
    });

    
    
deliveryForm.addEventListener("submit", function (event) {
    event.preventDefault(); 

    const selectedDelivery = document.querySelector("input[name='delivery']:checked").value;
    const street = selectedDelivery === "address" ? document.getElementById("street")?.value || null : null;
    const city = selectedDelivery === "address" ? document.getElementById("city")?.value || null : null;
    const zip = selectedDelivery === "address" ? document.getElementById("zip")?.value || null : null;
    const totalPrice = parseFloat(summaryTotalContainer.innerText.replace(" zł", ""));


    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

    
    const userName = sessionStorage.getItem("user_name") || null;
    const userLastName = sessionStorage.getItem("user_last_name") || null;

    
    const orderData = {
        delivery_type: selectedDelivery,
        street: street,
        city: city,
        zip: zip,
        total_price: totalPrice,
        user_name: userName, 
        user_last_name: userLastName,
        cart_items: cart.map((item) => ({
            name: item.name,
            type: item.type || 'configured', 
            ingredients: item.ingredients || '', 
            price: item.price,
        })),
    };

    
    fetch("/_modules/order/order.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                
                showNotification("Twoje zamówienie zostało zapisane!", "success");
            
                
                localStorage.removeItem("cart");
            
                
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000); 
            } else {
                
                showNotification(`Wystąpił problem: ${data.message}`, "error");
            }
        })
        .catch((error) => {
            console.error("Wystąpił błąd:", error);
            showNotification("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.", "error");
        });
});

    displayOrderSummary(); 
});
