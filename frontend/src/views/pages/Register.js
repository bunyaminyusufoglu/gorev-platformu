import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../controllers/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validasyon
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Lütfen tüm alanları doldurunuz');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    setIsLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setFormError(result.message || 'Kayıt başarısız');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="card-title text-center mb-3">Kayıt Ol</h2>
              <p className="text-muted text-center mb-4">Yeni hesap oluşturun</p>

              {(formError || authError) && (
                <div className="alert alert-danger" role="alert">
                  {formError || authError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">İsim</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="En az 6 karakter"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">Şifre Tekrar</label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Şifrenizi tekrar girin"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                </button>
              </form>

              <p className="text-center mt-4 mb-0">
                Zaten hesabınız var mı? <Link to="/login">Giriş yap</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

