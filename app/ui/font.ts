import { Inter } from "next/font/google";
import { Lusitana } from "next/font/google";


export const font = Inter({
    subsets: ["latin"],
    variable: "--font-inter"
})


export const lustiana = Lusitana({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-lusitana"
})