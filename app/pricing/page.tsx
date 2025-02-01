import { Button } from "@/components/ui/button"
import React from "react"
import prisma from "@/lib/db"
import { getStripeSession, stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import Link from "next/link"

async function getData(userId: string | null) {
    if (!userId) return null

    const subscription = await prisma.subscription.findUnique({
        where: {
            userId: userId
        },
        select: {
            status: true,
            user: { select: { stripeCustomerId: true }}
        }
    })

    return subscription
}

export default async function Pricing() {

    const { userId } = await auth();
    const user = await currentUser();

    const subscription = await getData(userId)

    const isSubscribed = subscription?.status === "active"

    async function createSubscription() {
        "use server"

        if (!userId) {
            return redirect('/sign-in?redirect_url=/pricing')
        }

        let databaseUser = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                stripeCustomerId: true
            }
        })

        if (!databaseUser) {
            throw new Error('DatabaseUser Not Found')
        }

        const email = user?.primaryEmailAddress?.emailAddress
        
        if (!databaseUser.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: email
            })

            databaseUser = await prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    stripeCustomerId: customer.id
                },
                select: { stripeCustomerId: true }
            })

            console.log('databaseUser', databaseUser)
        }

        if (!databaseUser.stripeCustomerId) {
            throw new Error('Failed to set stripeCustomerId for the user')
        }

        const subscriptionUrl = await getStripeSession({
            customerId: databaseUser.stripeCustomerId,
            domainUrl: process.env.NODE_ENV === 'production' ? (process.env.PRODUCTION_URL as string) : 'http://localhost:3000',
            priceId: process.env.STRIPE_PRICE_ID as string
        })

        return redirect(subscriptionUrl)
    }


    async function createCustomerPortal(){
        "use server"

        if (!userId) {
            return redirect('sign-in?redirect_url=/pricing')
        }

        const customerPortalUrl = await stripe.billingPortal.sessions.create({
            customer: subscription?.user.stripeCustomerId as string,
            return_url: process.env.NODE_ENV === 'production' ? (process.env.PRODUCTION_URL as string) : 'http://localhost:3000'
        })

        return redirect(customerPortalUrl.url)
    }

    const backLink = userId ? '/dashboard' : '/'


    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-gray-100">Subscription Plan</h1>
            <div className="space-y-6 rounded-2xl bg-[#1a1a1a]/80 border border-gray-700/30 shadow-lg backdrop-blur-sm p-8">
                <Link href={backLink} className="inline-block text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors">&larr; Back</Link>
                <div className="border-b border-gray-700/30 pb-4">
                    <h2 className="text-3xl font-semibold tracking-tight text-gray-100">Full Access</h2>
                </div>
                <p className="text-gray-400 leading-7">Access to all features</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">$9.99/month</p>
                {isSubscribed ? (
                    <form action={createCustomerPortal}>
                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-medium py-3 rounded-xl transition-opacity hover:opacity-90">
                            Manage Subscription
                        </Button>
                    </form>
                ) : (
                    <form action={createSubscription}>
                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-medium py-3 rounded-xl transition-opacity hover:opacity-90">
                            Subscribe
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}