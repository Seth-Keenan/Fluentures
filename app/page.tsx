import Logo from "next/image";
import { LinkAsButton } from "./components/LinkAsButton";

export default function Home() {
  return (
    <div style={{
      backgroundImage: "url('/ChatGPT Image Mar 31, 2025 at 12_13_22 PM.png')",
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      maxHeight: '100vh',
      maxWidth: '100%',
      height: 'auto',
      width: 'auto',
      }}>
      <div className={"flex flex-col justify-center items-center h-screen"}>
        <LinkAsButton href="/login" className="btn">
          Login
        </LinkAsButton>
        <LinkAsButton href="/signup" className="btn">
          Signup
        </LinkAsButton>
        <LinkAsButton href="/settings" className="btn">
          Settings
        </LinkAsButton>
        <LinkAsButton href="/home" className="btn">
          Account Home
        </LinkAsButton>
        <LinkAsButton href="/testing" className="btn">
          Testing features
        </LinkAsButton>
      </div>
    </div>
  );
}