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

// 'use client';

// import Link from 'next/link';
// import { useForm } from 'react-hook-form';

// export default function SignUp() {
//   const { register, handleSubmit } = useForm();

//   const onSubmit = (data: any) => {
//     try {
//       const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
//       const updatedUsers = [...existingUsers, data];
//       localStorage.setItem('users', JSON.stringify(updatedUsers));
//       console.log("Saved users:", updatedUsers);
//     } catch (err) {
//       console.error("Signup failed:", err);
//     }
//   };

//   return (
//     <main className="flex justify-center items-center min-h-screen p-4">
//       <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
//         <label className="label">Username</label>
//         <input {...register("username", { required: true })} className="input input-bordered w-full" />

//         <label className="label">Password</label>
//         <input type="password" {...register("password", { required: true })} className="input input-bordered w-full" />

//         <button type="submit" className="btn btn-success w-full">Sign Up</button>

//         <Link href="/login" className="btn btn-warning w-full text-center">
//           Already a user? Log in
//         </Link>
//       </form>
//     </main>
//   );
// }
