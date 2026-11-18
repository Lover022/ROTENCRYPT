const userFirstNameInput = document.getElementById('name');
const userLastNameInput = document.getElementById('surname');
const userPasswordInput = document.getElementById('password');
const checkPass = document.querySelector('.check');
const popUp = document.querySelector('.pop-up');
const userContent = document.querySelector('.user-content');
const adminContent = document.querySelector('.admin-content');
const authMessage = document.getElementById('auth-message');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');

let isRegisterMode = false;

// Перемикання видимості пароля
checkPass.addEventListener('change', function () {
    userPasswordInput.type = this.checked ? 'text' : 'password';
});

// Функція симетричного шифрування / дешифрування ROT13
function encodeToRot13(str) {
    const originalAlpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const cipher = 'nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM5678901234';
    return str.replace(/[A-Za-z0-9]/g, (letter) => cipher[originalAlpha.indexOf(letter)]);
}

// Початкові дані користувачів та адміністратора для БД (LocalStorage)
const defaultUsers = [
    {
        name: 'Student1',
        surname: 'SurnameStd1',
        password: '409kbSTD'
    },
    {
        name: 'Student2',
        surname: 'SurnameStd2',
        password: '410kbSTD'
    }
];

const defaultAdmin = [
    {
        name: 'Admin',
        surname: 'surnameAdmin',
        password: 'admin147258'
    }
];

// Шифрування / дешифрування масиву об'єктів без мутації оригіналу
function masSfr(mas) {
    return mas.map((elem) => ({
        name: encodeToRot13(elem.name),
        surname: encodeToRot13(elem.surname),
        password: encodeToRot13(elem.password)
    }));
}

// Ініціалізація LocalStorage зашифрованими даними
if (localStorage.getItem('usersInformation') === null) {
    localStorage.setItem('usersInformation', JSON.stringify(masSfr(defaultUsers)));
}
if (localStorage.getItem('adminInformation') === null) {
    localStorage.setItem('adminInformation', JSON.stringify(masSfr(defaultAdmin)));
}
if (localStorage.getItem('isUser') === null) {
    localStorage.setItem('isUser', JSON.stringify(false));
}
if (localStorage.getItem('isAdmin') === null) {
    localStorage.setItem('isAdmin', JSON.stringify(false));
}

// Перемикання вкладок Log in / Register
function setAuthMode(register) {
    isRegisterMode = register;
    authMessage.textContent = '';
    authMessage.classList.remove('success');
    if (register) {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        authTitle.textContent = 'Register';
        authSubmitBtn.textContent = 'Sign up';
    } else {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        authTitle.textContent = 'Log in';
        authSubmitBtn.textContent = 'Log in';
    }
}

tabLogin.addEventListener('click', () => setAuthMode(false));
tabRegister.addEventListener('click', () => setAuthMode(true));

