import Link from "next/link";
import Logo from "next/image";

export default function Home() {
  return (
    <main>
      <div>
        <Logo 
          src={"/ChatGPT Image Mar 31, 2025 at 12_13_22 PM.png"} 
          alt={"Fluentures logo"}
          width={500}
          height={500}
        />
      </div>
      <Link href="/login" className="btn">
        Go to login
      </Link>
      <Link href="/testing" className="btn">
        Testing page
      </Link>
    </main>
  );
}
