// App.jsx — Updated routes: / = Landing, /console = RiskConsole
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing          from "./pages/Landing";
import RiskConsole      from "./pages/RiskConsole";
import Merchants        from "./pages/Merchants";
import MerchantDetail   from "./pages/MerchantDetail";
import ReviewQueue      from "./pages/ReviewQueue";
import ScoreTransaction from "./pages/ScoreTransaction";
import Audit            from "./pages/Audit";
import RingGraph        from "./pages/RingGraph";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Landing />}           />
        <Route path="/console"             element={<RiskConsole />}       />
        <Route path="/merchants"           element={<Merchants />}         />
        <Route path="/merchants/:id"       element={<MerchantDetail />}    />
        <Route path="/queue"               element={<ReviewQueue />}       />
        <Route path="/score"               element={<ScoreTransaction />}  />
        <Route path="/audit"               element={<Audit />}             />
        <Route path="/ring-graph"          element={<RingGraph />}         />
      </Routes>
    </BrowserRouter>
  );
}
