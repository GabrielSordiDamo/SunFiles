import { PiGithubLogoBold, PiLinkedinLogoBold } from "react-icons/pi";

interface ContributorProps {
  name: string;
  role: string;
  profile: string;
  contributions: string[];
  socials: {
    linkedin?: string;
    github?: string;
  };
  className?: string;
}

const ContributorCard = ({
  name,
  role,
  profile,
  contributions,
  socials,
  className,
}: ContributorProps) => {
  return (
    <div
      className={`p-4 border rounded-md shadow-md dark:bg-gray-800 dark:border-gray-700 ${className ?? ""}`}
    >
      <a href={profile} target="_blank" rel="noopener noreferrer">
        <h2 className="text-xl font-semibold text-blue-500">{name}</h2>
      </a>
      <p className="text-gray-500">{role}</p>
      <ul className="mt-2 list-disc list-inside text-gray-400">
        {contributions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="flex gap-4 mt-4">
        {socials.linkedin && (
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500"
          >
            <PiLinkedinLogoBold size={24} />
          </a>
        )}
        {socials.github && (
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500"
          >
            <PiGithubLogoBold size={24} />
          </a>
        )}
      </div>
    </div>
  );
};

export default ContributorCard;
