// ============ Authentication Check ============
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'login.html' && currentPage !== 'register.html') {
        if (!sessionStorage.getItem('loggedIn')) {
            window.location.href = 'login.html';
        }
    }
    if ((currentPage === 'login.html' || currentPage === 'register.html') && sessionStorage.getItem('loggedIn')) {
        window.location.href = 'index.html';
    }
}

checkAuth();

// ============ User Database ============
function getUsers() {
    return JSON.parse(localStorage.getItem('chandrikaUsers')) || [];
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('chandrikaUsers', JSON.stringify(users));
}

function findUser(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// ============ Cart Functions ============
function getCart() {
    return JSON.parse(localStorage.getItem('chandrikaCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('chandrikaCart', JSON.stringify(cart));
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
    showCartNotification(product);
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    renderCart();
}

function updateQuantity(productId, delta) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        saveCart(cart);
        updateCartCount();
        renderCart();
    }
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => el.textContent = totalItems);
}

// ============ Cart Notification Popup ============
function showCartNotification(product) {
    // Remove any existing notification
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <button class="notify-close" onclick="this.parentElement.remove()">×</button>
        <div class="notify-icon"><i class="fas fa-check"></i></div>
        <div class="notify-content">
            <h4>Added to Cart! ✅</h4>
            <p><strong>${product.name}</strong> - ${formatINR(product.price)}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }
    }, 3000);
}

// ============ Toast Notification ============
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + (isError ? 'error-toast' : '');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============ Registration Form Validation ============
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    const fullName = document.getElementById('fullName');
    const regEmail = document.getElementById('regEmail');
    const phone = document.getElementById('phone');
    const regPassword = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const nameError = document.getElementById('nameError');
    const regEmailError = document.getElementById('regEmailError');
    const phoneError = document.getElementById('phoneError');
    const regPasswordError = document.getElementById('regPasswordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const registerStatus = document.getElementById('registerStatus');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const toggleRegPassword = document.getElementById('toggleRegPassword');

    // Toggle password visibility
    toggleRegPassword?.addEventListener('click', () => {
        const type = regPassword.type === 'password' ? 'text' : 'password';
        regPassword.type = type;
        const icon = toggleRegPassword.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    // Name validation
    fullName?.addEventListener('input', () => {
        const name = fullName.value.trim();
        if (name.length < 3) {
            nameError.textContent = 'Name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            nameError.textContent = 'Name can only contain letters and spaces';
        } else {
            nameError.textContent = '';
        }
    });

    // Email validation
    regEmail?.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regEmail.value)) {
            regEmailError.textContent = 'Please enter a valid email address';
        } else if (findUser(regEmail.value)) {
            regEmailError.textContent = 'This email is already registered';
        } else {
            regEmailError.textContent = '';
        }
    });

    // Phone validation
    phone?.addEventListener('input', () => {
        const phoneValue = phone.value.replace(/\D/g, '');
        phone.value = phoneValue.slice(0, 10);
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneValue)) {
            phoneError.textContent = 'Enter a valid 10-digit Indian phone number';
        } else {
            phoneError.textContent = '';
        }
    });

    // Password strength
    regPassword?.addEventListener('input', () => {
        const password = regPassword.value;
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        strengthBar.className = 'strength-bar';
        if (strength <= 1) {
            strengthBar.classList.add('weak');
            strengthText.textContent = 'Weak password';
        } else if (strength === 2) {
            strengthBar.classList.add('medium');
            strengthText.textContent = 'Medium password';
        } else if (strength === 3 || strength === 4) {
            strengthBar.classList.add('strong');
            strengthText.textContent = 'Strong password';
        } else {
            strengthBar.classList.add('very-strong');
            strengthText.textContent = 'Very strong password';
        }

        if (password.length < 6) {
            regPasswordError.textContent = 'Password must be at least 6 characters';
        } else {
            regPasswordError.textContent = '';
        }
    });

    // Confirm password
    confirmPassword?.addEventListener('input', () => {
        if (confirmPassword.value !== regPassword.value) {
            confirmPasswordError.textContent = 'Passwords do not match';
        } else {
            confirmPasswordError.textContent = '';
        }
    });

    // Form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
        registerStatus.className = 'register-status';
        registerStatus.style.display = 'none';

        const name = fullName.value.trim();
        if (name.length < 3 || !/^[a-zA-Z\s]+$/.test(name)) {
            nameError.textContent = name.length < 3 ? 'Name must be at least 3 characters' : 'Name can only contain letters and spaces';
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(regEmail.value)) {
            regEmailError.textContent = 'Please enter a valid email address';
            valid = false;
        } else if (findUser(regEmail.value)) {
            regEmailError.textContent = 'This email is already registered';
            valid = false;
        }

        const phoneValue = phone.value.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(phoneValue)) {
            phoneError.textContent = 'Enter a valid 10-digit Indian phone number';
            valid = false;
        }

        if (regPassword.value.length < 6) {
            regPasswordError.textContent = 'Password must be at least 6 characters';
            valid = false;
        }

        if (confirmPassword.value !== regPassword.value) {
            confirmPasswordError.textContent = 'Passwords do not match';
            valid = false;
        }

        if (valid) {
            const newUser = {
                fullName: name,
                email: regEmail.value.toLowerCase(),
                phone: phoneValue,
                password: regPassword.value,
                createdAt: new Date().toISOString()
            };
            saveUser(newUser);
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('userEmail', newUser.email);
            sessionStorage.setItem('userName', newUser.fullName);
            window.location.href = 'index.html';
        }
    });
}

