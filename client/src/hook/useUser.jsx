import { login, logout, register } from '../api/user.api.js';
import { useAuth } from '../context/AuthContext.jsx';

const useUser = () => {
  const { setUser } = useAuth();

  const registerUserHandler = async ({ name, email, password }) => {
    const data = await register({ name, email, password });
    setUser(data.data);
    return data.data;
  };

  const loginUserHandler = async ({ email, password }) => {
    const data = await login({ email, password });
    setUser(data.data);
    return data.data;
  };

  const logoutUserHandler = async () => {
    const data = await logout();
    setUser(null);
    return data.data;
  };

  return {
    registerUserHandler,
    loginUserHandler,
    logoutUserHandler,
  };
};

export default useUser;