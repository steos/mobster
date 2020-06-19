const Home = ({ onCreate }) => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl text-gray-500 text-center m-8">
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
  );
};

export default Home;
