import {
  PiLinkedinLogo,
  PiMicrosoftOutlookLogo,
  PiSunBold,
} from "react-icons/pi";

const Footer = () => {
  return (
    <footer className="bg-primary-500 dark:bg-dark-100 text-white dark:text-neutral-50 py-8 transition">
      <div className="max-w-7xl mx-auto ">
        <div className="flex flex-wrap justify-around items-center gap-y-5 md:gap-y-0">
          <div className="flex items-center space-x-2">
            <PiSunBold size={32} className="text-neutral-50" />
            <h1 className="text-lg sm:text-2xl font-semibold tracking-wide text-center">
              Sun Files
            </h1>
          </div>

          <div className="flex flex-col space-y-2 text-center md:text-left">
            <h3 className="text-lg font-semibold">Contact Me</h3>
            <p className="text-neutral-50 dark:text-neutral-300">
              Feel free to reach out for feedback or support!
            </p>
            <div className="flex flex-col items-center justify-center md:flex-row space-x-4 md:justify-start gap-1">
              <a
                href="mailto:gabriel.sordi.damo@gmail.com"
                className="text-white dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition flex gap-x-1"
              >
                <PiMicrosoftOutlookLogo size={24} />{" "}
                gabriel.sordi.damo@gmail.com
              </a>
              <a
                href="https://www.linkedin.com/in/gabriel-sordi-damo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition flex gap-x-1"
              >
                <PiLinkedinLogo size={24} /> LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white dark:border-neutral-700 mt-6 pt-4 text-center text-sm text-neutral-50 dark:text-neutral-400">
          © {new Date().getFullYear()} Sun Files. Sun Vibes.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
