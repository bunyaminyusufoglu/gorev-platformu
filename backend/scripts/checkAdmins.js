const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const changeAdminPassword = async (email, newPassword) => {
  try {
    // Veritabanına bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı\n');

    // Admin kullanıcısını bul (şifre ile birlikte)
    const admin = await User.findOne({ email: email.toLowerCase(), role: 'admin' })
      .select('+password');

    if (!admin) {
      console.log(`❌ Email adresi "${email}" ile admin kullanıcısı bulunamadı.`);
      console.log('\n💡 Lütfen geçerli bir admin email adresi girin.');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Şifre validasyonu
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Şifre en az 6 karakter olmalıdır.');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Şifreyi değiştir
    console.log(`Admin bulundu: ${admin.name} (${admin.email})`);
    console.log('Şifre değiştiriliyor...\n');

    admin.password = newPassword;
    await admin.save();

    console.log('✅ Şifre başarıyla değiştirildi!');
    console.log(`\nYeni şifre ile giriş yapabilirsiniz.`);

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('\n✓ İşlem tamamlandı');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

const checkAdmins = async () => {
  try {
    // Veritabanına bağlan
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı\n');

    // Admin kullanıcılarını bul
    const admins = await User.find({ role: 'admin' })
      .select('-password -refreshToken')
      .sort({ createdAt: 1 });

    console.log('=== KAYITLI ADMIN KULLANICILARI ===\n');
    
    if (admins.length === 0) {
      console.log('❌ Veritabanında kayıtlı admin kullanıcısı bulunamadı.');
      console.log('\n💡 Admin oluşturmak için:');
      console.log('   1. Bir kullanıcı oluşturun (normal kayıt ile)');
      console.log('   2. Admin panelinden kullanıcının rolünü "Admin" olarak değiştirin');
      console.log('   VEYA');
      console.log('   MongoDB\'de direkt olarak kullanıcının role alanını "admin" yapın');
    } else {
      console.log(`✅ Toplam ${admins.length} admin kullanıcısı bulundu:\n`);
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Admin Bilgileri:`);
        console.log(`   ID: ${admin._id}`);
        console.log(`   İsim: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Kayıt Tarihi: ${admin.createdAt}`);
        console.log(`   Bakiye: ${admin.balance} ₺`);
        console.log(`   Toplam Kazanç: ${admin.totalEarned} ₺`);
        console.log(`   Yasaklı: ${admin.isBanned ? 'Evet' : 'Hayır'}`);
        console.log('');
      });
    }

    // Toplam admin sayısını da göster
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    console.log('=== İSTATİSTİKLER ===');
    console.log(`Toplam Admin: ${totalAdmins}`);
    console.log(`Toplam Kullanıcı: ${totalUsers}`);
    console.log(`Toplam: ${totalAdmins + totalUsers}`);

    console.log('\n=== KULLANIM ===');
    console.log('Admin şifresini değiştirmek için:');
    console.log('  npm run check-admins <email> <yeni-şifre>');
    console.log('Örnek: npm run check-admins admin@example.com yeniSifre123');

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('\n✓ İşlem tamamlandı');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Komut satırı argümanlarını kontrol et
const args = process.argv.slice(2);

if (args.length === 2) {
  // Şifre değiştirme modu
  const [email, newPassword] = args;
  changeAdminPassword(email, newPassword);
} else {
  // Admin listeleme modu
  checkAdmins();
}

