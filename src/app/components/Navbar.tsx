import React from 'react';
import Link from 'next/link';
import Image from 'next/image';


const Navbar = () => {
  return (
    <nav className='flex justify-around items-center p-5 bg-slate-200'>
      <div>
      <Link href="/">
      <Image
        src="/Grass_Field_(157789275).jpeg" // Path relative to the public directory
        alt="Grass Field" // Add an alt text for accessibility
        width={100} // Set appropriate width
        height={100} // Set appropriate height
        style={{borderRadius:'100%'}}
      />
    </Link>
      </div>
      <li className=''>Touch Grass is under DATABASE MAINTAINANCE</li>
      <div className='flex space-x-3 p-3 cursor-pointer '>
        <Link className='hover:underline' href="/pages/Dashboard">
          Dashboard 
        </Link>
        <Link className='hover:underline' href="/pages/About">
          About
        </Link>
        <Link className='hover:underline' href="/api/auth/login">
          Login 
        </Link>
        <Link className='hover:underline' href="/api/auth/logout">
          Logout 
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
