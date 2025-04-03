// Hàm kiểm tra số nguyên tố
function isPrime(num) {
    if (num < 2) return false;
    if (num === 2 || num === 3) return true;
    if (num % 2 === 0) return false;
    for (let i = 3; i * i <= num; i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

// Hàm tạo số nguyên tố ngẫu nhiên trong khoảng [min, max]
function generateRandomPrime(min, max) {
    let prime;
    do {
        prime = Math.floor(Math.random() * (max - min) + min);
    } while (!isPrime(prime));
    return prime;
}

// Hàm tính GCD (Ước số chung lớn nhất)
function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Hàm tính số nghịch đảo modulo (Dùng thuật toán Euclid mở rộng)
function modInverse(e, phi) {
    let m0 = phi, x0 = 0, x1 = 1;
    while (e > 1) {
        let q = Math.floor(e / phi);
        [e, phi] = [phi, e % phi];
        [x0, x1] = [x1 - q * x0, x0];
    }
    return x1 < 0 ? x1 + m0 : x1;
}

function modPow(base, exp, mod) {
    let result = 1;
    base = base % mod; // Đảm bảo base luôn nhỏ hơn mod (tránh trường hợp base lớn hơn mod)

    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        base = (base * base) % mod;
        exp = Math.floor(exp / 2);
    }
    return result;
}


// 1️⃣ Tạo khóa riêng RSA
export function generatePrivateKey() {
    const p = generateRandomPrime(50, 1000);
    const q = generateRandomPrime(50, 1000);
    const n = p * q;
    const phi = (p - 1) * (q - 1);

    let e = 3;
    while (gcd(e, phi) !== 1) {
        e++; // Chọn `e` phù hợp
    }

    const d = modInverse(e, phi);

    return { d, n, e, p, q, phi };
}


// 2️⃣ Tạo khóa công khai từ private key
export function generatePublicKey(privateKey) {
    return { e: privateKey.e, n: privateKey.n };
}


// 3️⃣ Ký số
export function signMessage(message, privateKey) {
    return modPow(message, privateKey.d, privateKey.n); // Mã hóa bằng khóa riêng
}

// 4️⃣ Xác minh chữ ký
export function verifySignature(signature, message, publicKey) {
    console.log(signature, message, publicKey);
    const messageCheck = modPow(signature, publicKey.e, publicKey.n); // Giải mã chữ ký
    console.log(messageCheck);
    return message == messageCheck; // Kiểm tra tính hợp lệ
}

export function extractNumberFromString(str) {
    let numStr = "";

    // Duyệt qua tối đa 10 ký tự đầu tiên của chuỗi, chuyển thành mã ASCII và nối lại
    for (let i = 0; i < Math.min(str.length, 10); i++) {
        let charCode = str.charCodeAt(i);
        numStr += charCode; // Nối mã ASCII của từng ký tự
    }

    // Chuyển chuỗi số thành một số nguyên
    let number = parseInt(numStr, 10);

    // Đảm bảo số nhỏ hơn 500
    return number % 500;
}



// ✅ Kiểm thử
const privateKey = generatePrivateKey();
const publicKey = generatePublicKey(privateKey);

console.log("🔹 Private Key:", privateKey);
console.log("🔹 Public Key:", publicKey);

const message = Math.floor(Math.random() * 100); // Giả sử thông điệp là số nguyên
const signature = signMessage(message, privateKey);

console.log(`✍️ Chữ ký số cho thông điệp ${message}: ${signature}`);
console.log(`🔍 Xác minh chữ ký:`, verifySignature(signature, message, publicKey) ? "✅ Hợp lệ" : "❌ Không hợp lệ");
