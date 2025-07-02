const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// プレイヤーの初期設定
let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 5,
};

// 弾を格納する配列
let bullets = [];
const bulletSpeed = 7;
const bulletWidth = 5;
const bulletHeight = 15;

// 敵を格納する配列
let enemies = [];
const enemySpeed = 2;
const enemyWidth = 50;
const enemyHeight = 50;
let enemySpawnTimer = 0;
const enemySpawnInterval = 120; // 敵が出現する間隔

// アイテムを格納する配列
let items = [];
const itemSpeed = 3;
const itemWidth = 20;
const itemHeight = 20;

// ゲームの状態
let score = 0;
let gameOver = false;
let powerUpActive = false;
let powerUpTimer = 0;
const powerUpDuration = 300; // パワーアップの効果時間 (フレーム数)


// 押されているキーを記録するオブジェクト
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
};

// プレイヤーを描画する関数
function drawPlayer() {
    ctx.fillStyle = powerUpActive ? 'cyan' : 'white'; // パワーアップ中は色を変える
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// 弾を描画する関数
function drawBullets() {
    ctx.fillStyle = 'yellow';
    for (const bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// 敵を描画する関数
function drawEnemies() {
    ctx.fillStyle = 'red';
    for (const enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

// アイテムを描画する関数
function drawItems() {
    ctx.fillStyle = 'blue';
    for (const item of items) {
        ctx.fillRect(item.x, item.y, item.width, item.height);
    }
}

// スコアを描画する関数
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// ゲームオーバーメッセージを描画する関数
function drawGameOver() {
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '24px Arial';
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2);
}

// ゲームをリスタートする関数
function restartGame() {
    gameOver = false;
    score = 0;
    powerUpActive = false;
    powerUpTimer = 0;
    player = {
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        width: 50,
        height: 50,
        speed: 5,
    };
    bullets = [];
    enemies = [];
    items = [];
    enemySpawnTimer = 0;
    gameLoop();
}


// キーが押されたときの処理
document.addEventListener('keydown', (e) => {
    if (gameOver && e.key === 'Enter') {
        restartGame();
        return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = true;
    }
    // スペースキーが押されたら弾を発射
    if (e.key === ' ' && !gameOver) { // ' ' is the space key
        const bulletX = player.x + player.width / 2 - bulletWidth / 2;
        const bulletY = player.y;

        if (powerUpActive) {
            // 3方向弾
            bullets.push({ x: bulletX, y: bulletY, width: bulletWidth, height: bulletHeight, dx: -2, dy: -bulletSpeed });
            bullets.push({ x: bulletX, y: bulletY, width: bulletWidth, height: bulletHeight, dx: 0, dy: -bulletSpeed });
            bullets.push({ x: bulletX, y: bulletY, width: bulletWidth, height: bulletHeight, dx: 2, dy: -bulletSpeed });
        } else {
            // 通常弾
            bullets.push({ x: bulletX, y: bulletY, width: bulletWidth, height: bulletHeight, dx: 0, dy: -bulletSpeed });
        }
    }
});

// キーが離されたときの処理
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = false;
    }
});

// プレイヤーの位置を更新する関数
function updatePlayerPosition() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// 弾��位置を更新する関数
function updateBulletsPosition() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // 弾が画面外に出たら削除
        if (bullet.y < 0 || bullet.x < 0 || bullet.x > canvas.width) {
            bullets.splice(i, 1);
        }
    }
}

// 敵を生成する関数
function spawnEnemy() {
    enemySpawnTimer++;
    if (enemySpawnTimer >= enemySpawnInterval) {
        enemySpawnTimer = 0;
        const x = Math.random() * (canvas.width - enemyWidth);
        enemies.push({
            x: x,
            y: -enemyHeight,
            width: enemyWidth,
            height: enemyHeight,
        });
    }
}

// 敵の位置を更新する関数
function updateEnemiesPosition() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.y += enemySpeed;

        // 敵が画面外に出たら削除
        if (enemy.y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

// アイテムを生成する関数
function spawnItem(x, y) {
    items.push({ x, y, width: itemWidth, height: itemHeight });
}

// アイテムの位置を更新する関数
function updateItemsPosition() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y += itemSpeed;

        // アイテムが画面外に出たら削除
        if (item.y > canvas.height) {
            items.splice(i, 1);
        }
    }
}

// パワーアップの状態を更新する関数
function updatePowerUpState() {
    if (powerUpActive) {
        powerUpTimer--;
        if (powerUpTimer <= 0) {
            powerUpActive = false;
        }
    }
}

// 当たり判定をチェックする関数
function checkCollisions() {
    // 弾と敵の当たり判定
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            const bullet = bullets[i];
            const enemy = enemies[j];

            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // 確率でアイテムをドロップ
                if (Math.random() < 0.2) { // 20%の確率
                    spawnItem(enemy.x, enemy.y);
                }

                // 当たったら弾と敵を削除
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                score += 10; // スコアを加算
                // この弾はもうないので、内側のループを抜ける
                break;
            }
        }
    }

    // 敵とプレイヤーの当たり判定
    for (const enemy of enemies) {
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            gameOver = true;
            break;
        }
    }

    // アイテムとプレイヤーの当たり判定
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
        ) {
            items.splice(i, 1);
            powerUpActive = true;
            powerUpTimer = powerUpDuration;
        }
    }
}


console.log('ゲームを開始します');

// ゲームループ
function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return; // ゲームオーバーならループを停止
    }

    // 画面���クリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 更新処理
    updatePlayerPosition();
    updateBulletsPosition();
    spawnEnemy();
    updateEnemiesPosition();
    updateItemsPosition();
    updatePowerUpState();
    checkCollisions();


    // 描画処理
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawItems();
    drawScore();


    requestAnimationFrame(gameLoop);
}

gameLoop();