// ============ Login Form Validation ============
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginStatus = document.getElementById('loginStatus');
    const togglePassword = document.getElementById('togglePassword');

    togglePassword?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        const icon = togglePassword.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });

    emailInput?.addEventListener('input', () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        emailError.textContent = emailRegex.test(emailInput.value) ? '' : 'Please enter a valid email';
    });

    passwordInput?.addEventListener('input', () => {
        passwordError.textContent = passwordInput.value.length >= 6 ? '' : 'Password must be at least 6 characters';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;
        loginStatus.className = 'login-status';
        loginStatus.style.display = 'none';

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            emailError.textContent = 'Please enter a valid email';
            valid = false;
        }

        if (passwordInput.value.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters';
            valid = false;
        }

        if (valid) {
            const user = findUser(emailInput.value);
            if (user && user.password === passwordInput.value) {
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('userEmail', user.email);
                sessionStorage.setItem('userName', user.fullName);
                window.location.href = 'index.html';
            } else {
                loginStatus.className = 'login-status error';
                loginStatus.textContent = '❌ Invalid email or password. Please try again.';
                loginStatus.style.display = 'block';
            }
        }
    });
}

// ============ Logout ============
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

// ============ Dark Mode ============
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

// ============ Mobile Menu ============
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('active'));
}

