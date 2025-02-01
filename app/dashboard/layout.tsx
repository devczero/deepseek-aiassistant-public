import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Initialize subscription variable to store the user's subscription data
  let subscription;
  try {
    // Query the database to find the subscription record for this user
    subscription = await prisma.subscription.findUnique({
      where: { userId: userId }, // Look up subscription by userId
      select: { status: true }, // Only retrieve the status field
    });
  } catch (error) {
    // Log the error to the console for debugging
    console.error("Failed to fetch subscription:", error);
    // Throw a user-friendly error message
    throw new Error("Failed to load subscription status. Please try again later.");
  }

  if (subscription?.status !== "active") {
    return (
      <div className="min-h-screen">
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
          <main className="flex-1 overflow-y-auto p-8">
            <div className="relative space-y-8">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <Button 
                  asChild
                  className="font-semibold"
                >
                  <Link href="/pricing">
                    Subscribe to Access
                  </Link>
                </Button>
              </div>
              <div className="filter blur-sm">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
  // Render the layout and its children if the user is authenticated and subscribed
  return (
    <div className="">
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <main className="flex-1 p-8 flex items-center justify-center">{children}</main>
      </div>
    </div>
  );
}
