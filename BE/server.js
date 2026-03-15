const express = require('express');
const mysql = require('mysql2');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors()); // Phải nằm trên cùng
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Thêm dòng này để hỗ trợ FormData tốt hơn
// 1. Kết nối MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
}).promise();

// 2. Cấu hình AWS S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // Giới hạn 50MB
});
// Middleware kiểm tra thẻ Token (Xác thực người dùng)
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Bạn chưa đăng nhập!" });

    try {
        // Cắt bỏ chữ "Bearer " để lấy đúng mã token
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Lưu thông tin người dùng vào req để các API bên dưới dùng
        next(); // Cho phép đi tiếp vào API
    } catch (error) {
        res.status(403).json({ error: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};
// ---------------------------------------------------------
// API: ĐĂNG KÝ TÀI KHOẢN
// ---------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, fullname } = req.body;

        // Kiểm tra xem user đã tồn tại chưa
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) return res.status(400).json({ error: "Tên đăng nhập đã tồn tại!" });

        // Mã hóa mật khẩu (Hash)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Lưu vào DB
        await db.query('INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)', 
            [username, hashedPassword, fullname]);

        res.json({ success: true, message: "Đăng ký thành công!" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi server" });
    }
});

// ---------------------------------------------------------
// API: ĐĂNG NHẬP
// ---------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Tìm user trong DB
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(400).json({ error: "Sai tên đăng nhập hoặc mật khẩu!" });

        const user = users[0];

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Sai tên đăng nhập hoặc mật khẩu!" });

        // Tạo thẻ ra vào (Token) chứa id và tên của người đó
        const token = jwt.sign(
            { id: user.id, fullname: user.fullname }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } // Token sống được 7 ngày
        );

        res.json({ 
            success: true, 
            token: token, 
            user: { id: user.id, fullname: user.fullname, avatar_url: user.avatar_url } 
        });
    } catch (error) {
        res.status(500).json({ error: "Lỗi server" });
    }
});
// --- CÁC ĐƯỜNG DẪN API ---

// API 1: Lấy danh sách ảnh từ MySQL
app.get('/api/photos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM photos ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 2: Upload ảnh lên S3 và lưu link vào MySQL
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        const caption = req.body.caption || 'No caption';
        const fileName = `uploads/${Date.now()}-${file.originalname}`;

        // Đẩy file lên S3
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Tạo URL công khai (Sau khi bạn đã thiết lập Bucket là Public)
        const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

        // Lưu vào MySQL
        await db.query('INSERT INTO photos (url, caption) VALUES (?, ?)', [imageUrl, caption]);

        res.json({ success: true, url: imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi upload ảnh' });
    }
});

app.get('/api/guestbook', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM guestbook ORDER BY created_at DESC');
    res.json(rows);
});

// Gửi lời chúc
app.post('/api/guestbook', async (req, res) => {
    const { sender_name, message } = req.body;
    await db.query('INSERT INTO guestbook (sender_name, message) VALUES (?, ?)', [sender_name, message]);
    res.json({ success: true });
});
// ---------------------------------------------------------
// API: THÊM HOẠT ĐỘNG MỚI
// ---------------------------------------------------------
app.post('/api/activities', verifyToken, upload.single('image'), async (req, res) => {
    try {
        const { content } = req.body;
        const author_name = req.user.fullname; // Lấy tên từ Token đã giải mã
        let imageUrl = null;

        // Nếu có file ảnh được gửi kèm
        if (req.file) {
            const file = req.file;
            const fileName = `activities/${Date.now()}-${file.originalname}`;

            const uploadParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                // ACL: 'public-read' // Mở dòng này nếu bucket của bạn cho phép ACL
            };

            // Đẩy ảnh lên S3
            await s3Client.send(new PutObjectCommand(uploadParams));

            // Tạo đường dẫn ảnh
            imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        }

        // Lưu thông tin vào MySQL
        const query = 'INSERT INTO activities (content, image_url, author_name) VALUES (?, ?, ?)';
        const [result] = await db.query(query, [content, imageUrl, author_name]);

        res.status(201).json({ 
            success: true, 
            message: "Đăng bài thành công!",
            postId: result.insertId 
        });

    } catch (error) {
        console.error("Lỗi API Activities:", error);
        res.status(500).json({ error: "Không thể đăng bài lúc này." });
    }
});

// ---------------------------------------------------------
// API: LẤY DANH SÁCH HOẠT ĐỘNG
// ---------------------------------------------------------
app.get('/api/activities', async (req, res) => {
    console.log("API GET /api/activities được gọi");
    try {
        const [rows] = await db.query('SELECT * FROM activities ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// API: Lấy bình luận của một bài đăng cụ thể
app.get('/api/activities/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM comments WHERE activity_id = ? ORDER BY created_at ASC', 
            [id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Gửi bình luận mới
app.post('/api/activities/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { author_name, content } = req.body;
        await db.query(
            'INSERT INTO comments (activity_id, author_name, content) VALUES (?, ?, ?)',
            [id, author_name || 'Bạn học', content]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// API: Tăng lượt thích cho bài viết
app.post('/api/activities/:id/like', async (req, res) => {
    try {
        const { id } = req.params;
        // Tăng giá trị likes_count lên 1
        await db.query('UPDATE activities SET likes_count = likes_count + 1 WHERE id = ?', [id]);
        
        // Lấy lại số lượng like mới để trả về cho giao diện
        const [rows] = await db.query('SELECT likes_count FROM activities WHERE id = ?', [id]);
        
        res.json({ success: true, likes_count: rows[0].likes_count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// ==========================================
// API: LẤY DANH SÁCH LƯU BÚT (Ai cũng xem được)
// ==========================================
app.get('/api/guestbook', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM guestbook ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// API: GỬI LƯU BÚT MỚI (Bắt buộc đăng nhập)
// ==========================================
app.post('/api/guestbook', verifyToken, async (req, res) => {
    try {
        const { message, sender_name } = req.body;
        
        // 1. Kiểm tra xem verifyToken có hoạt động đúng không
        console.log("Dữ liệu user từ Token:", req.user); 
        
        // 2. Lấy tên (Cẩn thận: Kiểm tra xem lúc tạo token bạn dùng 'fullname' hay 'fullName')
        // const sender_name = req.user.fullname || req.user.username || 'Không xác định'; 
        
        console.log("Tên sẽ được lưu vào DB:", sender_name);
        console.log("Lời chúc:", message);

        if (!message) return res.status(400).json({ error: "Vui lòng nhập lời chúc!" });

        // 3. Thực hiện lưu vào Database
        await db.query(
            'INSERT INTO guestbook (sender_name, message) VALUES (?, ?)', 
            [sender_name, message]
        );
        
        console.log("Đã lưu thành công vào Database!");
        res.status(201).json({ success: true, message: "Đã gửi lưu bút thành công!" });
    } catch (error) {
        console.error("Lỗi API Guestbook:", error);
        res.status(500).json({ error: error.message });
    }
});
app.listen(5001, () => console.log('✅ Server đang chạy tại http://localhost:5001'));