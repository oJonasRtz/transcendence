import { Inter, Montserrat, Poppins, Nunito } from 'next/font/google';
import { Lusitana } from 'next/font/google';
import { Press_Start_2P } from 'next/font/google';
import { Goldman } from 'next/font/google';

export const inter = Inter({
  subsets:['latin']
});
export const pressStart2p = Press_Start_2P({
  weight: ["400"],
  subsets:['latin']
});
export const goldman = Goldman({
  weight: ["400", "700"],
  subsets:['latin']
});
export const lusitana = Lusitana({ 
  weight: ["400", "700"],
  subsets:['latin'],
});
export const montserrat = Montserrat({
  weight: ["700"],
  subsets:['latin'],
})
export const poppins = Poppins({
  weight: ["400", "700"],
  subsets:['latin'],
});
export const nunito = Nunito({
  weight: ["400", "700"],
  subsets:['latin'],
});
