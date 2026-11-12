import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Number Duel · Challenge your friends',description:'One secret number. Your friends. Fewest guesses wins. A game by Faris Younas.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
