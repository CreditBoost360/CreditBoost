import { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { MdDashboard } from "react-icons/md";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { BsRobot } from "react-icons/bs";
import { Shield } from "lucide-react";
import ControlImg from "/control.png"
import LogoDark from "/logo_d.png"
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, Menus }) => {
    // Get current location
    const location = useLocation();

    const { logout } = useContext(AppContext)
    const [open, setOpen] = useState(isOpen);

    // Add Credit Passport to the menu items
    const updatedMenus = [
        ...Menus.slice(0, 3), // Keep the first 3 items (Dashboard, Credit Score, Upload Data)
        {
            title: "Credit Passport",
            icon: <Shield size={18} />,
            link: "/credit-passport"
        },
        ...Menus.slice(3) // Keep the rest of the items
    ];

    useEffect(() => {
        setOpen(isOpen);
    }, [isOpen]);

    return (
        <div className={`sticky md:block`}>
            <div className={`${open ? "w-60" : "w-20"} h-screen p-4 flex flex-col justify-between relative duration-300`}>
                <ul className="sideBar flex flex-col relative overflow-y-auto custom-scrollbar">
                    <li className="flex ml-[1em] flex-row gap-3 mb-10 items-center">
                        <p className="font-semibold">Credit<span className="text-pink-400">Boost</span></p>
                    </li>
                    
                    {updatedMenus.map((Menu, index) => (
                        <li
                            key={index}
                            className={`flex w-full cursor-pointer hover:bg-light-white text-sm items-center 
                            ${Menu.gap ? "absolute bottom-6" : "mt-2"} ${Menu.link === location.pathname && "active"}`}
                            onClick={Menu.action}
                        >
                            {Menu.action ? (
                                <div onClick={Menu.action} className="flex h-[2.75em] w-full menuItems md:text-base font-semibold items-center ">
                                    <div className="icon">{Menu.icon}</div>
                                    <span className={`${!open && "hidden"} origin-left duration-200`}>
                                        {Menu.title}
                                    </span>
                                </div>
                            ) : (
                                <Link to={Menu.link} className="flex menuItems h-[2.75em] w-full md:text-base font-semibold items-center">
                                    <div className="icon">{Menu.icon}</div>
                                    <span className={`${!open && "hidden"} origin-left duration-200`}>
                                        {Menu.title}
                                    </span>
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
                
                <div className={`p-2 cursor-pointer hover:bg-light-white text-sm items-center gap-x-4
                             bottom-6 mt-2 z-30 w-full relative`}
                    onClick={logout}
                >
                    <div className="flex md:text-base font-semibold items-center gap-x-4">
                        <FaSignOutAlt className="" />
                        <span className={`${!open && "hidden"} origin-left duration-200`}>
                            Sign Out
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;