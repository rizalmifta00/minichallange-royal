import React from 'react'
import Hero2 from '../assets/images/hero2.jpg'

export default function HowItWork() {
  return (
    <section>
    <div className=" bg-emerald-900  h-screen">
      <div className="container mx-auto grid grid-cols-2 gap-4">
        <div className="text-center content-center">
          <img  src ={Hero2} className="h-3/5 mt-24 "/>
        </div>
        <div className="mt-24">
          <h1 className="text-yellow-300 font-semibold">How It Work</h1>
          <h1 className="text-white font-bold text-5xl mt-10">Steps to get powerfull Services</h1>
          <div className="py-6">
          <div className="flex items-center text-xl mt-5 text-semibold text-white ">
            <h1 className="">1</h1>
            <h1 className="mx-8">Site Map and User Flow</h1>
          </div>
          <div className="mt-2 mx-11 text-xl text-gray-300 mb-8 ">
            <h1>Nibh ut lacus egestas orci, dolor. Eu eros, laoreet euismood tortor nibh purus</h1>
          </div>
          <div className="flex items-center text-xl mt-5 text-semibold text-white">
            <h1 className="">2</h1>
            <h1 className="mx-8 ">Wireframing / Lofi</h1>
          </div>
          <div className="mt-2 mx-11 text-xl text-gray-300 mb-8">
            <h1>Nibh ut lacus egestas orci, dolor. Eu eros, laoreet euismood tortor nibh purus</h1>
          </div>
          <div className="flex items-center text-xl mt-5 text-semibold text-white">
            <h1 className="">3</h1>
            <h1 className="mx-8">Visualize / Hifi</h1>
          </div>
          <div className="mt-2 mx-11 text-xl text-gray-300 mb-8">
            <h1>Nibh ut lacus egestas orci, dolor. Eu eros, laoreet euismood tortor nibh purus</h1>
          </div>
          </div>
        </div>
      </div>

    </div>
  </section>
  )
}
