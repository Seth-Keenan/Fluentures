'use client';

import Link from 'next/link'
import { useForm } from 'react-hook-form';

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
    <main>
      <form>
        <div className='container'>
            <label>Username</label>
            <input {...register("username", { required: true})} placeholder='Enter username' />
             
            
            <label>Password</label>
            <input {...register("password", {required: true})} placeholder='Enter password' /> 
            
            <button className="btn btn-success w-full" type='button' onClick={() => SignUpOnClick()}>Signup</button>   
            
            <Link href="/login" className='btn btn-soft btn-warning w-full'>
              Already a user? Log in
            </Link>
        </div>
      </form>
    </main>
  )
}

export default SignUp