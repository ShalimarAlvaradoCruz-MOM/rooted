import { useRouter } from "next/router";

export default function RouterTest() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24 bg-blue-500">
      <div className="p-4 text-center text-white transition duration-300 ease-in-out bg-green-400 hover:scale-110">
        <a onClick={() => router.push("./")} className="cursor-pointer ">
          router test successful! start building a new page here! click to
          return home 🏠{" "}
        </a>
      </div>
    </main>
  );
}
