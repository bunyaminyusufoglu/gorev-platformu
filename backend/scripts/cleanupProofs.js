require('dotenv').config();
const path = require('path');
const fs = require('fs');
const connectDB = require('../config/database');
const TaskCompletion = require('../models/TaskCompletion');

const proofsDir = path.join(__dirname, '..', 'uploads', 'proofs');
const RETENTION_DAYS = Number(process.env.PROOF_RETENTION_DAYS || 30);
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

async function cleanup() {
  await connectDB();

  if (!fs.existsSync(proofsDir)) {
    console.log('Proofs klasörü bulunamadı, işlem yok.');
    process.exit(0);
  }

  console.log(`Proof temizliği başlıyor. Süre eşiği: ${RETENTION_DAYS} gün`);

  // Veritabanında referanslı dosyaları topla
  const completions = await TaskCompletion.find({}, { proofImages: 1 }).lean();
  const referenced = new Set();
  completions.forEach((c) => {
    (c.proofImages || []).forEach((p) => {
      // kayıtlar "/uploads/proofs/<file>" formatında
      const basename = path.basename(p);
      referenced.add(basename);
    });
  });

  const now = Date.now();
  const files = fs.readdirSync(proofsDir);
  let removed = 0;

  files.forEach((file) => {
    const fullPath = path.join(proofsDir, file);
    const stat = fs.statSync(fullPath);
    const ageOk = now - stat.mtimeMs > RETENTION_MS;
    const isReferenced = referenced.has(file);

    if (!isReferenced && ageOk) {
      fs.unlinkSync(fullPath);
      removed += 1;
      console.log(`Silindi: ${file}`);
    }
  });

  console.log(`Temizlik tamamlandı. Silinen dosya sayısı: ${removed}`);
  process.exit(0);
}

cleanup().catch((err) => {
  console.error('Temizlik hatası:', err);
  process.exit(1);
});

