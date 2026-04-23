import Image from "next/image";
import { lustiana } from "./ui/font";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1>
          This is demo  of the new project
          <br />
          <span className={`${lustiana.className} text-4xl pt-30 m-30 }`}>Status : {new Date().toLocaleTimeString()}</span>



        </h1>

      </main>
    </div>
  );
}
