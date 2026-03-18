import { BrowserRouter } from "react-router-dom";
import { AuthProvider }  from "./AuthContext";
import Router            from "./Router";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </BrowserRouter>
);

export default App;