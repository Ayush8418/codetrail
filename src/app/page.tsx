// ---------------------------------------------------------using client session 
// useSession() : uses cookies that locally stored on client side then sends req to backend(api/auth/session)
//                      which uses cookies that comes with the request then verify the JWT using Secret then make a session and that is returned to us.
// ---------------------------------------------------------using server session 
// getServerSession() : uses cookies that comes with the request then verify the JWT using Secret then make a session and that is returned to us.
"use server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth"
import { BackgroundLines } from "@/components/ui/background-lines";
import React from "react";
import HeroSectionOne from "@/components/hero-section-demo-1";
import ThreeDCardDemo from "@/components/3d-card-demo";
import { SquigglyText } from "@/components/ui/squiggly-text";
import { cn } from "@/lib/utils"
import { Marquee } from "@/components/ui/marquee";
import ContactForm from "@/components/ContactForm";
import Image from "next/image";

export default async function HomePage(){
  
  const reviews = [
  {
    name: "Jack",
    username: "@jack",
    body: "I've never seen anything like this before. It's amazing. I love it.",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I don't know what to say. I'm speechless. This is amazing.",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "John",
    username: "@john",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jane",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/jenny",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm at a loss for words. This is amazing. I love it.",
    img: "https://avatar.vercel.sh/james",
  },
]


  const CardContent = [
    {
      title: "Questions",
      description: "Save Questions and solutions and set reminnders to revise later",
      imageSrc: "/images/2.png",
      link: "/question"
    },
    {
      title: "Notes",
      description: "Save Notes and set reminnders to revise later",
      imageSrc: "/images/1.png",
      link: "/note"
    },
    {
      title: "Habit Tracker",
      description: "Track your daily habits and build positive routines",
      imageSrc: "/images/6.png",
      link: "/planner"
    },
    {
      title: "Todos & diary",
      description: "Organize your tasks and jot down your thoughts in a digital diary",
      imageSrc: "/images/5.png",
      link: "/planner"
    },
    {
      title: "Study Session",
      description: "Create focused study sessions with customizable timers and breaks",
      imageSrc: "/images/3.png",
      link: "/session/newsession"
    },
    {
      title: "Study History",
      description: "Review your past study sessions, track your progress, and identify areas for improvement",
      imageSrc: "/images/4.png",
      link: "/session/oldsessions"
    }
  ]

  const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)
const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string
  name: string
  username: string
  body: string
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <Image className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  )
}


  return (

    <div>

    <HeroSectionOne/>

    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
      <h1></h1>
    </BackgroundLines>
      <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
        Our Features
      </h2>
      
      <div className="flex items-center justify-center w-full flex-wrap gap-4 px-4 py-10">
        {
        CardContent.map((card, index) => (
      
            <ThreeDCardDemo key={index} card={card} />
          
        ))
      }
      </div>

      <div className="flex h-30 w-full items-center justify-center">
      <h1 className="text-center text-5xl leading-tight font-bold text-neutral-900 md:text-7xl lg:text-8xl dark:text-neutral-100">
        Feedback From Our {" "}
        <SquigglyText scale={5} className="text-amber-500">Users</SquigglyText>!
      </h1>
    </div>

      
<div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
      <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
    </div>
        <ContactForm/>

        <footer className="h-[300px] bg-zinc-200 dark:bg-zinc-900  px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          {/* Logo */}
          <span className="text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            CodeTrail{"</>"}
          </span>

          {/* Links */}
          <div className="flex flex-col gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <a href="mailto:ayushkumar8418@gmail.com" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              ayushkumar8418@gmail.com
            </a>
            <a href="tel:+911234567890" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              +91 12345 67890
            </a>
            <a href="https://linkedin.com/in/ayushkumar2712" target="_blank" rel="noopener noreferrer"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition">
              linkedin.com/in/ayushkumar2712
            </a>
          </div>

        </footer>
    {/* <div>
      <h1>Hello, Codetrail!</h1>
      <p>you Session: <br /> {JSON.stringify(session)}</p>
      <div className="h-[1500px]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis alias, ducimus fugiat mollitia deleniti velit quos id voluptas aspernatur nesciunt libero odit officia non repudiandae quisquam accusantium, vitae perferendis ab!</div>   
    </div> */}
    
    </div>
  )
}

