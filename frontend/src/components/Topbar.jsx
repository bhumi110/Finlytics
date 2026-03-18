import { useAuth } from "../AuthContext";
import "../styles/layout.css";

const Topbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <div className="topbar">
      <h5 className="topbar-title">{title}</h5>
      <div className="topbar-user">
        Welcome, <strong>{user?.name}</strong>
      </div>
    </div>
  );
};

export default Topbar;