"use client"

import * as React from "react"
import Link from "next/link"
import { NotebookPen } from "lucide-react";


import { useIsMobile } from "@/hooks/use-mobile"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: {
  title: string;
  href: string;
  description: string;
}[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    description:
      "Your personal overview showing learning progress, consistency, recent activity, and key stats.",
  },
  {
    title: "Study Sessions",
    href: "/session/newsession",
    description:
      "Start focused study sessions, track time spent, and stay productive with a timer.",
  },
  {
    title: "Session History",
    href: "/session/oldsessions",
    description:
      "Browse past study sessions with time, topics studied, and session notes for revision.",
  },
  {
    title: "Questions",
    href: "/question",
    description:
      "Track solved DSA questions, manage difficulty and importance, and revisit problems efficiently.",
  },
  {
    title: "Notes",
    href: "/note",
    description:
      "Organize topic-wise notes with explanations, code snippets, and set reminders for revision.",
  },
  {
    title: "Habit Tracker",
    href: "/planner",
    description:
      "Build consistency by tracking daily habits like coding, revision, and learning streaks.",
  },
  {
    title: "Todos",
    href: "/planner",
    description:
      "Manage daily tasks and priorities to stay organized and focused throughout your study plan.",
  },
  {
    title: "Diary",
    href: "/planner",
    description:
      "dodument your days by writing daily diary entries",
  }
  // ,
  // {
  //   title: "Profile",
  //   href: "/profile",
  //   description:
  //     "View your public learning profile with stats, activity history, and progress insights.",
  // },
];


export function NavigationMenuDemo() {
  const isMobile = useIsMobile()

  return (
    <NavigationMenu viewport={isMobile}>
      <NavigationMenuList className="flex-wrap">
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        
        {/* <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>Questions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/question/newquestion">
                    <div className="font-medium">Add New Question</div>
                    <div className="text-muted-foreground">
                      add a new question and track its progress.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="/question/oldquestions">
                    <div className="font-medium">View Questions</div>
                    <div className="text-muted-foreground">
                      view all previous Questions
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>Notes</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/note/newnote">
                    <div className="font-medium">Add a Quick-Note</div>
                    <div className="text-muted-foreground">
                      add a new note and track its progress.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="/note/oldnotes">
                    <div className="font-medium">View Notes</div>
                    <div className="text-muted-foreground">
                      view all previous notes.
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem> */}

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/question/">Questions</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/note/">Notes</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>Session</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[300px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/session/newsession">
                    <div className="font-medium">New Study-Session</div>
                    <div className="text-muted-foreground">
                      add a new focussed study session.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <Link href="/session/oldsessions">
                    <div className="font-medium">Previous Sessions</div>
                    <div className="text-muted-foreground">
                      view all previous study sessions and details.
                    </div>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink asChild>
                  <div className="bg-zinc-200 hover:bg-zinc-200 font-thin">
                    <div className="font-medium">Stats About My Sessions*</div>
                    <div className="text-muted-foreground">
                      carefully prepared insights about your study sessions.
                    </div>
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link href="/planner">Planner</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem className="hidden md:block">
          <NavigationMenuTrigger>others</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              <li>
                <NavigationMenuLink asChild>
                  <Link href="/diary" className="flex-row items-center gap-2">
                    <NotebookPen /> 
                    diary Entries
                  </Link>
                </NavigationMenuLink>
                {/* <NavigationMenuLink asChild>
                  <Link href="/habittrackr" className="flex-row items-center gap-2">
                    <LineChart />
                    habit tracker
                  </Link>
                </NavigationMenuLink> */}
                
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
