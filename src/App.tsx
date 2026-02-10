import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { FileBrowser } from "./pages/FileBrowser";
import { Translation } from "./pages/Translation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="files" element={<FileBrowser />} />
          <Route path="translate" element={<Translation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
