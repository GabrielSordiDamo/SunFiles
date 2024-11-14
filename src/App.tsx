import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BasePageLayout from "@/pages/BasePageLayout/BasePageLayout.tsx";
import ConverterPage from "@/pages/ConverterPage/ConverterPage.tsx";
import AboutPage from "@/pages/AboutPage/AboutPage.tsx";
import ContributorsPage from "@/pages/ContributorsPage/ContributorsPage.tsx";
import { Pages } from "@/utils/pages.ts";

function App() {
  return (
    <BrowserRouter basename="/SunFiles/">
      <BasePageLayout>
        <Routes>
          <Route path={Pages.CONVERTER} element={<ConverterPage />} />
          <Route path={Pages.ABOUT} element={<AboutPage />} />
          <Route path={Pages.CONTRIBUTORS} element={<ContributorsPage />} />
        </Routes>
      </BasePageLayout>
    </BrowserRouter>
  );
}

export default App;
