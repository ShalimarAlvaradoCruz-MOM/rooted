import TestComponent from "@/components/test-component";
import { useRouter } from "next/router";
export default function Home() {
  const router = useRouter();
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 bg-blue-300">
      <div className="p-4 my-auto space-y-6 text-center text-white bg-red-400">
        <p className="text-lg font-bold ">nextjs and tailwind template!</p>
        <TestComponent />
        <div className="py-4 transition duration-300 hover:scale-110">
          <a
            onClick={() => router.push("./router-test")}
            className="p-4 bg-green-500 rounded-lg cursor-pointer"
          >
            click here to test router
          </a>
        </div>
      </div>
    </main>
  );
}
