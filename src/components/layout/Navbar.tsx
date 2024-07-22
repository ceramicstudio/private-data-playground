const Navbar = () => {
  return (
    <nav className="bg-background/70 py-4 backdrop-blur-sm">
      <div className="container flex flex-row items-center justify-center">
        <div className="flex flex-row space-x-2">
          <div className="flex w-full items-center ">
            <w3m-button size="sm" balance="hide" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
