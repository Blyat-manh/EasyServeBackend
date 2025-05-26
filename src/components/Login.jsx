import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../App';
import '../styles/login.scss';
import ThemeSwitch from "./ThemeSwitch";

const Login = ({ theme, setTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiUrl}/api/users/login`, { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem("user_id", response.data.user_id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const navigateToMenu = () => {
    navigate('/menu');
  };

  const navigateToRecovery = () => {
    navigate('/recover-password');
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleLogin} className="login-form">
        <div className="segment">
          <h2>Iniciar Sesión</h2>
          <ThemeSwitch theme={theme} setTheme={setTheme} />
        </div>

        <div className="login-box">
          <div>
            <label htmlFor="username">Usuario:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password">Contraseña:</label>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
              <button
                type="button"
                onMouseDown={() => setShowPassword(true)}
                onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                className="eye-btn"
              >
                👁
              </button>
            </div>
          </div>

          <div className="segment">
            <button type="submit" className="button">Login</button>
            <button type="button" onClick={navigateToRecovery} className="button gray">¿Olvidaste tu contraseña?</button>
          </div>
        </div>

        <div className="segment">
          <button type="button" onClick={navigateToMenu} className="button red">Ver Menú</button>
        </div>
      </form>

    </div>
  );
};

export default Login;
