import { Routes, Route, } from "react-router-dom";
import Home from "./components/Home";
import About from "./components/About";
import { NoteProvider } from "./context/notes/NoteContext";
import { AlertProvider } from "./context/AlertContext";
import AddNote from "./components/AddNote";
import PageNotFound from "./components/PageNotFound";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Login from "./components/Login";
import Register from "./components/Register";
import ErrorBoundary from "./components/ErrorBoundary";
import UpdateNotification from "./components/UpdateNotification";
import OfflineAlert from "./components/OfflineAlert";

function App() {

  return (
    <>
      <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
        <NoteProvider>
          <AlertProvider>
            <Routes>
              <Route path="/" index element={<Home />} />
              <Route path="/new" index element={<AddNote />} />
              <Route path="/about" index element={<About />} />
              <Route path="/register" index element={<Register />} />
              <Route path="/login" index element={<Login />} />
              <Route path="/users/password/new" index element={<ForgotPassword />} />
              <Route path="/users/password/edit/:resetToken" index element={< ResetPassword />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <UpdateNotification />
            <OfflineAlert />
          </AlertProvider>
        </NoteProvider>
      </ErrorBoundary>
    </>
  );
}

export default App;
