import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./components/login/Login";
import RTOHome from "./components/rto/RTOHome";
import QRCodeScanner from "./components/qrcode/QRCodeScanner";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/qrcode" element={<QRCodeScanner />} />
                <Route path="/rto" element={<RTOHome />} />
            </Routes>
        </>
    );
}

export default App;
