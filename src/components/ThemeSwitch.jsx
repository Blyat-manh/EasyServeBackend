import { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import ThemeSwitch from './ThemeSwitch';
import '../styles/login.scss';

const RecoverPassword = ({ theme, setTheme }) => {
    const [username, setUsername] = useState('');
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            await axios.post(`${apiUrl}/api/users/recover-password`, {
                name: username,
                security_answer: securityAnswer,
                new_password: newPassword
            });

            alert("Contraseña actualizada correctamente. Ahora puedes iniciar sesión.");
            navigate('/');
        } catch (error) {
            console.error("Error al recuperar contraseña:", error);
            alert("No se pudo recuperar la contraseña. Verifica los datos ingresados.");
        }
    };

    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="segment" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Recuperar Contraseña</h2>
                    <ThemeSwitch theme={theme} setTheme={setTheme} />
                </div>

                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Nombre de tu primera mascota"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    required
                />

                <div className="password-input">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        aria-label="Mostrar contraseña"
                        onMouseDown={() => setShowPassword(true)}
                        onMouseUp={() => setShowPassword(false)}
                        onMouseLeave={() => setShowPassword(false)}
                        className="eye-btn"
                    >
                        👁
                    </button>
                </div>

                <div className="password-input">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        aria-label="Mostrar confirmación de contraseña"
                        onMouseDown={() => setShowConfirmPassword(true)}
                        onMouseUp={() => setShowConfirmPassword(false)}
                        onMouseLeave={() => setShowConfirmPassword(false)}
                        className="eye-btn"
                    >
                        👁
                    </button>
                </div>

                <button type="submit" className="button">Restablecer Contraseña</button>
                <button type="button" onClick={() => navigate('/')}>Cancelar</button>
            </form>
        </div>
    );
};

export default RecoverPassword;
