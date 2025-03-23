import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="bg-pink-600 text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold">SheWell</h1>
                        </div>
                        <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    isActive ? "bg-pink-700 px-3 py-2 rounded-md text-sm font-medium" :
                                        "px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-500"
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/doctor-finder"
                                className={({ isActive }) =>
                                    isActive ? "bg-pink-700 px-3 py-2 rounded-md text-sm font-medium" :
                                        "px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-500"
                                }
                            >
                                Find Gynecologists
                            </NavLink>
                            <NavLink
                                to="/diet-advice"
                                className={({ isActive }) =>
                                    isActive ? "bg-pink-700 px-3 py-2 rounded-md text-sm font-medium" :
                                        "px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-500"
                                }
                            >
                                Pregnancy Diet
                            </NavLink>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                    isActive ? "bg-pink-700 px-3 py-2 rounded-md text-sm font-medium" :
                                        "px-3 py-2 rounded-md text-sm font-medium hover:bg-pink-500"
                                }
                            >
                                My Profile
                            </NavLink>
                        </div>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-pink-500 focus:outline-none"
                            onClick={toggleMenu}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? "bg-pink-700 block px-3 py-2 rounded-md text-base font-medium" :
                                    "block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-500"
                            }
                            onClick={toggleMenu}
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to="/doctor-finder"
                            className={({ isActive }) =>
                                isActive ? "bg-pink-700 block px-3 py-2 rounded-md text-base font-medium" :
                                    "block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-500"
                            }
                            onClick={toggleMenu}
                        >
                            Find Gynecologists
                        </NavLink>
                        <NavLink
                            to="/diet-advice"
                            className={({ isActive }) =>
                                isActive ? "bg-pink-700 block px-3 py-2 rounded-md text-base font-medium" :
                                    "block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-500"
                            }
                            onClick={toggleMenu}
                        >
                            Pregnancy Diet
                        </NavLink>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive ? "bg-pink-700 block px-3 py-2 rounded-md text-base font-medium" :
                                    "block px-3 py-2 rounded-md text-base font-medium hover:bg-pink-500"
                            }
                            onClick={toggleMenu}
                        >
                            My Profile
                        </NavLink>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;