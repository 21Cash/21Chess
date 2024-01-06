import React from "react";

const About = () => {
  return (
    <div>
      <div className="bg-gradient-to-r from-gray-900 to-gray-600 min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">21Chess</h1>
          <p className="mb-10 text-lg">
            21Chess is an Open-source free online chess platform that aims to
            provide a minimalistic, ad-free, and fun experience.
          </p>
          <p className="mb-8 text-lg">
            21Chess is built by 21Cash as a weekend project.
          </p>
          <div className="mt-8">
            <a
              href="https://github.com/21cash/21chess"
              className="mr-6 text-blue-500 text-lg"
            >
              View 21Chess Source Code
            </a>
            <br />
            <br />
            <a
              href="https://github.com/21cash"
              className="text-blue-500 text-lg"
            >
              View My Other Projects
            </a>
          </div>
        </div>
      </div>
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-center py-4">
        <p className="text-gray-400">
          &#169; {new Date().getFullYear()} 21Chess. Made with &#10084;&#65039;
          by 21Cash.{" "}
          <a
            href="https://github.com/21Cash/21Chess"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Source Code
          </a>
        </p>
      </footer>
    </div>
  );
};

export default About;