// ============ 40 Products Data ============
const products = [
    // Electronics (10)
    { id: 1, name: "Wireless Bluetooth Earphones", category: "electronics", price: 2499, rating: 4.5, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop" },
    { id: 2, name: "Smart Watch Fitness Band", category: "electronics", price: 3999, rating: 4.6, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop" },
    { id: 3, name: "Wireless Mouse", category: "electronics", price: 999, rating: 4.4, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop" },
    { id: 4, name: "Bluetooth Speaker", category: "electronics", price: 3499, rating: 4.7, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=300&fit=crop" },
    { id: 5, name: "USB-C Hub Adapter", category: "electronics", price: 1899, rating: 4.1, image: "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400&h=300&fit=crop" },
    { id: 6, name: "Noise Cancelling Headphones", category: "electronics", price: 5999, rating: 4.8, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop" },
    { id: 7, name: "Portable Charger Power Bank", category: "electronics", price: 1499, rating: 4.3, image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop" },
    { id: 8, name: "Wireless Keyboard", category: "electronics", price: 2199, rating: 4.2, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop" },
    { id: 9, name: "Tablet Stand Holder", category: "electronics", price: 799, rating: 4.0, image: "https://images.pexels.com/photos/10359917/pexels-photo-10359917.jpeg" },
    { id: 10, name: "Webcam HD 1080p", category: "electronics", price: 2799, rating: 4.5, image: "https://images.pexels.com/photos/7172701/pexels-photo-7172701.jpeg" },

    // Clothing (10)
    { id: 11, name: "Men's Classic Fit T-Shirt", category: "clothing", price: 899, rating: 4.2, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop" },
    { id: 12, name: "Women's Cotton Kurti", category: "clothing", price: 1499, rating: 4.3, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop" },
    { id: 13, name: "Denim Jacket", category: "clothing", price: 2999, rating: 4.5, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop" },
    { id: 14, name: "Hooded Sweatshirt", category: "clothing", price: 1799, rating: 4.4, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop" },
    { id: 15, name: "Formal Shirt", category: "clothing", price: 1299, rating: 4.3, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop" },
    { id: 16, name: "Women's Summer Dress", category: "clothing", price: 2199, rating: 4.6, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=300&fit=crop" },
    { id: 17, name: "Men's Jogger Pants", category: "clothing", price: 1599, rating: 4.1, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=300&fit=crop" },
    { id: 18, name: "Silk Saree", category: "clothing", price: 4999, rating: 4.8, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=300&fit=crop" },
    { id: 19, name: "Leather Belt", category: "clothing", price: 699, rating: 4.0, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop" },
    { id: 20, name: "Winter Jacket Padded", category: "clothing", price: 3499, rating: 4.5, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop" },

    // Home & Living (10)
    { id: 21, name: "Stainless Steel Water Bottle", category: "home", price: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop" },
    { id: 22, name: "Non-Stick Cookware Set", category: "home", price: 5499, rating: 4.5, image: "https://images.pexels.com/photos/17727996/pexels-photo-17727996.jpeg" },
    { id: 23, name: "LED Desk Lamp", category: "home", price: 1499, rating: 4.3, image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop" },
    { id: 24, name: "Coffee Maker Machine", category: "home", price: 4599, rating: 4.2, image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=300&fit=crop" },
    { id: 25, name: "Decorative Wall Clock", category: "home", price: 899, rating: 4.0, image: "https://images.unsplash.com/photo-1507646227500-4d389b0012be?w=400&h=300&fit=crop" },
    { id: 26, name: "Scented Candle Set", category: "home", price: 599, rating: 4.4, image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=300&fit=crop" },
    { id: 27, name: "Cotton Bedsheet Set", category: "home", price: 1299, rating: 4.6, image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop" },
    { id: 28, name: "Kitchen Knife Set", category: "home", price: 2199, rating: 4.3, image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&h=300&fit=crop" },
    { id: 29, name: "Indoor Plant Pot", category: "home", price: 449, rating: 4.1, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop" },
    { id: 30, name: "Towel Set Premium", category: "home", price: 999, rating: 4.5, image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400&h=300&fit=crop" },

    // Accessories (10)
    { id: 31, name: "Leather Wallet for Men", category: "accessories", price: 1299, rating: 4.4, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=300&fit=crop" },
    { id: 32, name: "Polarized Sunglasses", category: "accessories", price: 1999, rating: 4.1, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop" },
    { id: 33, name: "Leather Laptop Bag", category: "accessories", price: 3499, rating: 4.6, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop" },
    { id: 34, name: "Analog Wrist Watch", category: "accessories", price: 2499, rating: 4.8, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=300&fit=crop" },
    { id: 35, name: "Canvas Backpack", category: "accessories", price: 2199, rating: 4.5, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop" },
    { id: 36, name: "Fashion Gold Chain", category: "accessories", price: 899, rating: 4.2, image: "https://images.pexels.com/photos/8706570/pexels-photo-8706570.jpeg" },
    { id: 37, name: "Silk Scarf", category: "accessories", price: 599, rating: 4.0, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=300&fit=crop" },
    { id: 38, name: "Travel Duffle Bag", category: "accessories", price: 2799, rating: 4.4, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop" },
    { id: 39, name: "Elegant Bracelet", category: "accessories", price: 799, rating: 4.3, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=300&fit=crop" },
    { id: 40, name: "Phone Case Cover", category: "accessories", price: 399, rating: 4.1, image: "https://images.unsplash.com/photo-1541877944-ac82a091518a?w=400&h=300&fit=crop" }
];
// ============ Product Detail Modal ============
let modalCurrentProduct = null;
let modalQuantity = 1;

// Product specifications data
const productSpecs = {
    // Electronics
    1: { specs: [['Brand', 'SoundWave'], ['Battery Life', '8 hours'], ['Connectivity', 'Bluetooth 5.0'], ['Driver Size', '10mm'], ['Waterproof', 'IPX5'], ['Color', 'Black']], description: 'Premium wireless Bluetooth earphones with deep bass, crystal clear sound, and comfortable ear tips. Perfect for workouts, travel, and daily use.' },
    2: { specs: [['Brand', 'FitPro'], ['Battery', '7 days'], ['Display', '1.4" AMOLED'], ['Sensors', 'Heart Rate, SpO2'], ['Waterproof', 'IP68'], ['Compatibility', 'iOS & Android']], description: 'Advanced fitness smartwatch with multiple sports modes, sleep tracking, and smartphone notifications.' },
    3: { specs: [['Brand', 'TechGear'], ['DPI', '1600'], ['Connectivity', 'Wireless 2.4GHz'], ['Battery', '12 months'], ['Buttons', '6'], ['Ergonomic', 'Yes']], description: 'Smooth wireless mouse with ergonomic design for comfortable long-hour usage.' },
    4: { specs: [['Brand', 'BassBoom'], ['Power', '20W'], ['Battery', '10 hours'], ['Waterproof', 'IPX7'], ['Driver', 'Dual 45mm'], ['Bluetooth', '5.3']], description: 'Portable Bluetooth speaker with 360° immersive sound, perfect for outdoor parties.' },
    5: { specs: [['Ports', '4 USB-A, 1 HDMI, SD card'], ['Material', 'Aluminum'], ['Speed', 'USB 3.0'], ['Compatibility', 'Windows/Mac'], ['Cable', 'Built-in']], description: 'Compact USB-C hub adapter for all connectivity needs.' },
    6: { specs: [['Brand', 'SilentSound'], ['ANC', 'Active'], ['Battery', '30 hours'], ['Driver', '40mm'], ['Bluetooth', '5.2'], ['Foldable', 'Yes']], description: 'Premium noise cancelling headphones with studio-quality sound.' },
    7: { specs: [['Capacity', '20000mAh'], ['Ports', '2 USB, 1 Type-C'], ['Fast Charge', '18W'], ['LED Indicator', 'Yes'], ['Weight', '380g']], description: 'High-capacity portable charger for all your devices.' },
    8: { specs: [['Brand', 'KeyPro'], ['Layout', 'QWERTY'], ['Connectivity', 'Bluetooth'], ['Battery', '6 months'], ['Compatible', 'Multi-device'], ['Slim', 'Yes']], description: 'Ultra-slim wireless keyboard for comfortable typing anywhere.' },
    9: { specs: [['Material', 'Aluminum'], ['Adjustable', 'Yes'], ['Foldable', 'Yes'], ['Compatible', 'All tablets'], ['Color', 'Silver'], ['Weight', '250g']], description: 'Sturdy tablet stand holder with adjustable angles for comfortable viewing.' },
    10: { specs: [['Resolution', '1080p Full HD'], ['Microphone', 'Built-in'], ['Autofocus', 'Yes'], ['Plug & Play', 'Yes'], ['Lens', 'Wide angle']], description: 'HD webcam for crystal clear video calls and streaming.' },

    // Clothing
    11: { specs: [['Fabric', '100% Cotton'], ['Fit', 'Regular'], ['Sizes', 'S-XXL'], ['Collar', 'Round Neck'], ['Wash', 'Machine Wash'], ['Country', 'India']], description: 'Soft and breathable cotton t-shirt for everyday comfort.' },
    12: { specs: [['Fabric', 'Cotton Blend'], ['Length', 'Calf Length'], ['Sizes', 'M-XL'], ['Occasion', 'Casual/Festive'], ['Wash', 'Hand Wash'], ['Color', 'Multiple']], description: 'Elegant cotton kurti with beautiful embroidery work.' },
    13: { specs: [['Material', 'Denim'], ['Fit', 'Regular'], ['Sizes', 'S-XXL'], ['Closure', 'Button'], ['Pockets', '4'], ['Season', 'Winter']], description: 'Classic denim jacket that never goes out of style.' },
    14: { specs: [['Material', 'Fleece'], ['Hood', 'Adjustable'], ['Sizes', 'S-XXL'], ['Pockets', 'Kangaroo'], ['Warmth', 'Medium'], ['Print', 'Solid']], description: 'Cozy fleece hoodie perfect for casual outings and lounging.' },
    15: { specs: [['Fabric', 'Cotton Blend'], ['Fit', 'Slim'], ['Sizes', '38-44'], ['Collar', 'Spread'], ['Occasion', 'Office/Formal'], ['Iron', 'Medium']], description: 'Sharp looking formal shirt for professional settings.' },
    16: { specs: [['Fabric', 'Rayon'], ['Length', 'Knee Length'], ['Sizes', 'S-XXL'], ['Sleeve', 'Short'], ['Pattern', 'Floral'], ['Occasion', 'Casual']], description: 'Flowy summer dress with beautiful floral prints.' },
    17: { specs: [['Material', 'Cotton Blend'], ['Fit', 'Slim'], ['Sizes', 'S-XXL'], ['Waist', 'Elastic'], ['Pockets', 'Side'], ['Tapered', 'Yes']], description: 'Comfortable jogger pants with modern tapered fit.' },
    18: { specs: [['Fabric', 'Pure Silk'], ['Length', '5.5 meters'], ['Blouse', 'Included'], ['Work', 'Zari Border'], ['Occasion', 'Wedding/Festival'], ['Color', 'Rich Colors']], description: 'Exquisite pure silk saree with intricate zari work and elegant drape.' },
    19: { specs: [['Material', 'Genuine Leather'], ['Width', '3.5cm'], ['Buckle', 'Metal'], ['Sizes', '32-42'], ['Color', 'Brown/Black'], ['Finish', 'Matte']], description: 'Premium genuine leather belt for a sophisticated look.' },
    20: { specs: [['Outer', 'Polyester'], ['Fill', 'Synthetic Down'], ['Hood', 'Faux Fur'], ['Sizes', 'M-XXL'], ['Waterproof', 'Yes'], ['Temperature', '-5°C to 10°C']], description: 'Warm padded winter jacket for extreme cold protection.' },

    // Home & Living
    21: { specs: [['Material', 'Stainless Steel'], ['Capacity', '750ml'], ['Insulated', 'Yes'], ['Keeps Hot', '12 hrs'], ['Keeps Cold', '24 hrs'], ['BPA Free', 'Yes']], description: 'Premium insulated water bottle keeping drinks at perfect temperature all day.' },
    22: { specs: [['Material', 'Hard Anodized'], ['Pieces', '5'], ['Non-Stick', 'Yes'], ['Induction', 'Compatible'], ['Dishwasher', 'Safe'], ['Handles', 'Ergonomic']], description: 'Complete non-stick cookware set for modern kitchens, includes kadai, frypan, and saucepans.' },
    23: { specs: [['Type', 'LED'], ['Brightness', '3 Levels'], ['Color Temp', '3000K-6500K'], ['USB Port', 'Yes'], ['Flexible Neck', 'Yes'], ['Eye Care', 'Yes']], description: 'Adjustable LED desk lamp with multiple brightness levels perfect for studying and work, featuring eye-care technology to reduce strain.' },
    24: { specs: [['Capacity', '1.5L'], ['Type', 'Drip'], ['Auto Off', 'Yes'], ['Keep Warm', 'Yes'], ['Filter', 'Reusable'], ['Power', '800W']], description: 'Automatic coffee maker brewing perfect coffee every morning with keep-warm function.' },
    25: { specs: [['Type', 'Analog'], ['Material', 'Wood & Metal'], ['Diameter', '30cm'], ['Mechanism', 'Quartz'], ['Silent', 'Yes'], ['Mount', 'Wall']], description: 'Elegant decorative wall clock adding vintage charm to any room with silent quartz movement.' },
    26: { specs: [['Type', 'Soy Wax'], ['Burn Time', '40 hrs'], ['Fragrance', 'Lavender/Vanilla'], ['Quantity', '3 pcs'], ['Jar', 'Glass'], ['Wick', 'Cotton']], description: 'Set of 3 soothing scented candles creating a relaxing atmosphere with natural fragrances.' },
    27: { specs: [['Material', '100% Cotton'], ['Size', 'King (90x100")'], ['Thread Count', '300'], ['Pieces', '2 Pillow Covers'], ['Wash', 'Machine'], ['Pattern', 'Printed']], description: 'Soft and breathable cotton bedsheet set for a comfortable and stylish bedroom.' },
    28: { specs: [['Blades', 'Stainless Steel'], ['Pieces', '6'], ['Handles', 'Ergonomic'], ['Block', 'Wooden'], ['Dishwasher', 'Safe'], ['Includes', 'Scissors']], description: 'Professional kitchen knife set with wooden block for all your cutting needs.' },
    29: { specs: [['Material', 'Ceramic'], ['Size', '15cm'], ['Drainage', 'Yes'], ['Shape', 'Round'], ['Color', 'White/Pattern'], ['Indoor', 'Yes']], description: 'Beautiful ceramic plant pot perfect for indoor plants and home decor.' },
    30: { specs: [['Material', '100% Cotton'], ['GSM', '500'], ['Pieces', '6'], ['Size', 'Face + Bath'], ['Soft', 'Ultra Plush'], ['Quick Dry', 'Yes']], description: 'Premium ultra-soft towel set for a luxurious bathing experience with quick-dry technology.' },

    // Accessories
    31: { specs: [['Material', 'Genuine Leather'], ['Slots', '8 Card'], ['RFID', 'Protected'], ['Size', '11x9cm'], ['Color', 'Brown'], ['Gift Box', 'Yes']], description: 'Premium genuine leather wallet with RFID protection and ample card slots.' },
    32: { specs: [['Lens', 'Polarized'], ['UV400', 'Yes'], ['Frame', 'Metal'], ['Style', 'Aviator'], ['Gender', 'Unisex'], ['Case', 'Included']], description: 'Stylish polarized sunglasses with UV protection for sharp, glare-free vision.' },
    33: { specs: [['Material', 'Genuine Leather'], ['Size', '15.6"'], ['Pockets', 'Multiple'], ['Shoulder Strap', 'Yes'], ['Waterproof', 'Yes'], ['Color', 'Black']], description: 'Premium leather laptop bag combining style, protection, and organization for professionals.' },
    34: { specs: [['Movement', 'Analog'], ['Strap', 'Leather'], ['Dial', 'Minimalist'], ['Water Resistant', '30m'], ['Case', 'Stainless Steel'], ['Warranty', '1 Year']], description: 'Classic analog wrist watch with elegant minimalist design suitable for all occasions.' },
    35: { specs: [['Material', 'Canvas'], ['Capacity', '25L'], ['Laptop Sleeve', 'Yes'], ['Pockets', '6'], ['Water Resistant', 'Yes'], ['Straps', 'Padded']], description: 'Durable canvas backpack with padded laptop compartment perfect for travel and daily use.' },
    36: { specs: [['Material', 'Brass/Gold Plated'], ['Length', '22 inches'], ['Clasp', 'Lobster'], ['Style', 'Figaro'], ['Weight', '25g'], ['Tarnish Resistant', 'Yes']], description: 'Elegant gold-toned chain adding a touch of sophistication to any outfit.' },
    37: { specs: [['Material', 'Pure Silk'], ['Size', '70x180 cm'], ['Pattern', 'Printed'], ['Season', 'All'], ['Multipurpose', 'Yes'], ['Gift Ready', 'Yes']], description: 'Luxurious pure silk scarf that can be styled as neck scarf, hair band, or bag accessory.' },
    38: { specs: [['Material', 'Polyester Canvas'], ['Capacity', '45L'], ['Wheels', 'No'], ['Pockets', '4'], ['Foldable', 'Yes'], ['Strap', 'Adjustable']], description: 'Spacious duffle bag perfect for weekend getaways and gym sessions.' },
    39: { specs: [['Material', 'Alloy'], ['Stone', 'Cubic Zirconia'], ['Size', 'Adjustable'], ['Finish', 'Rhodium Plated'], ['Style', 'Tennis'], ['Hypoallergenic', 'Yes']], description: 'Beautiful sparkly bracelet that adds elegance to both casual and formal attire.' },
    40: { specs: [['Material', 'Silicone/TPU'], ['Compatible', 'iPhone/Samsung'], ['Shockproof', 'Yes'], ['Slim', 'Yes'], ['Wireless Charge', 'Compatible'], ['Grip', 'Anti-slip']], description: 'Durable and stylish phone case with shockproof protection and slim profile design.' }
};

function getDefaultSpecs(category) {
    const specsMap = {
        'electronics': [['Category', 'Electronics'], ['Warranty', '1 Year Manufacturer'], ['Quality', 'Premium Grade']],
        'clothing': [['Category', 'Clothing'], ['Care', 'As per label'], ['Quality', 'Premium Fabric']],
        'home': [['Category', 'Home & Living'], ['Durability', 'Long-lasting'], ['Quality', 'High Grade']],
        'accessories': [['Category', 'Accessories'], ['Warranty', '6 Months'], ['Quality', 'Premium']]
    };
    return specsMap[category] || [['Quality', 'Premium Product']];
}

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalCurrentProduct = product;
    modalQuantity = 1;

    // Set basic info
    document.getElementById('modalImage').src = product.image;
    document.getElementById('modalCategory').textContent = product.category;
    document.getElementById('modalName').textContent = product.name;
    document.getElementById('modalQuantity').textContent = modalQuantity;

    // Rating
    const fullStars = Math.floor(product.rating);
    let starHTML = '';
    for (let i = 0; i < 5; i++) {
        starHTML += i < fullStars ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    document.getElementById('modalRating').innerHTML = `
        <span class="stars">${starHTML}</span>
        <span class="rating-text">${product.rating} out of 5</span>
        <span class="rating-count">(1,200+ ratings)</span>
    `;

    // Price with discount
    const originalPrice = Math.round(product.price * 1.3);
    const discountPercent = 23;
    document.getElementById('modalPrice').innerHTML = `
        ${formatINR(product.price)}
        <span class="original-price">${formatINR(originalPrice)}</span>
        <span class="discount-badge">${discountPercent}% OFF</span>
    `;

    // Specifications
    const specs = productSpecs[product.id]?.specs || getDefaultSpecs(product.category);
    const specsList = document.getElementById('modalSpecs');
    specsList.innerHTML = specs.map(s => `
        <li><span class="spec-label">${s[0]}</span><span>${s[1]}</span></li>
    `).join('');

    // Description
    const description = productSpecs[product.id]?.description || `Premium quality ${product.name.toLowerCase()} from Chandrika's Store. Carefully selected for quality and value.`;
    document.getElementById('modalDescription').textContent = description;

    // Reset add to cart button
    const addCartBtn = document.getElementById('modalAddCart');
    addCartBtn.classList.remove('added');
    addCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';

    // Show modal
    const modal = document.getElementById('productModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Scroll to top of modal
    document.querySelector('.product-modal').scrollTop = 0;
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modalCurrentProduct = null;
}

function modalQuantityChange(delta) {
    modalQuantity += delta;
    if (modalQuantity < 1) modalQuantity = 1;
    if (modalQuantity > 10) modalQuantity = 10;
    document.getElementById('modalQuantity').textContent = modalQuantity;
}

function addToCartFromModal() {
    if (!modalCurrentProduct) return;

    // Add the product multiple times based on quantity
    for (let i = 0; i < modalQuantity; i++) {
        addToCart(modalCurrentProduct);
    }

    // Animate button
    const addCartBtn = document.getElementById('modalAddCart');
    addCartBtn.classList.add('added');
    addCartBtn.innerHTML = `<i class="fas fa-check"></i> ${modalQuantity} Added! ✅`;

    setTimeout(() => {
        addCartBtn.classList.remove('added');
        addCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
    }, 2000);

    // Close modal after 1.5 seconds
    setTimeout(() => {
        closeProductModal();
    }, 1500);

    // Reset quantity
    modalQuantity = 1;
    document.getElementById('modalQuantity').textContent = modalQuantity;
}

// Close modal when clicking overlay
document.getElementById('productModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// ============ Format INR ============
function formatINR(price) {
    return '₹' + price.toLocaleString('en-IN');
}

// ============ Star Rating HTML ============
function getStarHTML(rating) {
    const full = Math.floor(rating);
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < full ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return stars;
}

// ============ Render Product Cards ============
function renderProductCards(productList, gridElement) {
    if (!gridElement) return;
    if (productList.length === 0) {
        gridElement.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No products found</p></div>';
        return;
    }
    gridElement.innerHTML = productList.map(p => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}" loading="lazy" onclick="openProductModal(${p.id})" title="Click to view details">
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3 onclick="openProductModal(${p.id})" style="cursor:pointer;">${p.name}</h3>
                <div class="product-rating">${getStarHTML(p.rating)} <span>${p.rating}</span></div>
                <p class="product-price">${formatINR(p.price)}</p>
                <button class="add-cart-btn" onclick="event.stopPropagation(); addToCartGlobal(${p.id}, this)" id="cartBtn${p.id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}
// Global add to cart function with button animation
function addToCartGlobal(productId, btnElement) {
    const product = products.find(p => p.id === productId);
    if (product) {
        addToCart(product);
        
        // Button animation
        if (btnElement) {
            btnElement.classList.add('added');
            btnElement.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => {
                btnElement.classList.remove('added');
                btnElement.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
            }, 2000);
        }
    }
}

// ============ Featured Products (Home Page) ============
const featuredGrid = document.getElementById('featuredGrid');
if (featuredGrid) {
    renderProductCards(products.slice(0, 8), featuredGrid);
}

// ============ Products Page Logic ============
const productsGrid = document.getElementById('productsGrid');
if (productsGrid) {
    let currentCategory = 'all';
    let currentSort = 'default';
    let searchQuery = '';
    let maxPrice = 10000;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('category')) {
        currentCategory = urlParams.get('category');
    }

    function filterAndSort() {
        let filtered = products.filter(p => {
            if (currentCategory !== 'all' && p.category !== currentCategory) return false;
            if (p.price > maxPrice) return false;
            if (searchQuery && !p.name.toLowerCase().includes(searchQuery)) return false;
            return true;
        });

        switch (currentSort) {
            case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
            case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
        }

        renderProductCards(filtered, productsGrid);
        const countEl = document.getElementById('productCount');
        if (countEl) countEl.textContent = `Showing ${filtered.length} products`;
    }

    document.querySelectorAll('.filter-option').forEach(btn => {
        if (btn.dataset.category === currentCategory) {
            document.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            filterAndSort();
        });
    });

    const priceRange = document.getElementById('priceRange');
    const priceRangeLabel = document.getElementById('priceRangeLabel');
    if (priceRange && priceRangeLabel) {
        priceRange.addEventListener('input', () => {
            maxPrice = parseInt(priceRange.value);
            priceRangeLabel.textContent = `Up to ${formatINR(maxPrice)}`;
            filterAndSort();
        });
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            currentSort = sortFilter.value;
            filterAndSort();
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            searchQuery = searchInput.value.toLowerCase();
            filterAndSort();
        });
    }

    const clearFilters = document.getElementById('clearFilters');
    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            currentCategory = 'all';
            currentSort = 'default';
            searchQuery = '';
            maxPrice = 10000;
            document.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
            document.querySelector('.filter-option[data-category="all"]')?.classList.add('active');
            if (priceRange) priceRange.value = 10000;
            if (priceRangeLabel) priceRangeLabel.textContent = 'Up to ₹10,000';
            if (sortFilter) sortFilter.value = 'default';
            if (searchInput) searchInput.value = '';
            filterAndSort();
        });
    }

    filterAndSort();
}

// ============ Cart Page Render ============
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartContainer = document.querySelector('.cart-container');

    if (!cartItems || !cartSummary || !cartEmpty) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContainer.style.display = 'none';
        cartEmpty.style.display = 'block';
        return;
    }

    cartContainer.style.display = 'grid';
    cartEmpty.style.display = 'none';

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p class="price">${formatINR(item.price)}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash-alt"></i> Remove
                </button>
            </div>
            <div style="font-weight:700;color:var(--accent);">${formatINR(item.price * item.quantity)}</div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;

    cartSummary.innerHTML = `
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal (${cart.reduce((s, i) => s + i.quantity, 0)} items)</span><span>${formatINR(subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE 🎉' : formatINR(shipping)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatINR(total)}</span></div>
        ${subtotal < 999 ? '<p style="color:#e67e22;font-size:0.85rem;margin-top:8px;">Add ' + formatINR(999 - subtotal) + ' more for free shipping!</p>' : '<p style="color:#2ecc71;font-size:0.85rem;margin-top:8px;">🎉 You qualify for free shipping!</p>'}
        <button class="checkout-btn" onclick="checkout()">
            <i class="fas fa-lock"></i> Proceed to Checkout
        </button>
        <a href="products.html" class="continue-shopping">← Continue Shopping</a>
    `;
}

function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty!', true);
        return;
    }
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = total >= 999 ? 0 : 99;
    const grandTotal = total + shipping;
    
    if (confirm(`Confirm your order?\n\nTotal: ${formatINR(grandTotal)}\n\nClick OK to place order.`)) {
        saveCart([]);
        updateCartCount();
        renderCart();
        showToast('Order placed successfully! 🎉');
    }
}

if (document.getElementById('cartItems')) {
    renderCart();
}

// Cart icon click
document.querySelectorAll('.cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!window.location.pathname.includes('cart.html')) {
            window.location.href = 'cart.html';
        }
    });
});

// ============ Contact Form Validation ============
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactPhone = document.getElementById('contactPhone');
    const contactSubject = document.getElementById('contactSubject');
    const contactMessage = document.getElementById('contactMessage');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let valid = true;

        const nameError = document.getElementById('contactNameError');
        if (contactName.value.trim().length < 3) {
            nameError.textContent = 'Name must be at least 3 characters';
            valid = false;
        } else {
            nameError.textContent = '';
        }

        const emailError = document.getElementById('contactEmailError');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.value)) {
            emailError.textContent = 'Please enter a valid email';
            valid = false;
        } else {
            emailError.textContent = '';
        }

        const phoneError = document.getElementById('contactPhoneError');
        if (contactPhone.value) {
            if (!/^[6-9]\d{9}$/.test(contactPhone.value.replace(/\D/g, ''))) {
                phoneError.textContent = 'Enter a valid 10-digit phone number';
                valid = false;
            } else {
                phoneError.textContent = '';
            }
        }

        const subjectError = document.getElementById('contactSubjectError');
        if (contactSubject.value.trim().length < 2) {
            subjectError.textContent = 'Subject is required';
            valid = false;
        } else {
            subjectError.textContent = '';
        }

        const messageError = document.getElementById('contactMessageError');
        if (contactMessage.value.trim().length < 10) {
            messageError.textContent = 'Message must be at least 10 characters';
            valid = false;
        } else {
            messageError.textContent = '';
        }

        if (valid) {
            showToast('Message sent successfully! We will get back to you soon. ✅');
            contactForm.reset();
        }
    });
}

// ============ Initialize cart count ============
updateCartCount();