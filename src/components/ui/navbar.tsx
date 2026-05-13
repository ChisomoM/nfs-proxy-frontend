import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logos/chizotech logo black_.png';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/aboutus' },
    { name: 'Services', path: '/services' },
    { name: 'Projects', path: '/projects' },
    // { name: 'Brand Guidelines', path: '/brand-guidelines' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="w-full top-0 z-50"
    >
    
      
      {/* Navigation Bar */}
      <nav className="bg-white ">
        <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8 ">
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
  <div className="flex items-center">
    <img 
      src={logo}
      alt="ChizoTech Logo" 
      className="h-8 sm:h-12 md:h-12 w-auto object-contain max-w-[150px] sm:max-w-[180px] md:max-w-[220px]" 
    />
  </div>
</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-primary-orange border-b-2 border-primary-orange'
                      : 'text-gray-700 hover:text-primary-orange'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Button */}
          <div className="hidden md:block">
            <motion.button
            onTap={() => window.location.href = '/contact'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-gradient text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-shadow duration-200"
            >
              Get Quotes
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary-blue bg-white hover:text-primary-orange focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                    isActive(item.path)
                      ? 'text-primary-orange bg-orange-50'
                      : 'text-gray-700 hover:text-primary-orange hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button className="w-full mt-4 bg-orange-gradient text-white px-6 py-2 rounded-lg font-medium">
                Get Quote
              </button>
            </div>
          </motion.div>
        )}
        </div>
      </nav>
    </motion.div>
  );
}

export default Navbar;
