import { useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { PiLinkedinLogoBold, PiSunBold, PiMoonBold } from "react-icons/pi";
import { HiMenu, HiX } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { Pages } from "@/utils/pages.ts";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <Disclosure
      as="header"
      className="bg-primary-500 dark:bg-dark-100 text-neutral-50 dark:text-neutral-50 shadow-md transition"
    >
      {({ open }) => (
        <>
          <div className="flex items-center justify-between px-4 sm:px-8 py-4">
            <DisclosureButton
              className="sm:hidden p-2 rounded-md text-neutral-50 hover:bg-primary-600 dark:hover:bg-dark-200 transition"
              aria-label="Toggle Menu"
            >
              {open ? <HiX size={24} /> : <HiMenu size={24} />}
            </DisclosureButton>

            <div className="flex items-center space-x-2">
              <PiSunBold size={32} className="text-neutral-50" />
              <h1 className="text-lg sm:text-2xl font-semibold tracking-wide">
                Sun Files
              </h1>
            </div>

            <div className="hidden sm:flex items-center space-x-6">
              <NavLink
                to={Pages.CONVERTER}
                className="text-neutral-50 dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="Converter"
              >
                Converter
              </NavLink>

              <NavLink
                to={Pages.ABOUT}
                className="text-neutral-50 dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="About"
              >
                About
              </NavLink>
              <NavLink
                to={Pages.CONTRIBUTORS}
                className="text-neutral-50 dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="Contributors"
              >
                Contributors
              </NavLink>

              <button
                onClick={toggleDarkMode}
                aria-label="Toggle Dark Mode"
                className="p-2 rounded-full bg-dark-100 text-secondary-50 dark:bg-neutral-50 dark:text-primary-500 transition"
              >
                {darkMode ? <PiSunBold size={24} /> : <PiMoonBold size={24} />}
              </button>
              <a
                href="https://www.linkedin.com/in/gabriel-sordi-damo/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="LinkedIn Profile"
              >
                <PiLinkedinLogoBold size={42} />
              </a>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <nav className="flex flex-col space-y-4 px-4 py-4 bg-primary-400 dark:bg-dark-200">
              <NavLink
                to={Pages.CONVERTER}
                className="text-neutral-50 dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="Converter"
              >
                Converter
              </NavLink>

              <NavLink
                to={Pages.ABOUT}
                className="text-neutral-50 dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="About"
              >
                About
              </NavLink>

              <NavLink
                to={Pages.CONTRIBUTORS}
                className="text-neutral-50 dark:text-neutral-50 hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="Contributors"
              >
                Contributors
              </NavLink>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-dark-100 text-secondary-50 dark:bg-neutral-50 dark:text-primary-500  transition flex items-center "
                aria-label="Toggle Dark Mode"
              >
                {darkMode ? <PiSunBold size={24} /> : <PiMoonBold size={24} />}
                <span className="text-md font-medium flex-1">
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
              </button>

              <a
                href="https://www.linkedin.com/in/gabriel-sordi-damo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-min hover:text-accent-100 dark:hover:text-dark-accent transition"
                aria-label="LinkedIn Profile"
              >
                <PiLinkedinLogoBold size={42} />
              </a>
            </nav>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
