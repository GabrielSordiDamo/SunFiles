import { NavLink } from "react-router-dom";
import { Pages } from "@/utils/pages.ts";

const AboutPage = () => {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <section className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white dark:from-gray-900 dark:to-gray-800 dark:text-gray-100 py-16 px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Learn More About <br />{" "}
          <span className="text-gray-800 dark:text-amber-400">Sun Files</span>
        </h1>
        <p className="text-lg md:text-xl mt-4 leading-relaxed">
          Discover the technology behind Sun Files, how it works
        </p>
      </section>

      <section className="py-16 px-8 text-center md:text-left">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            How Traditional File Converters Work
          </h2>
          <p className="text-lg leading-relaxed">
            Most file converters require uploading your files to a server. The
            server performs the conversion, processes your data, and sends it
            back. While this method works, it has significant downsides:
          </p>
          <ul className="mt-6 list-disc list-inside space-y-4">
            <li>
              <strong>Privacy Concerns:</strong> Your files are sent to external
              servers, risking data exposure.
            </li>
            <li>
              <strong>Limited Speed:</strong> File conversion depends on server
              capacity and internet speed.
            </li>
            <li>
              <strong>Hidden Costs:</strong> Many platforms impose file size
              limits or require subscriptions for larger files.
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-gray-900 dark:bg-gray-800 text-gray-100 py-16 px-8 text-center md:text-left">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">How Sun Files Works</h2>
          <p className="text-lg leading-relaxed">
            Sun Files takes a completely different approach to file conversion:
          </p>
          <ul className="mt-6 list-disc list-inside space-y-4">
            <li>
              <strong>100% Browser Based:</strong> File conversion happens
              directly in your browser using advanced technologies like Web
              Workers. Your files never leave your device.
            </li>
            <li>
              <strong>High Performance:</strong> By leveraging modern browser
              capabilities, Sun Files ensures fast and efficient processing
              without relying on external servers.
            </li>
            <li>
              <strong>Unlimited Usage:</strong> No file size limits, no
              subscriptions, and no hidden costs.
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-amber-500 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-16 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Transforming the Way You Convert Files
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Enhanced Privacy</h3>
              <p className="mt-4">
                Your files stay on your device, ensuring complete privacy and
                security. No external servers mean no risk of leaks.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Unmatched Speed</h3>
              <p className="mt-4">
                Sun Files processes files directly in your browser, avoiding
                delays caused by server based systems.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Unlimited Conversions</h3>
              <p className="mt-4">
                Convert as many files as you need without worrying about file
                size limits or subscriptions.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Environmentally Friendly</h3>
              <p className="mt-4">
                By eliminating server reliance, Sun Files reduces energy
                consumption, contributing to a greener planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 dark:bg-gray-900 text-gray-100 py-12 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold">Ready to Try Sun Files?</h2>
          <p className="mt-4 text-lg">
            Experience fast, private, and unlimited file conversions today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
            <NavLink to={Pages.CONVERTER}>
              <button className="bg-amber-400 text-gray-900 font-bold text-lg px-6 py-3 rounded-lg shadow-md hover:bg-amber-400 dark:hover:bg-amber-600 transition">
                Start Converting Now
              </button>
            </NavLink>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-2xl font-semibold">Sun Files, Sun Vibes ☀️</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
