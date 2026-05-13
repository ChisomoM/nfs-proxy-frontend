import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Navbar(){
    const [isOpen, setIsOpen] = useState(false);
    
    const navItems = [
        {name: 'Home', href: '#home'},
        {name: 'Features', href: '#features'},
        {name: 'About', href: '#about'},
        {name: 'Contact', href: '#contact'}
    ];

    // Active state highlighting can be added later (e.g., via IntersectionObserver)

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsOpen(false);
    };

    const navigate = useNavigate();
    const onGetStarted = () => navigate("/login")

    return (
        <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white shadow-sm fixed w-full top-0 z-50"
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <a href="/" className="flex-shrink-0">
                        <img 
                            src="/logos/chizotech logo black_.png"
                            alt="SmartHub Logo"
                            className="h-12 w-auto object-contain"
                        />
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden  md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <a 
                                key={item.name}
                                href={item.href}
                                className={
                                    'px-3 py-2 text-sm font-medium transition-colors duration-200 text-gray-700 hover:text-primary-orange hover:bg-gray-50'
                                }
                                onClick={(e) => handleNavClick(e, item.href)}
                            >
                                {item.name}
                            </a>
                        ))}
                        
                        
                    </nav>

                    <Button 
                    onClick={onGetStarted}
                    className="ml-4 bg-gradient-to-r from-gradient-from to-gradient-to px-auto text-white">
                            Get Started
                        </Button>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={
                                        'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 text-gray-700 hover:text-primary-orange hover:bg-gray-50'
                                    }
                                    onClick={(e) => handleNavClick(e, item.href)}
                                >
                                    {item.name}
                                </a>
                            ))}
                            <div className="px-3 py-2">
                                <Button className="w-full">
                                    Get Started
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.header>
    );

}