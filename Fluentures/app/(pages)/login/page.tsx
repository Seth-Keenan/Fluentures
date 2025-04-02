import React from 'react';
import Link from "next/link";

const page = () => {
  
  return (
    <main>
      <form >
        <div className='container'>
          <label>Username</label>
          <input placeholder='Enter username' name="username" required />

          <label>Password</label>
          <input placeholder='Enter password' name="password" required />

          <button type='submit' className="btn btn-success w-full">Login</button>

          <Link href="/signup" className='btn btn-soft btn-warning'>
            Not a user? Sign up!
          </Link>
        </div>
      </form>

      
    </main>
  );
}

export default page
