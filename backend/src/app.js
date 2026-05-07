require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { sequelize } = require('./models');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传的图片等）
const path = require('path');
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

// 路由
app.use('/api', routes);

// 健康检查
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误',
    data: null
  });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // 自动同步表结构（不强制重建，安全添加新列）
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    // 数据迁移：将「油画」分类改为「全部」
    const { Category } = require('./models');
    const oilCat = await Category.findOne({ where: { name: '油画' } });
    if (oilCat) {
      await oilCat.update({ name: '全部', icon: '✨' });
      console.log('Category "油画" renamed to "全部".');
    }
  } catch (e) {
    console.warn('DB sync warning:', e.message);
  }
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start();
