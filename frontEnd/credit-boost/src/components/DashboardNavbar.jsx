import React, { useState, useEffect, useContext } from 'react';
import { FaBars, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { FaPerson, FaX } from 'react-icons/fa6';
//import Logo from '../../public/logo.png';
import { RiAccountCircleFill } from 'react-icons/ri';
import { MdDashboard, MdWallet } from "react-icons/md";
import { AppContext } from '../context/AppContext';
import NotificationCenter from './NotificationCenter';
import LanguageSwitcher from './LanguageSwitcher';

function Navbar({ toggleSidebar }) {
    const [currentDate, setCurrentDate] = useState("");
    const {name}=useContext(AppContext)

    const [menu, setMenu] = useState(false)
    const toggleMenu = () => {
        setMenu(!menu)
    }

    const menuItems = [
        { title: "Account", icon: <RiAccountCircleFill /> },
        { title: "Overview", icon: <MdDashboard /> },
        { title: "Settings", icon: <FaCog /> },
        { title: "Sign Out", icon: <FaSignOutAlt />, gap: true },
    ];

    useEffect(() => {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        setCurrentDate(today.toLocaleDateString(undefined, options));
    }, []);

    return (
        <header className=" ">
            <div className="max-w-7xl mx-auto py-2 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="mr-4 text-white md:hidden">
                        <FaBars />
                    </button>
                    <p className=" date font-bold text-gray-900">
                        {currentDate}
                    </p>
                </div>
                <nav className="md:flex flex-row hidden items-center space-x-4">
                    <NotificationCenter />
                    <LanguageSwitcher />
                    <p>{name}</p>
                    <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                        <RiAccountCircleFill className="text-2xl " />
                    </a>
                </nav>
                <div className='md:hidden' onClick={toggleMenu}>
                    <FaBars />
                </div>
                {menu &&
                    <nav className="absolute bg-[#0d0d0d] rounded-lg z-30 top-0 left-0 w-[100%]">
                        <div className='flex justify-between px-6 py-3'>
                            <div className='flex flex-col gap-3'>
                                <a href='/dashboard' className="text-3xl font-bold ">
                                    <p>Logo</p>
                                </a>
                                <ul className="pt-1">
                                    {menuItems.map((Menu, index) => (
                                        <li
                                            key={index}
                                            className={`flex rounded-md p-2 cursor-pointer hover:bg-light-white text-gray-300 text-sm items-center gap-x-4 
                                            ${Menu.gap ? "mt-4" : "mt-2"} ${index === 0 && "bg-light-white"}`}
                                        >
                                            {Menu.icon}
                                            <span className="origin-left duration-200">
                                                {Menu.title}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <FaX className='h-6 bg-blue-500 rounded-full w-6 p-2' onClick={toggleMenu} />
                        </div>
                    </nav>
                }
            </div>
        </header>
    );
}

export default Navbar;