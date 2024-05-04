// Use the "use client" directive for optimal loading with Next.js
'use client'

// Import React and necessary hooks
import React, { useState, useEffect } from 'react';

// Importing CSS and styles
import './dashboard.css';
import styles from './layout.module.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// Custom hook for handling window size
const useWindowSize = () => {
    const [size, setSize] = useState({ width: undefined, height: undefined });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size;
};

// Navigation elements data arrays
const navElements = [
    { Name: "Keyword Search", Icon: "KeywordSearch.svg", Selected: false, href: "/dashboard/keywords" },
    { Name: "Domain Overview", Icon: "DomainOverview.svg", Selected: false, href: "/dashboard/domain-overview" },
    { Name: "Market Analysis", Icon: "MarketAnalysis.svg", Selected: false, href: "/dashboard/market-analysis" }
];

const bottomNavElements = [
    { Name: "Settings", Icon: "KeywordSearch.svg", Selected: false, href: "/dashboard/settings" },
    { Name: "Log Out", Icon: "DomainOverview.svg", Selected: false, href: "/dashboard/logout" }
];



// Main layout component
const Layout = ({ children }) => {
    const size = useWindowSize();
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const toggleSidebar = () => setSidebarVisible(!isSidebarVisible);
    const pathname = usePathname();

    // Effect for responsive sidebar visibility
    useEffect(() => {
        setSidebarVisible(size.width >= 1024);
    }, [size.width]);

    const menuItemClicked = () => {
        if (size.width <= 1024){
            setSidebarVisible(false)
        }
    }

    //displays each nav element for map function
    const displayNavElements = (navElement, pathname) => {
    return (
        <Link onClick = {menuItemClicked} key={navElement.Name} href={navElement.href} className={styles.navItem}>
            {pathname === navElement.href && <img src="/navItemSelectedRectangle.svg" />}
            <img src={`/icons/${pathname === navElement.href ? "selected/" : "unselected/"}${navElement.Icon}`} className={styles.navIcon} />
            <div className={`${styles.linkText} ${pathname === navElement.href ? styles.selectedNavItem : ''}`}>
                {navElement.Name}
            </div>
        </Link>
    )

}    

    return (
        <div>

            {/* SIDEBAR */}
            <div className={styles.sidebar} style={{ width: isSidebarVisible ? '280px' : '0' }}>

                {/* MINIMIZE SIDEBAR CARROT */}
                {size.width <= 1024 && (
                    <div onClick={toggleSidebar} className={styles.hideMenuIcon}>
                        <img src="/icons/backArrow.svg" />
                    </div>
                )}


                {/* SENTIVIO LOGO */}
                <div className={styles.logo_container} style={{ opacity: isSidebarVisible ? 1 : 0 }}>
                    <img src="/sentivioLogoWhite.svg" />
                    <div className={styles.logo_text}>Sentivio</div>
                </div>


                {/* NAV ELEMENTS */}
                <div className={styles.navbar_container}>

                    {/* MAIN NAV COMPONENTS */}
                    {navElements.map((navElement) => (
                        displayNavElements(navElement, pathname)
                    ))}

                    {/* SETTINGS AND LOGOUT */}
                    <div className={styles.subNavContainer}>
                        {bottomNavElements.map((navElement) => (
                            displayNavElements(navElement, pathname)
                        ))}
                    </div>
                </div>
            </div>


            {/* TOP NAV */}
            <div className={styles.topNav}>
                {/* HAMBURGER ICON */}
                <div onClick={toggleSidebar} className={styles.hamburgerContainer}>
                    <img className={styles.hamburger} src="/icons/hamburger.svg" />
                </div>

                {/* USER PROFILE */}
                <div className={styles.profileIconContainer}>
                    <img src="/pandaProfile.svg" className={styles.panda} />
                    <div>
                        <div className={`${styles.JohnSmith} info_box_value_text`}>John Smith</div>
                        <div className={`${styles.Email} info_box_category_text`}>johnsmith@gmail.com</div>
                    </div>
                </div>
            </div>

            {/* MAIN SECTION */}
            <div className={styles.mainContent}>
                {children}
            </div>
        </div>
    );
};

export default Layout;
