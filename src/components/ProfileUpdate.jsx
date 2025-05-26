import { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import '../styles/profileUpdate.scss';

const ProfileUpdate = () => {
    const [userData, setUserData] = useState({
        name: '',
        password: '',
        confirmPassword: '',
        securityAnswer: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [editing, setEditing] = useState(false); // NUEVO

    const navigate = useNavigate();
    const userId = localStorage.getItem('user_id');

    useEffect(() => {
        if (!userId) {
            alert('No se ha encontrado el usuario');
            navigate('/');
            return;
        }

        axios.get(`${apiUrl}/api/employees/${userId}`)
            .then(response => {
                setUserData(prev => ({
                    ...prev,
                    name: response.data.name || '',
                    securityAnswer: response.data.securityAnswer || ''
                }));
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
                alert('No se pudieron cargar los datos del usuario');
            });
    }, [userId, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (userData.password && userData.password !== userData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        try {
            const payload = {
                name: userData.name,
                securityAnswer: userData.securityAnswer,
                ...(userData.password && { password: userData.password })
            };

            await axios.put(`${apiUrl}/api/employees/${userId}`, payload);
            alert('Perfil actualizado correctamente');
            setEditing(false); // Oculta el formulario tras actualizar
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            alert('No se pudo actualizar el perfil');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/");
    };

    return (
        <div className="page-wrapper">
            <div className="profile-update-container">
                <h1>Bienvenido, {userData.name}</h1>

                {!editing ? (
                    <div className="button-group">
                        <button onClick={() => setEditing(true)}>Actualizar Perfil</button>
                        <button onClick={handleLogout}>Cerrar Sesión</button>
                        <button onClick={() => navigate('/dashboard')}>Volver</button>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="profile-form">
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre de usuario"
                            value={userData.name}
                            onChange={handleInputChange}
                            required
                        />

                        <input
                            type="text"
                            name="securityAnswer"
                            placeholder="Nombre de tu primera mascota"
                            value={userData.securityAnswer}
                            onChange={handleInputChange}
                            required
                        />

                        <div className="password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Nueva contraseña (opcional)"
                                value={userData.password}
                                onChange={handleInputChange}
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

                        <div className="password-input">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirmar nueva contraseña"
                                value={userData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            <button
                                type="button"
                                onMouseDown={() => setShowConfirmPassword(true)}
                                onMouseUp={() => setShowConfirmPassword(false)}
                                onMouseLeave={() => setShowConfirmPassword(false)}
                                className="eye-btn"
                            >
                                👁
                            </button>
                        </div>

                        <div className="button-group">
                            <button type="submit">Guardar Cambios</button>
                            <button type="button" onClick={() => setEditing(false)}>Cancelar</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileUpdate;