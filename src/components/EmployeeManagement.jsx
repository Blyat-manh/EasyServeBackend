import { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import '../styles/employeeManagement.scss';
import { FiHome } from 'react-icons/fi';


const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    name: '', role: '', password: '', confirmPassword: '', securityAnswer: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [updateEmployee, setUpdateEmployee] = useState({
    name: '', role: '', password: '', securityAnswer: ''
  });
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${apiUrl}/api/employees`)
      .then(response => setEmployees(response.data))
      .catch(error => console.error('Error fetching employees:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = () => {
    if (newEmployee.password !== newEmployee.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const { name, role, password, securityAnswer } = newEmployee;

    axios.post(`${apiUrl}/api/employees`, { name, role, password, securityAnswer })
      .then(response => {
        setEmployees(prevEmployees => [...prevEmployees, response.data]);
        setNewEmployee({ name: '', role: '', password: '', confirmPassword: '', securityAnswer: '' });
      })
      .catch(error => console.error('Error adding employee:', error));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateEmployee = () => {
    axios.put(`${apiUrl}/api/employees/${updateEmployee.name}`, updateEmployee)
      .then(response => {
        setEmployees(prevEmployees =>
          prevEmployees.map(employee =>
            employee.name === updateEmployee.name ? response.data : employee
          )
        );
        setUpdateEmployee({ name: '', role: '', password: '', securityAnswer: '' });
        setSelectedEmployee(null);
      })
      .catch(error => console.error('Error updating employee:', error));
  };

  const handleDeleteEmployee = (name) => {
    axios.delete(`${apiUrl}/api/employees/${name}`)
      .then(() => {
        setEmployees(prevEmployees => prevEmployees.filter(employee => employee.name !== name));
      })
      .catch(error => console.error('Error deleting employee:', error));
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setUpdateEmployee({
      name: employee.name,
      role: employee.role,
      password: '',
      securityAnswer: employee.securityAnswer || ''
    });
  };
  const handleCancelUpdate = () => {
    setSelectedEmployee(null);
    setUpdateEmployee({ name: '', role: '', password: '', securityAnswer: '' });
  };


  return (
    <div className="employee-management-container">
      <header className="header">
        <h1>Gestión de Empleados</h1>
        <button className="home-btn" onClick={() => navigate('/dashboard')}>
          <FiHome />
        </button>
      </header>



      {/* Formulario para agregar */}
      <div className="form-section">
        <h2>Agregar Empleado</h2>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          value={newEmployee.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="securityAnswer"
          placeholder="Nombre de su primera mascota"
          value={newEmployee.securityAnswer}
          onChange={handleInputChange}
        />
        <select name="role" value={newEmployee.role} onChange={handleInputChange}>
          <option value="">Escoge un rol</option>
          <option value="encargado">Encargado</option>
          <option value="camarero">Camarero</option>
          <option value="cocina">Cocina</option>
        </select>
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={newEmployee.password}
            onChange={handleInputChange}
          />
          <button
            type="button"
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}
          >
            👁
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirmar Contraseña"
          value={newEmployee.confirmPassword}
          onChange={handleInputChange}
        />
        <button onClick={handleAddEmployee}>Agregar Empleado</button>
      </div>

      {/* Formulario para actualizar */}
      {selectedEmployee && (
        <div className="form-section">
          <h2>Actualizar Empleado: {selectedEmployee.name}</h2>
          <select
            name="role"
            value={updateEmployee.role}
            onChange={handleUpdateInputChange}
          >
            <option value="">Escoge un rol</option>
            <option value="encargado">Encargado</option>
            <option value="camarero">Camarero</option>
            <option value="cocina">Cocina</option>
          </select>
          <input
            type="text"
            name="securityAnswer"
            placeholder="Nombre de su primera mascota"
            value={updateEmployee.securityAnswer}
            onChange={handleUpdateInputChange}
          />
          <div className="password-input">
            <input
              type={showUpdatePassword ? "text" : "password"}
              name="password"
              placeholder="Nueva Contraseña"
              value={updateEmployee.password}
              onChange={handleUpdateInputChange}
            />
            <button
              type="button"
              onMouseDown={() => setShowUpdatePassword(true)}
              onMouseUp={() => setShowUpdatePassword(false)}
              onMouseLeave={() => setShowUpdatePassword(false)}
            >
              👁
            </button>
          </div>
          <button onClick={handleUpdateEmployee}>Actualizar Empleado</button>
          <button onClick={handleCancelUpdate}>Cancelar</button>
        </div>
      )}


      {/* Lista empleados */}
      <ul>
        {employees.map(employee => (
          <li key={employee.name}>
            {employee.name} - {employee.role}
            <button onClick={() => handleSelectEmployee(employee)}>Editar</button>
            <button onClick={() => handleDeleteEmployee(employee.name)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeManagement;
