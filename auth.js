// auth.js для интернет-магазина
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js loaded successfully!');
    
    // Проверяем что база данных загрузилась
    if (typeof db === 'undefined') {
        console.error('Database not loaded!');
        showMessage('Ошибка загрузки базы данных', 'error');
        return;
    }
    
    // Настройка обработчиков форм
    setupForms();
    
    // Проверка авторизации
    checkAuth();
});

// Настройка обработчиков форм
function setupForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            handleLogin();
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            handleRegister();
        });
    }
}

// Обработка входа
function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    console.log('Login attempt with email:', email);
    
    if (!email || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    try {
        const user = db.loginUser(email, password);
        db.setCurrentUser(user);
        showMessage('✅ Вход успешен! Перенаправляем...', 'success');
        
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('Login error:', error);
        showMessage('❌ ' + error.message, 'error');
    }
}

// Обработка регистрации
function handleRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    console.log('Register attempt with name:', name, 'email:', email);
    
    if (!name || !email || !password) {
        showMessage('Заполните все поля', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Пароль должен быть не менее 6 символов', 'error');
        return;
    }
    
    // Простая валидация email
    if (!isValidEmail(email)) {
        showMessage('Введите корректный email адрес', 'error');
        return;
    }
    
    try {
        const userData = { 
            name: name, 
            email: email, 
            password: password 
        };
        
        const user = db.registerUser(userData);
        showMessage('✅ Регистрация успешна! Теперь войдите в аккаунт.', 'success');
        
        // Очищаем форму и переключаем на вход
        document.getElementById('registerForm').reset();
        setTimeout(function() {
            switchToTab('login');
        }, 2000);
    } catch (error) {
        console.error('Register error:', error);
        showMessage('❌ ' + error.message, 'error');
    }
}

// Валидация email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Показать сообщение
function showMessage(text, type) {
    const messageDiv = document.getElementById('authMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        
        setTimeout(function() {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }
}

// Проверка авторизации
function checkAuth() {
    const currentUser = db.getCurrentUser();
    if (currentUser) {
        showMessage(`Вы уже вошли как ${currentUser.name}`, 'success');
        // Можно автоматически переключить на страницу профиля
    }
}

// Функция для переключения табов (для использования из HTML)
function switchToTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    // Убираем активные классы
    tabButtons.forEach(btn => btn.classList.remove('active'));
    forms.forEach(form => form.classList.remove('active'));
    
    // Добавляем активные классы
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName + 'Form').classList.add('active');
    
    // Очищаем сообщения
    document.getElementById('authMessage').textContent = '';
}

// Добавляем функцию обновления счётчика корзины
function updateCartCount() {
    try {
        const cart = db.getCart();
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = totalCount;
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Переключение табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchToTab(tabName);
        });
    });
    
    // Обновляем счётчик корзины если есть на странице
    updateCartCount();
});