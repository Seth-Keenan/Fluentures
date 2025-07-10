'use client';

import Link from 'next/link'
import { useForm } from "react-hook-form";

const SignUp = () => {

    const { register, getValues } = useForm();

    const SignUpOnClick = () => {
        const user = getValues();
        if(localStorage.getItem('users')) {
          const users = JSON.parse(localStorage.getItem('users') || "[]");
          const allUsers = [...users, user];
          localStorage.setItem('users', JSON.stringify(allUsers));
          console.log("users added: ", allUsers)
        }
        else {
          localStorage.setItem('users', JSON.stringify([user]));
        }
    }

  return (
      <div className='flex flex-col justify-center items-center h-screen'>
        <p className='text-4xl font-bold mb-4'>Sign Up</p>
          <form className="flex flex-col gap-4 p-6 bg-white shadow-md rounded">
            <div className='container flex flex-col justify-center gap-4'>
              <div className='flex flex-col'>
                <label>First Name</label>
                <input className="border border-black rounded-[.5vw] p-[5px]" placeholder="First name" name="username" type="text" required />
              </div>
              <div className='flex flex-col'>
                <label>Username</label>
                <input className="border border-black rounded-[.5vw] p-[5px]" placeholder="Enter username" name="username" type="text" required />
              </div>
              <div className='flex flex-col'>
                <label>Password</label>
                <input className="border border-black rounded-[.5vw] p-[5px]" placeholder='Enter password' name="password" type="password" required />
              </div>
              <div className='flex flex-col items-center gap-4'>
                <button type='submit' className="px-4 py-2 bg-amber-400 text-white rounded hover:bg-amber-800 transition: duration-200">Login</button>
                <Link href="/login" style={{textDecoration: "underline", textDecorationColor: "orange", color: "orange"}}>
                  Have an account? Log in.
                </Link>
              </div>
            </div>
          </form>
      </div>
    );
}

export default SignUp