// script.js - основной скрипт для магазина
console.log('🛍️ PhotoPro Shop script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing shop...');
    
    setTimeout(initializeShop, 100);
});

function initializeShop() {
    if (typeof db === 'undefined') {
        console.error('❌ Database not found!');
        showError('База данных не загружена');
        return;
    }

    console.log('✅ Database connected successfully');
    
    updateAuthLink();
    updateCartCount();
    loadProducts();
    loadCart();
    setupEventListeners();
}

// Обновление ссылки авторизации
function updateAuthLink() {
    const authLink = document.getElementById('authLink');
    if (!authLink) {
        console.log('🔍 Auth link not found on this page');
        return;
    }

    try {
        const currentUser = db.getCurrentUser();
        
        if (currentUser) {
            authLink.textContent = 'Выйти (' + currentUser.name + ')';
            authLink.href = '#';
            authLink.onclick = function(e) {
                e.preventDefault();
                db.logout();
                window.location.reload();
            };
            console.log('👤 User is logged in:', currentUser.name);
        } else {
            authLink.textContent = 'Войти';
            authLink.href = 'auth.html';
            authLink.onclick = null;
            console.log('👤 User is not logged in');
        }
    } catch (error) {
        console.error('❌ Error in updateAuthLink:', error);
    }
}

// Обновление счётчика корзины
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    if (cartCountElements.length === 0) {
        console.log('🔍 Cart count elements not found');
        return;
    }

    try {
        const cart = db.getCart();
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalCount;
        });
        
        console.log('🛒 Cart count updated:', totalCount);
    } catch (error) {
        console.error('❌ Error updating cart count:', error);
    }
}

// Загрузка товаров
function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.log('🔍 Products grid not found on this page');
        return;
    }

    try {
        const products = db.getProducts();
        console.log('📦 Rendering products:', products.length);

        if (products.length === 0) {
            productsGrid.innerHTML = '<p class="empty-message">Товары не найдены</p>';
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+0J3QtdGCINC90LAg0L/RgNC+0YTQtdGB0YHQuNC+0L3QsNC70Yw8L3RleHQ+PC9zdmc+'">
                <h3>${product.name}</h3>
                <p class="brand">${product.brand}</p>
                <div class="rating">
                    ${generateStarRating(product.rating)}
                    <span class="rating-value">${product.rating}</span>
                </div>
                <p class="price">${formatPrice(product.price)} ₽</p>
                <p class="description">${product.description}</p>
                <button onclick="addToCart(${product.id})">В корзину</button>
            </div>
        `).join('');

        console.log('✅ Products rendered successfully');

    } catch (error) {
        console.error('❌ Error loading products:', error);
        productsGrid.innerHTML = '<p class="error-message">Ошибка загрузки товаров</p>';
    }
}

// Загрузка корзины
function loadCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItems || !cartSummary) {
        console.log('🔍 Cart elements not found on this page');
        return;
    }

    try {
        const cart = db.getCart();
        const products = db.getProducts();
        
        console.log('🛒 Loading cart items:', cart.length);
        
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <h3>😔 Корзина пуста</h3>
                    <p>Добавьте товары из каталога</p>
                    <button onclick="location.href='catalog.html'" class="cta-button">
                        Перейти в каталог
                    </button>
                </div>
            `;
            cartSummary.innerHTML = '';
            return;
        }

        // Товары в корзине
        cartItems.innerHTML = cart.map(cartItem => {
            const product = products.find(p => p.id === cartItem.productId);
            if (!product) return '';
            
            return `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="cart-item-info">
                        <h3>${product.name}</h3>
                        <p class="brand">${product.brand}</p>
                        <p class="price">${formatPrice(product.price)} ₽</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateCartQuantity(${product.id}, ${cartItem.quantity - 1})">-</button>
                            <span>${cartItem.quantity} шт.</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${product.id}, ${cartItem.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${product.id})">🗑️ Удалить</button>
                </div>
            `;
        }).join('');

        // Итоговая сумма
        const total = db.getCartTotal();
        cartSummary.innerHTML = `
            <div class="summary-row">
                <span>Товары (${cart.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
                <span>${formatPrice(total)} ₽</span>
            </div>
            <div class="summary-row">
                <span>Доставка</span>
                <span>Бесплатно</span>
            </div>
            <div class="summary-row total">
                <span>Итого</span>
                <span>${formatPrice(total)} ₽</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">✅ Оформить заказ</button>
        `;

        console.log('✅ Cart loaded successfully');

    } catch (error) {
        console.error('❌ Error loading cart:', error);
    }
}

// Функции для работы с корзиной
function addToCart(productId) {
    try {
        db.addToCart(productId, 1);
        updateCartCount();
        showNotification('✅ Товар добавлен в корзину!');
    } catch (error) {
        console.error('❌ Error adding to cart:', error);
        showNotification('❌ Ошибка при добавлении в корзину');
    }
}

function removeFromCart(productId) {
    try {
        db.removeFromCart(productId);
        updateCartCount();
        loadCart();
        showNotification('🗑️ Товар удален из корзины');
    } catch (error) {
        console.error('❌ Error removing from cart:', error);
    }
}

function updateCartQuantity(productId, quantity) {
    try {
        db.updateCartQuantity(productId, quantity);
        updateCartCount();
        loadCart();
    } catch (error) {
        console.error('❌ Error updating cart quantity:', error);
    }
}

function checkout() {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        showNotification('🔐 Пожалуйста, войдите в систему для оформления заказа');
        window.location.href = 'auth.html';
        return;
    }

    try {
        const cart = db.getCart();
        if (cart.length === 0) {
            showNotification('🛒 Корзина пуста');
            return;
        }

        const orderData = {
            userId: currentUser.id,
            items: [...cart],
            total: db.getCartTotal(),
            shippingAddress: 'Не указан'
        };

        const order = db.createOrder(orderData);
        db.clearCart();
        
        updateCartCount();
        loadCart();
        
        showNotification(`🎉 Заказ №${order.id} успешно оформлен! Сумма: ${formatPrice(order.total)} ₽`);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error('❌ Error during checkout:', error);
        showNotification('❌ Ошибка при оформлении заказа');
    }
}

// Вспомогательные функции
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '⭐';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '✨';
        } else {
            stars += '☆';
        }
    }
    
    return stars;
}

function showNotification(message) {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: bold;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    console.error('💥 App Error:', message);
}

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    // Фильтры будут добавлены позже
}

// Глобальные функции для использования в HTML
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.checkout = checkout;