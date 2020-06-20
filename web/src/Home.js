import React from "react";

const Home = ({ onCreate }) => {
  return (
    <div className="flex flex-col items-center mt-8">
      <div className="bg-gray-100 w-5/6 md:w-2/3 p-4">
        <div className="space-y-8">
          <h1 className="text-3xl text-gray-500 text-center">
            Ready, Set, Mob!
          </h1>
          <div className="flex justify-center">
            <button
              className="bg-blue-500 rounded-sm py-5 px-12 text-xl text-gray-100"
              onClick={onCreate}
            >
              New Mob
            </button>
          </div>
          <div>
            <h2 className="text-center">Your Previous Mobs</h2>
            <p className="text-center">list here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
