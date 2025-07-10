import Link from "next/link";
import Logo from "next/image";

export default function Home() {
  return (
    <main>
      <div className={"flex flex-col justify-center items-center h-screen"}>
        <Logo 
          src={"/ChatGPT Image Mar 31, 2025 at 12_13_22 PM.png"} 
          alt={"Fluentures logo"}
          width={500}
          height={500}
        />
        <Link href="/login" className="btn">
          Login
        </Link>
        <Link href="/signup" className="btn">
          Signup
        </Link>
        <Link href="/settings" className="btn">
          Settings
        </Link>
        <Link href="/home" className="btn">
          Account Home
        </Link>
        <Link href="/testing" className="btn">
          Testing features
        </Link>
      </div>
    </main>
  );
}