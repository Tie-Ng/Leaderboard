const ADMIN_SECRET = "huytien@123"; // Mã xác thực admin

function checkAdmin() {
    const key = document.getElementById("adminKey").value;
    if (key === ADMIN_SECRET) {
        document.getElementById("admin-controls").classList.remove("hidden");
        document.getElementById("admin-login").classList.add("hidden");
        loadLeaderboard(); // Load lại để hiển thị nút admin
    } else {
        alert("❌ Sai mã admin!");
    }
}

function loadLeaderboard() {
    const leaderboardDiv = document.getElementById("leaderboard");
    leaderboardDiv.innerHTML = "<p class='text-gray-400'>Đang tải...</p>";

    db.collection("users").orderBy("points", "desc").get().then(snapshot => {
        let i = 0;
        leaderboardDiv.innerHTML = "<ul class='space-y-2'>";
        const docs = snapshot.docs;
        const total = docs.length;

        docs.forEach((doc, index) => {
            const data = doc.data();
            const rank = index + 1;

            let itemClass = "bg-gray-700";

            if (rank === 1) {
                itemClass = "bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 animate-pulse text-black font-bold shadow-lg";
            } else if (rank === total) {
                itemClass = "bg-red-800 text-white italic animate-shake";
            }

            leaderboardDiv.innerHTML += `
    <li class="flex justify-between items-center ${itemClass} px-4 py-2 rounded transition-all">
      <span>#${rank} <strong>${data.name}</strong></span>
      <span>${data.points ?? 0} điểm ${showAdminControls(doc.id)}</span>
    </li>`;
        });


        leaderboardDiv.innerHTML += "</ul>";
    }).catch(err => {
        console.error("❌ Lỗi khi load bảng xếp hạng:", err);
        leaderboardDiv.innerHTML = "<p class='text-red-400'>Không thể tải danh sách.</p>";
    });
}
function addPlayer() {
    const name = document.getElementById("playerName").value.trim();
    const points = parseInt(document.getElementById("playerPoints").value, 10);
    const password = document.getElementById("playerPassword").value.trim();

    if (!name || isNaN(points) || !password) {
        alert("⚠️ Vui lòng nhập đầy đủ tên, điểm và mật khẩu!");
        return;
    }

    db.collection("users").add({ name, points, password }).then(() => {
        alert("✅ Đã thêm người chơi!");
        document.getElementById("playerName").value = "";
        document.getElementById("playerPoints").value = "";
        document.getElementById("playerPassword").value = "";
        loadLeaderboard();
    }).catch(err => {
        console.error("❌ Lỗi khi thêm người chơi:", err);
        alert("Không thể ghi vào Firestore.");
    });
}


function updatePoints(id, delta) {
    const ref = db.collection("users").doc(id);
    ref.get().then(doc => {
        const currentPoints = doc.data().points ?? 0;
        const newPoints = currentPoints + delta;
        ref.update({ points: newPoints }).then(loadLeaderboard);
    }).catch(err => {
        console.error("❌ Lỗi khi cập nhật điểm:", err);
    });
}

function setPoints(id) {
    const newPoints = prompt("🔧 Nhập điểm mới:");
    const parsed = parseInt(newPoints, 10);
    if (newPoints !== null && !isNaN(parsed)) {
        db.collection("users").doc(id).update({ points: parsed }).then(loadLeaderboard);
    } else {
        alert("⚠️ Điểm không hợp lệ!");
    }
}
function editName(id) {
    const password = prompt("🔒 Nhập mật khẩu để đổi tên:");
    if (!password) return;

    const newName = prompt("✏️ Nhập tên mới:");
    if (!newName) return;

    const ref = db.collection("users").doc(id);
    ref.get().then(doc => {
        const data = doc.data();
        if (data.password === password) {
            ref.update({ name: newName }).then(() => {
                alert("✅ Đã cập nhật tên!");
                loadLeaderboard();
            });
        } else {
            alert("❌ Sai mật khẩu!");
        }
    }).catch(err => {
        console.error("❌ Lỗi khi xác minh mật khẩu:", err);
    });
}


function showAdminControls(id) {
    const isAdmin = !document.getElementById("admin-controls").classList.contains("hidden");

    let controls = `
    <button onclick="editName('${id}')" class="text-blue-400 hover:text-blue-600 ml-1">✏️</button>
  `;

    if (isAdmin) {
        controls += `
      <button onclick="updatePoints('${id}', 1)" class="text-green-400 hover:text-green-600 ml-2">➕</button>
      <button onclick="updatePoints('${id}', -1)" class="text-red-400 hover:text-red-600 ml-1">➖</button>
      <button onclick="setPoints('${id}')" class="text-yellow-400 hover:text-yellow-500 ml-1">📝</button>
    `;
    }

    return controls;
}


// Tải danh sách khi mở trang
loadLeaderboard();
