import React from 'react'
import Phone from '../assets/images/phone.png'
import Web1 from '../assets/images/web1.jpeg'
import Web2 from '../assets/images/web2.png'
export default function Product() {
  return (
    <section className="container mx-auto" >
    <div className="max-w-5xl mx-auto text-center p-20 md:pb-16 ">
          <h1 className="text-yellow-300 font-semibold">Product</h1>
          <h1 className="text-5xl py-5">Our product we've created before</h1>
    </div>
    
    <div className="grid grid-cols-2  gap-8 h-screen">
      <div className="">
          <img src={Phone} className="w-full bg-gray-300"/>
      </div>
      <div className="grid grid-cols-2 gap-4">
      <div>
        <img src={Web1} className="w-full"/>
        <div className="mt-5">
        <h1 className="font-bold text-xl">Fashion Landing Page</h1>
        <p className="text-justify text-gray-500 w-5/6">We make this landing page for fashion marketplace we called fesyen</p>
        </div>
        
      </div>
      <div>
        <img src={Web2} className="w-full"/>
        <div className="mt-5">
        <h1 className="font-bold text-xl">Insurance Landing Page</h1>
        <p className="text-justify text-gray-500 w-5/6">Secure.In is company who will help you stay safety with her services.</p>
        </div>
      </div>
      <div>
        <img src={Web2} className="w-full"/>
        <div className="mt-5">
        <h1 className="font-bold text-xl">NFT Dashboard</h1>
        <p className="text-justify text-gray-500 w-5/6">As the current trend we make nft dashboard project to sell your art here.</p>
        </div>
      </div>
      <div>
        <img src={Web1} className="w-full"/>
        <div className="mt-5">
        <h1 className="font-bold text-xl">Donation Mobile App</h1>
        <p className="text-justify text-gray-500 w-5/6">Donari is a donation mobile app in inazuma, he have vision to help other</p>
        </div>
      </div>
      
      </div>
    </div>
    </section>

  )
}
