// JavaScript: จัดการข้อมูลและคำนวณทั้งหมด
let friends = [];
let foodItems = [];
let splitHistory = []; 
let historyIdCounter = 0; 

// --- 1. จัดการเพื่อน ---
function addFriend() {
    const nameInput = document.getElementById('friendName');
    const name = nameInput.value.trim();
    if (name && !friends.includes(name)) {
        friends.push(name);
        nameInput.value = '';
        renderFriendsAndFoodItems();
    }
}

function removeFriend(nameToRemove) {
    friends = friends.filter(name => name !== nameToRemove);
    foodItems.forEach(item => {
        item.eaters = item.eaters.filter(name => name !== nameToRemove);
    });
    renderFriendsAndFoodItems();
}

function renderFriendList() {
    const container = document.getElementById('friendListContainer');
    container.innerHTML = '';
    friends.forEach(friend => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<span>${friend}</span>
            <button class="delete-btn" onclick="removeFriend('${friend}')">ลบ</button>`;
        container.appendChild(div);
    });
}


// --- 2. จัดการรายการอาหาร ---
function addFoodItem() {
    const name = document.getElementById('foodName').value.trim();
    const quantity = parseInt(document.getElementById('foodQuantity').value);
    const pricePerUnit = parseFloat(document.getElementById('foodPrice').value);

    if (name && pricePerUnit > 0 && quantity > 0) {
        const totalPrice = pricePerUnit * quantity;
        foodItems.push({ 
            name: name, 
            pricePerUnit: pricePerUnit,
            quantity: quantity,
            totalPrice: totalPrice,
            eaters: friends.slice() 
        }); 

        document.getElementById('foodName').value = '';
        document.getElementById('foodQuantity').value = '1';
        document.getElementById('foodPrice').value = '';
        renderFoodItems();
    } else {
        alert('กรุณาใส่ชื่อเมนู, จำนวนจาน และราคาต่อจานที่ถูกต้อง');
    }
}

function removeFoodItem(index) {
    foodItems.splice(index, 1);
    renderFoodItems();
}

function updateEaters(itemIndex, friendName, isChecked) {
    const item = foodItems[itemIndex];
    if (isChecked) {
        if (!item.eaters.includes(friendName)) {
            item.eaters.push(friendName);
        }
    } else {
        item.eaters = item.eaters.filter(name => name !== friendName);
    }
}

function renderFoodItems() {
    const container = document.getElementById('foodItemListContainer');
    container.innerHTML = '';
    
    foodItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        
        const itemDetails = document.createElement('div');
        itemDetails.className = 'item-details';

        itemDetails.innerHTML = `
            <strong>${item.name}</strong> (${item.quantity} จาน x ${item.pricePerUnit.toFixed(2)} บาท) = 
            <span style="color:#dc3545;">รวม ${item.totalPrice.toFixed(2)} บาท</span>
        `;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'ลบ';
        deleteBtn.onclick = () => removeFoodItem(index);

        const eatersDiv = document.createElement('div');
        eatersDiv.className = 'participants-checkboxes';
        
        const checkboxesHTML = friends.map(friend => `
            <label>
                <input type="checkbox" 
                       ${item.eaters.includes(friend) ? 'checked' : ''}
                       onchange="updateEaters(${index}, '${friend}', this.checked)">
                ${friend}
            </label>
        `).join('');

        eatersDiv.innerHTML = '<strong>ใครหาร:</strong> ' + (checkboxesHTML || 'ยังไม่มีเพื่อน');
        
        itemDetails.appendChild(eatersDiv);

        div.appendChild(itemDetails);
        div.appendChild(deleteBtn);
        container.appendChild(div);
    });
}

function renderFriendsAndFoodItems() {
    renderFriendList();
    renderFoodItems();
}

// --- 3. ฟังก์ชันประวัติ ---
function deleteHistoryEntry(id) {
    splitHistory = splitHistory.filter(record => record.id !== id);
    renderHistory();
}

function editHistoryEntry(id) {
    const record = splitHistory.find(r => r.id === id);
    if (!record) return;

    // 1. นำข้อมูลเพื่อนกลับมา
    friends = record.initialFriends.slice();

    // 2. นำข้อมูลรายการอาหารกลับมา
    foodItems = record.initialFoodItems.map(item => ({
        ...item, 
        eaters: item.eaters.slice() 
    }));
    
    // 3. ลบรายการประวัติเดิม
    deleteHistoryEntry(id);

    // 4. เรนเดอร์หน้าจอใหม่ทั้งหมด
    renderFriendsAndFoodItems();
    
    // 5. แสดงข้อความแจ้งเตือน
    alert(`นำข้อมูลบิลของวันที่ ${record.timestamp} กลับขึ้นมาแก้ไขแล้ว`);
}

function renderHistory() {
    const historyContainer = document.getElementById('historyListContainer');
    if (!historyContainer) return;

    if (splitHistory.length === 0) {
        historyContainer.innerHTML = '<p style="color:#6c757d;">ยังไม่มีการบันทึกสรุปยอด</p>';
        return;
    }

    let historyHTML = '';
    splitHistory.slice().reverse().forEach((record) => { 
        
        historyHTML += `
            <div class="history-record">
                <h4>บันทึกเมื่อ: ${record.timestamp}</h4>
                <p><strong>ยอดรวมบิล: ${record.grandTotal.toFixed(2)} บาท</strong></p>
                <ul>
                    ${Object.entries(record.friendTotals).map(([friend, amount]) => 
                        `<li>${friend}: ${amount.toFixed(2)} บาท</li>`
                    ).join('')}
                </ul>
                <div class="history-actions">
                    <button class="edit-btn" onclick="editHistoryEntry(${record.id})">✏️ แก้ไข</button>
                    <button class="delete-btn-hist" onclick="deleteHistoryEntry(${record.id})">🗑️ ลบ</button>
                </div>
            </div>
        `;
    });
    historyContainer.innerHTML = historyHTML;
}


// --- 4. คำนวณและแสดงผล ---
function calculateSplit() {
    const summaryOutputDiv = document.getElementById('summaryOutput');

    if (foodItems.length === 0 || friends.length === 0) {
        summaryOutputDiv.innerHTML = '<p style="color:red;">⚠️ กรุณาเพิ่มเพื่อนและรายการอาหารก่อนคำนวณ</p>';
        return;
    }

    // A. คำนวณยอด
    const grandTotal = foodItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const friendTotals = {};
    friends.forEach(friend => friendTotals[friend] = 0);

    foodItems.forEach(item => {
        const numEaters = item.eaters.length;
        if (numEaters > 0) {
            const costPerEater = item.totalPrice / numEaters; 
            item.eaters.forEach(eater => {
                if (friendTotals[eater] !== undefined) {
                    friendTotals[eater] += costPerEater;
                }
            });
        }
    });

    // B. แสดงผลสรุปปัจจุบัน
    let outputHTML = `<p>ยอดรวมค่าอาหารทั้งหมด: <strong>${grandTotal.toFixed(2)} บาท</strong></p><hr>`;
    
    Object.keys(friendTotals).forEach(friend => {
        const total = friendTotals[friend];
        outputHTML += `<p>${friend} ต้องจ่าย: <strong>${total.toFixed(2)} บาท</strong></p>`;
    });
    summaryOutputDiv.innerHTML = outputHTML;
    
    // C. บันทึกประวัติ
    const now = new Date();
    const timestamp = now.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const newRecord = {
        id: historyIdCounter++,
        timestamp: timestamp,
        grandTotal: grandTotal,
        friendTotals: { ...friendTotals },
        initialFriends: friends.slice(),
        initialFoodItems: foodItems.map(item => ({...item, eaters: item.eaters.slice()})) 
    };

    splitHistory.push(newRecord);
    
    // D. อัปเดตรายการประวัติ
    renderHistory();
}

// เริ่มต้นการเรนเดอร์
renderFriendsAndFoodItems();
renderHistory();