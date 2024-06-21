import React from "react";
import MainFooter from "../components/MainFooter";

const About = () => {
  return (
    <div>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-10">21Chess</h1>
          <p className="mb-10 text-lg">
            21Chess is an online chess platform that aims to provide a
            minimalistic and fun experience.
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
      <div>
        <MainFooter />
      </div>
    </div>
  );
};

export default About;
