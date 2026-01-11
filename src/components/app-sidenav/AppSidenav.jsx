import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  FiX,
  FiShield,
  ImStatsDots,
  MdHomeWork,
  MdAddHome,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdAccountBalance,
  RiHomeHeartFill,
  IoChatbubbleOutline,
  FaUserPen,
  FaCoins,
  IoWallet,
} from "../../utils/icons";
import "./appsidenav.css";
import dashBoardLogo from "../../assets/dashboardLogo3.png";

function AppSidenav({ isOpen, setIsOpen }) {
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showInvestorMenu, setShowInvestorMenu] = useState(false);

  const toggleUserProfile = () => {
    setShowUserProfile(!showUserProfile);
  };

  const toggleInvestorMenu = () => {
    setShowInvestorMenu(!showInvestorMenu);
  };

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div
      className={`app-sidenav block max-md:fixed max-md:left-0 max-md:top-0 max-md:w-[80%] max-md:h-full max-md:transition-transform max-md:duration-300 transform z-50 ${
        isOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
      } [&_li]:flex [&_li]:gap-2 font-spartan`}
    >
      <div className="flex items-center justify-between">
        <img src={dashBoardLogo} alt="Graso Logo" className="w-[75px]" />
        <FiX
          size={30}
          onClick={() => setIsOpen(false)}
          className="hidden max-md:flex"
        />
      </div>
      <ul className="text-gray-200">
        <NavLink to="dashboard" onClick={handleItemClick}>
          <li>
            <ImStatsDots />
            <span>Dashboard</span>
          </li>
        </NavLink>

        <NavLink to="explore-properties" onClick={handleItemClick}>
          <li>
            <MdHomeWork />
            <span>Explore Properties</span>
          </li>
        </NavLink>
        
        <NavLink to="add-properties" onClick={handleItemClick}>
          <li>
            <MdAddHome />
            <span>Add Properties</span>
          </li>
        </NavLink>

        {/* Investor Features Section */}
        <li
          onClick={toggleInvestorMenu}
          className="flex justify-between items-center cursor-pointer"
        >
          <div className="flex gap-2">
            <IoWallet />
            <span>Investor</span>
          </div>
          {showInvestorMenu ? (
            <MdKeyboardArrowDown size={20} />
          ) : (
            <MdKeyboardArrowUp size={20} />
          )}
        </li>
        {showInvestorMenu && (
          <ul className="ml-4">
            <NavLink to="investor" onClick={handleItemClick}>
              <li>
                <MdAccountBalance />
                <span>Portfolio & Yield</span>
              </li>
            </NavLink>
            <li onClick={handleItemClick} className="opacity-70">
              <FiShield />
              <span>KYC Status</span>
            </li>
            <li onClick={handleItemClick} className="opacity-70">
              <FaCoins />
              <span>My Tokens</span>
            </li>
          </ul>
        )}

        <li onClick={handleItemClick}>
          <RiHomeHeartFill />
          <span>Transaction</span>
        </li>
        
        <li onClick={handleItemClick}>
          <IoChatbubbleOutline />
          <span>Chat</span>
        </li>

        <li
          onClick={toggleUserProfile}
          className="flex justify-between items-center"
        >
          <div className="flex gap-2">
            <FaUserPen />
            <span>User Profile</span>
          </div>
          {showUserProfile ? (
            <MdKeyboardArrowDown size={20} />
          ) : (
            <MdKeyboardArrowUp size={20} />
          )}
        </li>
        {showUserProfile && (
          <ul className="ml-4">
            <NavLink to="user/profile" onClick={handleItemClick}>
              <li>Profile</li>
            </NavLink>
            <NavLink to="user/profile-settings" onClick={handleItemClick}>
              <li>Profile Settings</li>
            </NavLink>
          </ul>
        )}
      </ul>
    </div>
  );
}

export default AppSidenav;

