import React from "react";

const MainFooter = () => {
  return (
    <div>
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

export default MainFooter;
