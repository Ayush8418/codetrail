"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";
import Image from "next/image";

export default function ThreeDCardDemo({key, card}: {key: number, card: {title: string, description: string, imageSrc: string, link: string}}) {
  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gray-100 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-zinc-900 dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
          {card.title}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
        >
          {card.description}
        </CardItem>
        <CardItem translateZ="100" className="w-full mt-4 dark:border-white/[0.2] border-black/[0.1] border rounded-xl">
          <Image
            src={card.imageSrc}
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex justify-end items-center mt-10">
          <CardItem
            translateZ={20}
            as="a"
            href={card.link}
            target="__blank"
            className="px-4 py-2 rounded-xl text-m font-normal dark:text-black dark:bg-white bg-black text-white"
          >
              Try now →
          </CardItem>
          {/* <CardItem
            translateZ={20}
            as="button"
            href="/signup"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
          >
            
              Sign up

          </CardItem> */}
        </div>
      </CardBody>
    </CardContainer>
  );
}
