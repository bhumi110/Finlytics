import { BrowserRouter } from "react-router-dom";
import { AuthProvider }  from "./AuthContext";
import Router            from "./Router";
import { NotificationProvider } from "./NotificationContext";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <NotificationProvider>
      <Router />
      </NotificationProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;