import React from 'react';
import Link from 'next/link';


const Navbar = () => {
  return (
    <nav className='flex justify-around items-center p-5'>
      <div>
        <Link href={"/"}>
        <span>Logo</span></Link>
      </div>
      <div className='flex space-x-3 p-3 cursor-pointer'>
        <Link href="/pages/Dashboard">
          Dashboard 
        </Link>
        <Link href="/pages/About">
          About
        </Link>
        <Link href="/pages/login">
          Login 
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;