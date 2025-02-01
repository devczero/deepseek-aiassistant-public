import YourComponent from "@/components/AiChatWindow";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export default async function Home() {


  return (
    <main className="bg-gradient-to-br ">

      <div className="absolute -top-0 left-0 right-0 h-[calc(100vh-80px)]
      dark:bg-[linear-gradient(to_right,#4a5568_1px, transparent_1px),linear-gradient(to_bottom,#4a5568_1px,transparent_1px)]
      bg-[linear-gradient(to_right,#333333_1px,transparent_1px),linear-gradient(to_bottom,#333333_1px,transparent_1px)]
      bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-[0.2]"/>
      
      <div className=" container mx-auto px-4 py-8 h-screen flex flex-col space-y-8">

        {/* Chat Interface Container */}
        <div className=" flex-1 flex flex-col items-center justify-center relative">
          <div className=" w-full max-w-5xl h-[75vh] flex flex-col space-y-6">
            {/* Glassmorphic Chat Window */}
            <div className="relative h-full rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl ">
              {/* Inner Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-lime-900/5 pointer-events-none" />
              
              {/* Radial Gradient Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/10 to-transparent pointer-events-none" />
              
              {/* Main Content */}
              <div className="relative h-full flex flex-col">
                <YourComponent />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}