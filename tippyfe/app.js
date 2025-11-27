// --- KONFIGURASI SMART CONTRACT ---
// 1. Alamat Smart Contract
// PASTIKAN INI ADALAH ALAMAT DARI DEPLOY TERAKHIR KAMU DI REMIX
const CONTRACT_ADDRESS = "0xf8e81D47203A594245E36C48e151709F0C19fBe8"; 

// 2. ABI
const CONTRACT_ABI = [
    {
        "inputs": [{"internalType": "uint256","name": "_itemCount","type": "uint256"}],
        "name": "createOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true,"internalType": "address","name": "buyer","type": "address"},
            {"indexed": false,"internalType": "uint256","name": "amount","type": "uint256"},
            {"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}
        ],
        "name": "NewOrder",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getMyOrders",
        "outputs": [{"components": [{"internalType": "uint256","name": "id","type": "uint256"},{"internalType": "address","name": "buyer","type": "address"},{"internalType": "uint256","name": "itemCount","type": "uint256"},{"internalType": "uint256","name": "totalAmount","type": "uint256"},{"internalType": "uint256","name": "timestamp","type": "uint256"},{"internalType": "string","name": "status","type": "string"}],"internalType": "struct TippyJastip.Order[]","name": "","type": "tuple[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "","type": "address"},{"internalType": "uint256","name": "","type": "uint256"}],
        "name": "orders",
        "outputs": [{"internalType": "uint256","name": "id","type": "uint256"},{"internalType": "address","name": "buyer","type": "address"},{"internalType": "uint256","name": "itemCount","type": "uint256"},{"internalType": "uint256","name": "totalAmount","type": "uint256"},{"internalType": "uint256","name": "timestamp","type": "uint256"},{"internalType": "string","name": "status","type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address","name": "","type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalTransactionCount",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// --- DATA PRODUK ---
const products = [
    { id: 1, name: "Gentle Monster Sunglasses", price: 0.08, img: "produk1.png" },
    { id: 2, name: "Official K-Pop Lightstick", price: 0.015, img: "produk0.png" },
    { id: 3, name: "Limited Nike Sneakers", price: 0.15, img: "produk3.jpg" },
    { id: 4, name: "Korean Skincare Set", price: 0.03, img: "produk4.png" },
    { id: 5, name: "Tokyo Banana Box", price: 0.01, img: "produk5.png" },
    { id: 6, name: "Vintage Camera", price: 0.2, img: "produk6.png" },
    { id: 7, name: "Pop Mart Blind Box", price: 0.005, img: "produk7.png" },
    { id: 10, name: "Daily Sheet Mask (Pack)", price: 0.002, img: "produk8.png" },
    { id: 11, name: "Aesthetic Canvas Tote", price: 0.006, img: "produk9.png" }
];

let cart = [];
let userAccount = null;

// --- NAVIGASI ---
function showSection(sectionId, element) {
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');

    if (element) {
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        element.classList.add('active');
    }

    if (sectionId === 'product') renderProducts();
    if (sectionId === 'cart') renderCart();
    
    // Jika membuka tab order, ambil data asli dari blockchain
    if (sectionId === 'order') fetchMyOrders(); 
}

function triggerNav(sectionId) {
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(item => {
        if (item.innerText.includes('Browse')) showSection(sectionId, item);
    });
}

// --- LOGIKA UI ---
function renderProducts() {
    const container = document.getElementById('product-list');
    if (container.innerHTML.trim() !== "") return;

    products.forEach(p => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/150'">
                <h4>${p.name}</h4>
                <span class="price-tag">${p.price} ETH</span>
                <button class="btn-add" onclick="addToCart(${p.id})">
                    <i class="fas fa-plus"></i> Add to Cart
                </button>
            </div>
        `;
    });
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    document.getElementById('cart-badge').innerText = cart.length;
    showToast(`${item.name} added to cart!`);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    let total = 0;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="text-align:center; padding:20px; color:#aaa;">
                <i class="fas fa-shopping-basket" style="font-size:3rem; margin-bottom:10px;"></i>
                <p>Belum ada barang titipan.</p>
            </div>`;
        document.getElementById('total-price').innerText = "0 ETH";
        document.getElementById('subtotal').innerText = "0 ETH";
        return;
    }

    container.innerHTML = '';
    
    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `
            <div class="cart-item">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:40px; height:40px; background:#eee; border-radius:8px; overflow:hidden;">
                        <img src="${item.img}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/150'">
                    </div>
                    <span>${item.name}</span>
                </div>
                <div style="display:flex; align-items:center; gap:15px;">
                    <strong>${item.price} ETH</strong>
                    <button class="btn-remove" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    });

    // Perbaikan logika pembulatan desimal JS yang kadang aneh (misal: 0.30000000004)
    const subtotalFix = parseFloat(total.toFixed(6));
    const totalFix = parseFloat((total + 0.001).toFixed(6));

    document.getElementById('subtotal').innerText = subtotalFix + " ETH";
    document.getElementById('total-price').innerText = totalFix + " ETH";
}

function removeFromCart(index) {
    cart.splice(index, 1);    
    document.getElementById('cart-badge').innerText = cart.length;    
    renderCart();    
    showToast("Item dihapus dari keranjang");
}

// --- METAMASK & BLOCKCHAIN LOGIC ---

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
            const selectedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = selectedAccounts[0];

            document.getElementById('connectWalletBtn').style.display = 'none';
            document.getElementById('walletInfo').classList.remove('hidden');
            document.getElementById('walletInfo').style.display = 'flex';
            document.getElementById('userAddress').innerText =
                `${userAccount.substring(0, 5)}...${userAccount.substring(38)}`;

            showToast("Wallet Connected Successfully!");
            fetchMyOrders(); 
        } catch (error) {
            console.error(error);
        }
    } else {
        alert("MetaMask not found! Please install MetaMask extension.");
    }
}

async function checkout() {
    if (!userAccount) {
        showToast("Please connect wallet first!");
        return;
    }

    // 1. Ambil teks harga dan bersihkan (Trim)
    let totalText = document.getElementById('total-price').innerText.replace(' ETH', '').trim();
    
    // 2. Cegah error desimal kepanjangan dari JS Floating Point
    // Ethers.js strict, kalau desimal > 18 dia error. Kita limit ke 18.
    if(totalText.includes('.')) {
        totalText = parseFloat(totalText).toFixed(18).toString();
    }

    console.log("Processing payment for:", totalText, "ETH");

    if (parseFloat(totalText) <= 0) {
        showToast("Keranjang kosong!");
        return;
    }

    const btn = document.querySelector('.btn-checkout');
    const originalText = btn.innerText;
    btn.innerText = "Opening MetaMask...";
    btn.disabled = true;

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        // Pastikan format contract address benar
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const priceInWei = ethers.utils.parseEther(totalText);

        // Panggil fungsi createOrder di Smart Contract
        const tx = await contract.createOrder(cart.length, { value: priceInWei });
        
        btn.innerText = "Processing Transaction...";
        showToast("Transaksi dikirim! Menunggu konfirmasi block...");

        await tx.wait();

        // --- SUKSES ---
        btn.innerText = originalText;
        btn.disabled = false;
        
        cart = [];
        document.getElementById('cart-badge').innerText = "0";
        renderCart();
        
        showToast("Pembayaran Berhasil! Tercatat di Blockchain.");
        
        await fetchMyOrders();
        triggerNav('order'); 
        
        const orderTab = document.querySelectorAll('.nav-links li')[3];
        showSection('order', orderTab);

    } catch (error) {
        console.error("Payment Error:", error);
        btn.innerText = originalText;
        btn.disabled = false;
        
        if(error.code === 4001 || error.code === 'ACTION_REJECTED') {
            showToast("Transaksi dibatalkan user.");
        } else {
            // Tampilkan pesan error yang lebih jelas di console
            console.log("Detail Error:", error.message);
            showToast("Gagal. Cek Console untuk detail.");
        }
    }
}

async function fetchMyOrders() {
    if(!userAccount) return;

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        const orders = await contract.getMyOrders();
        
        const orderList = document.getElementById('order-list');
        orderList.innerHTML = ''; 

        if(orders.length === 0) {
            orderList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Belum ada riwayat transaksi.</td></tr>';
            return;
        }

        for(let i = orders.length - 1; i >= 0; i--) {
            const o = orders[i];
            const date = new Date(o.timestamp * 1000).toLocaleDateString() + ' ' + new Date(o.timestamp * 1000).toLocaleTimeString();
            const ethAmount = ethers.utils.formatEther(o.totalAmount);
            
            orderList.innerHTML += `
                <tr>
                    <td style="font-family:monospace; color:var(--primary);">TX-${o.id}</td>
                    <td>${o.itemCount} Items</td>
                    <td>${date}</td>
                    <td>
                        <span class="status-success">
                            Paid ${parseFloat(ethAmount).toFixed(5)} ETH
                        </span>
                    </td>
                </tr>
            `;
        }
    } catch (err) {
        console.error("Gagal ambil history:", err);
    }
}

// Cek koneksi saat halaman dimuat (Optional, biar kalau refresh gak putus)
window.onload = async () => {
    if(window.ethereum) {
        const accounts = await window.ethereum.request({method: 'eth_accounts'});
        if(accounts.length > 0) {
            connectWallet();
        }
    }
}