// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TippyJastip {
    
    // --- STRUKTUR DATA ---
    
    // Informasi Pemilik Toko (Kamu)
    address public owner;

    // Bentuk data untuk setiap pesanan
    struct Order {
        uint256 id;
        address buyer;
        uint256 itemCount;   // Jumlah barang
        uint256 totalAmount; // Total harga dalam Wei/ETH
        uint256 timestamp;   // Waktu transaksi
        string status;       // Status (Confirmed/Paid)
    }

    // Database: Alamat Wallet User -> Daftar Pesanan Mereka
    mapping(address => Order[]) public orders;
    
    // Menghitung total transaksi global
    uint256 public totalTransactionCount;

    // Event agar frontend tahu ada transaksi baru (log)
    event NewOrder(address indexed buyer, uint256 amount, uint256 timestamp);

    // --- FUNGSI ---

    constructor() {
        owner = msg.sender; // Orang yang deploy kontrak adalah pemilik
    }

    // 1. FUNGSI BAYAR (Dipanggil saat Checkout)
    // 'payable' artinya fungsi ini boleh menerima uang (ETH)
    function createOrder(uint256 _itemCount) public payable {
        require(msg.value > 0, "Harga harus lebih dari 0 ETH");

        // Buat ID unik sederhana
        totalTransactionCount++; 
        
        // Simpan data pesanan ke memori blockchain
        orders[msg.sender].push(Order({
            id: totalTransactionCount,
            buyer: msg.sender,
            itemCount: _itemCount,
            totalAmount: msg.value,
            timestamp: block.timestamp,
            status: "Paid & Confirmed"
        }));

        emit NewOrder(msg.sender, msg.value, block.timestamp);
    }

    // 2. FUNGSI LIHAT PESANAN SAYA
    // Mengambil semua history belanjaan si user
    function getMyOrders() public view returns (Order[] memory) {
        return orders[msg.sender];
    }

    // 3. FUNGSI TARIK DANA (Khusus Owner)
    // Mengambil ETH dari kontrak ke dompet kamu
    function withdraw() public {
        require(msg.sender == owner, "Hanya pemilik Tippy yang bisa tarik dana!");
        payable(owner).transfer(address(this).balance);
    }
}