const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ossClient = require('../../config/oss');
const { success, fail } = require('../../utils/response');

// 本地存储配置（OSS未配置时使用）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/' + new Date().toISOString().slice(0, 7);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '_' + Math.random().toString(36).slice(2, 8) + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowed.includes(ext)) {
      return cb(new Error('仅支持 jpg/png/gif/webp 格式'));
    }
    cb(null, true);
  }
});

/**
 * POST /api/admin/upload
 * 文件上传（支持 OSS 或本地存储）
 * FormData: file
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(fail('请选择文件'));
    }

    let fileUrl;

    // 尝试上传到 OSS
    if (ossClient) {
      try {
        const ext = path.extname(req.file.originalname);
        const filename = `courses/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
        const result = await ossClient.put(filename, req.file.path);
        fileUrl = result.url; // OSS 返回完整 HTTPS URL，直接使用
        fs.unlink(req.file.path, () => {});
      } catch (ossErr) {
        console.warn('OSS upload failed, fallback to local:', ossErr.message);
        // 本地存储：只存相对路径，由客户端拼接域名，避免 localhost 硬编码
        fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
      }
    } else {
      // 本地存储：只存相对路径
      fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    res.json(success({ url: fileUrl, filename: req.file.filename }, '上传成功'));
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json(fail(err.message || '上传失败'));
  }
});

module.exports = router;
