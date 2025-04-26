// 创建测试用户脚本
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 连接数据库
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB 连接成功');
    } catch (error) {
        console.error('MongoDB 连接失败:', error);
        process.exit(1);
    }
}

// 用户模型
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
    },
}, { timestamps: true });

// 密码哈希处理
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// 创建测试用户
async function createTestUser() {
    try {
        // 检查用户是否已存在
        const existingUser = await User.findOne({ username: 'admin' });

        if (existingUser) {
            console.log('用户已存在，无需创建');
            return;
        }

        // 创建新用户
        const user = new User({
            username: 'xiaobo',
            password: 'asd19951029.', // 这里设置的是明文密码，将在保存时自动哈希
            name: '管理员',
            email: 'admin@example.com',
            image: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        });

        await user.save();
        console.log('测试用户创建成功');
    } catch (error) {
        console.error('创建用户失败:', error);
    } finally {
        // 断开数据库连接
        mongoose.disconnect();
        console.log('数据库连接已断开');
    }
}

// 执行主函数
async function main() {
    await connectDB();
    await createTestUser();
}

main(); 