// Відображення сторінки адміністратора з дешифрованою таблицею користувачів
function regAdmin() {
    const flagAdmin = JSON.parse(localStorage.getItem('isAdmin'));
    const encryptedUsers = JSON.parse(localStorage.getItem('usersInformation')) || [];
    const decryptedUsers = masSfr(encryptedUsers);

    if (flagAdmin) {
        popUp.classList.add('hidden');
        document.querySelector('.user-admin').textContent = 'Admin';
        userContent.classList.add('hidden');

        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        for (let i = 0; i < decryptedUsers.length; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${i + 1}</td>
                <td>${decryptedUsers[i].name}</td>
                <td>${decryptedUsers[i].surname}</td>
                <td><strong>${decryptedUsers[i].password}</strong></td>
                <td class="cipher-cell">${encryptedUsers[i].password}</td>
            `;
            tbody.appendChild(tr);
        }

        adminContent.classList.remove('hidden');
        document.querySelector('.background').src = './assets/all/2.jpg';
    }
}

// Відображення сторінки користувача
function regUser() {
    const flagUser = JSON.parse(localStorage.getItem('isUser'));
    if (flagUser) {
        popUp.classList.add('hidden');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const label = currentUser ? `User (${currentUser.name})` : 'User';
        document.querySelector('.user-admin').textContent = label;

        const greeting = document.getElementById('user-greeting');
        greeting.textContent = currentUser
            ? `Welcome, ${currentUser.name} ${currentUser.surname}!`
            : 'Welcome User';

        userContent.classList.remove('hidden');
        adminContent.classList.add('hidden');
        document.querySelector('.background').src = './assets/all/1.jpg';
    }
}

// Обробка входу або реєстрації
function handleAuth(event) {
    event.preventDefault();

    const nameVal = userFirstNameInput.value.trim();
    const surnameVal = userLastNameInput.value.trim();
    const passwordVal = userPasswordInput.value;

    const encryptedUsers = JSON.parse(localStorage.getItem('usersInformation')) || [];
    const encryptedAdmins = JSON.parse(localStorage.getItem('adminInformation')) || [];

    const usersDecrypted = masSfr(encryptedUsers);
    const adminsDecrypted = masSfr(encryptedAdmins);

    if (isRegisterMode) {
        const existsInUsers = usersDecrypted.some(
            (u) => u.name === nameVal && u.surname === surnameVal
        );
        const existsInAdmins = adminsDecrypted.some(
            (a) => a.name === nameVal && a.surname === surnameVal
        );

        if (existsInUsers || existsInAdmins) {
            authMessage.classList.remove('success');
            authMessage.textContent = 'Користувач із таким імʼям та прізвищем вже існує!';
            return;
        }

        // Шифруємо дані нового користувача та зберігаємо в LocalStorage
        const newEncryptedUser = {
            name: encodeToRot13(nameVal),
            surname: encodeToRot13(surnameVal),
            password: encodeToRot13(passwordVal)
        };
        encryptedUsers.push(newEncryptedUser);
        localStorage.setItem('usersInformation', JSON.stringify(encryptedUsers));

        // Автоматичний вхід після успішної реєстрації
        localStorage.setItem('isUser', JSON.stringify(true));
        localStorage.setItem('isAdmin', JSON.stringify(false));
        localStorage.setItem('currentUser', JSON.stringify({ name: nameVal, surname: surnameVal }));
        regUser();
        return;
    }

    // Перевірка адміністратора
    for (let a = 0; a < adminsDecrypted.length; a++) {
        if (
            adminsDecrypted[a].name === nameVal &&
            adminsDecrypted[a].surname === surnameVal &&
            adminsDecrypted[a].password === passwordVal
        ) {
            localStorage.setItem('isAdmin', JSON.stringify(true));
            localStorage.setItem('isUser', JSON.stringify(false));
            regAdmin();
            return;
        }
    }

    // Перевірка звичайного користувача
    for (let i = 0; i < usersDecrypted.length; i++) {
        if (
            usersDecrypted[i].name === nameVal &&
            usersDecrypted[i].surname === surnameVal &&
            usersDecrypted[i].password === passwordVal
        ) {
            localStorage.setItem('isUser', JSON.stringify(true));
            localStorage.setItem('isAdmin', JSON.stringify(false));
            localStorage.setItem('currentUser', JSON.stringify({ name: nameVal, surname: surnameVal }));
            regUser();
            return;
        }
    }

    authMessage.classList.remove('success');
    authMessage.textContent = 'Невірне імʼя, прізвище або пароль!';
}

// Інтерактивна демонстрація ROT13 на сторінці користувача
const demoInput = document.getElementById('demo-input');
const demoOutput = document.getElementById('demo-output');
if (demoInput && demoOutput) {
    demoInput.addEventListener('input', () => {
        demoOutput.textContent = demoInput.value
            ? encodeToRot13(demoInput.value)
            : 'Результат шифрування...';
    });
}

// Відновлення сесії при оновленні сторінки
if (JSON.parse(localStorage.getItem('isUser'))) {
    regUser();
}
if (JSON.parse(localStorage.getItem('isAdmin'))) {
    regAdmin();
}

// Вихід із системи
function logout() {
    localStorage.setItem('isUser', JSON.stringify(false));
    localStorage.setItem('isAdmin', JSON.stringify(false));
    localStorage.removeItem('currentUser');
    location.reload();
}

document.getElementById('logout-icon').addEventListener('click', logout);
document.getElementById('logout-btn').addEventListener('click', logout);
document.getElementById('form').addEventListener('submit', handleAuth);
