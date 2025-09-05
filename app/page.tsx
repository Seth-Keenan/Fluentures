import Logo from "next/image";
import Head from "next/head";
import { LinkAsButton } from "./components/LinkAsButton";

export default function Home() {
  return (
    <div style={{
      backgroundImage: 'url("/desert.png")',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      maxHeight: '100vh',
      maxWidth: '100%',
      height: 'auto',
      width: 'auto',
      }}>
      <div className={"flex flex-col justify-center items-center h-screen"}>
        <LinkAsButton href="/login" className="btn m-1">
          Login
        </LinkAsButton>
        <LinkAsButton href="/signup" className="btn m-1">
          Signup
        </LinkAsButton>
        <LinkAsButton href="/home" className="btn m-1">
          Account Home
        </LinkAsButton>
        <LinkAsButton href="/testing" className="bt m-1">
          Testing features
        </LinkAsButton>
      </div>
    </div>
  );
}