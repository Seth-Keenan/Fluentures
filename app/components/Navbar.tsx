// This can be temporary, just needed a way to sign out

"use client"
import React from "react";
import Link from "next/link";
import fluenturesLogo from "@/fluenturesLogo.png";
import Image from "next/image";
import { Button } from "@/app/components/Button";
import { supabase } from '@/app/lib/hooks/supabaseClient'
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-full h-20 bg-emerald-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-full relative flex items-center">

        {/* Logo on left */}
        <Link href="/" className="flex items-center z-10">
          <Image
            src={fluenturesLogo}
            alt="Fluentures company logo"
            width={70}
            height={70}
            priority
            style={{ objectFit: 'contain' }}
            quality={100}
          />
        </Link>

        {/* Links centered absolutely */}
        <ul className="hidden md:flex gap-x-6 text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
          <li>
            <Link href="/about">
              <p className="cursor-pointer hover:underline">About Us</p>
            </Link>
          </li>
          <li>
            <Link href="/services">
              <p className="cursor-pointer hover:underline">Services</p>
            </Link>
          </li>
          <li>
            <Link href="/contacts">
              <p className="cursor-pointer hover:underline">Contacts</p>
            </Link>
          </li>
        </ul>

        {/* Signout Button on right */}
        <div className="ml-auto z-10">
          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
