import ConversionOverview from "@/components/ConversionOverview/ConversionOverview.tsx";
import { NavLink } from "react-router-dom";
import heroImg from "@/assets/imgs/hero.svg";
import Converter from "@/components/Converter/Converter.tsx";
import { Pages } from "@/utils/pages.ts";

const ConverterPage = () => {
  return (
    <div className="flex flex-col gap-y-10">
      <section className="bg-gradient-to-r from-yellow-300 to-amber-500 text-white py-16 px-8 text-center md:text-left dark:bg-gradient-to-r dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              ☀️ Convert Your Files <br /> Without Limits.
            </h1>
            <p className="text-lg md:text-xl mt-4 leading-relaxed">
              Fast. Private. Truly Unlimited. <br />
              With <strong>Sun Files</strong>, your files stay secure on your
              device while you enjoy limitless conversions.
            </p>
            <div className="mt-8 space-x-4">
              <NavLink to={Pages.ABOUT}>
                <button className="bg-primary-500 text-white font-bold text-lg px-6 py-3 rounded-lg shadow-md hover:bg-amber-400 transition-all dark:bg-amber-400 dark:text-gray-900 dark:hover:bg-amber-500">
                  Learn More
                </button>
              </NavLink>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <img
              src={heroImg}
              alt="Sun Files Illustration"
              className="w-full max-w-md"
            />
          </div>
        </div>
      </section>
      <div className="py-5 md:p-8">
        <Converter />
      </div>
      <ConversionOverview />
      <section className="bg-gradient-to-r from-cyan-500 to-blue-700 text-white py-12 px-8 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">
            ⚡ Converting Files at the Speed of Light
          </h2>
          <p className="text-lg md:text-2xl mt-4 leading-relaxed">
            With <strong>Sun Files</strong> you say goodbye to long waits!{" "}
            <br />
          </p>
        </div>
      </section>
    </div>
  );
};

export default ConverterPage;
