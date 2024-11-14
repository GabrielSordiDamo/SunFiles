import ContributorCard from "@/components/ContributorCard/ContributorCard.tsx";

const contributors = [
  {
    name: "Gabriel Sordi Damo",
    role: "Senior Full Stack Engineer",
    profile: "https://www.linkedin.com/in/gabriel-sordi-damo/",
    contributions: ["Project Creator", "Project Maintainer"],

    socials: {
      linkedin: "https://www.linkedin.com/in/gabriel-sordi-damo/",
      github: "https://github.com/GabrielSordiDamo",
    },
  },
];

const ContributorsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <title>Contributors | Project Name</title>
      <meta
        name="description"
        content="Meet the amazing contributors who have helped build and grow our project."
      />

      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center">
        Our Contributors
      </h1>
      <p className="text-lg text-gray-500 dark:text-gray-300 text-center mt-2">
        These talented individuals have played a key role in shaping our
        project.
      </p>

      <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
        {contributors.length > 0 ? (
          contributors.map((contributor) => (
            <ContributorCard
              key={contributor.name}
              {...contributor}
              className="animate-fade-in"
            />
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-300 col-span-full">
            No contributors found. Want to contribute? Contact us!
          </p>
        )}
      </div>

      <div className="mt-12 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Want to Contribute?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          We welcome contributions to improve this project. Whether you want to
          add new features, fix bugs, or improve documentation, we’d love your
          help!
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-4">
          <li>
            Visit the repository on{" "}
            <a
              href="https://github.com/GabrielSordiDamo/SunFiles"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              GitHub
            </a>
          </li>
          <li>Clone the repository and set up the environment.</li>
          <li>Open an issue for new features or bug reports.</li>
          <li>Create a pull request after making your changes.</li>
        </ul>
        <p className="text-gray-600 dark:text-gray-300 mt-4">
          For any questions, feel free to contact through GitHub Discussions or
          the project’s email.
        </p>
        <div className="flex gap-4 mt-6">
          <a
            href="https://github.com/GabrielSordiDamo/SunFiles"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Visit GitHub Repository
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContributorsPage;
