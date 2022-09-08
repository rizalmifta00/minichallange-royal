import React from 'react'
import Ux from '../assets/images/ux-design.png'
import Coding from '../assets/images/coding.png'
import Writing from '../assets/images/writer.png'
import Branding from '../assets/images/brand.png'
import Brush from '../assets/images/brush.png'
import Graphic from '../assets/images/graphic.png'

export default function Services() {
  return (
    <section>
    <div className="container mx-auto py-16">
      <div>
        <h1 className="text-yellow-300 font-semibold">Services</h1>
      </div>
      <div className="grid grid-cols-3 gap-3 py-6">
        <div>
          <h1 className="font-semibold text-5xl">Our Service we can help you</h1>
        </div>
        <div>

        </div>
        <div className="text-justify">
          <p>we have many interesting services with profesional team , that will help your work to be better</p>
        </div>
      </div>
      </div>

      <div className="container mx-auto grid grid-cols-3 gap-6 py-10 mb-10">
        <div>
          <div className="relative flex flex-col items-center p-6  bg-white rounded shadow-xl">
            <div className="p-8 mt-8 bg-slate-100 rounded-full ">
              <img src={Ux} className="w-10" />
            </div>
            <div className="mt-6">
              <h1 className="font-bold text-xl">UX Design</h1>
            </div>
            <div className="mt-3 w-80 py-2">
              <p className="text-center text-gray-500 ">Create Landing Page , Mobile App, Dashboard , Prototyping, Wireframing</p>
            </div>
          </div>
        </div>
        <div>
        <div className="relative flex flex-col items-center p-6  bg-white rounded shadow-xl">
            <div className="p-8 mt-8 bg-slate-100 rounded-full ">
              <img src={Coding} className="w-10" />
            </div>
            <div className="mt-6">
              <h1 className="font-bold text-xl">Development</h1>
            </div>
            <div className="mt-3 w-80 py-2">
              <p className="text-center text-gray-500 ">Create Website and Responsive Website by HTML/CSS, React , Webflow</p>
            </div>
          </div>
        </div>
        <div>
        <div className="relative flex flex-col items-center p-6  bg-white rounded shadow-xl">
            <div className="p-8 mt-8 bg-slate-100 rounded-full ">
              <img src={Writing} className="w-10" />
            </div>
            <div className="mt-6">
              <h1 className="font-bold text-xl">Content Writing</h1>
            </div>
            <div className="mt-3 w-80 py-2">
              <p className="text-center text-gray-500 ">Create beautiful word for your website that will attract customers</p>
            </div>
          </div>
        </div>
        <div>
        <div className="relative flex flex-col items-center p-6  bg-white rounded shadow-xl">
            <div className="p-8 mt-8 bg-slate-100 rounded-full ">
              <img src={Branding} className="w-10" />
            </div>
            <div className="mt-6">
              <h1 className="font-bold text-xl">Branding</h1>
            </div>
            <div className="mt-3 w-80 py-2">
              <p className="text-center text-gray-500 ">Create visual identity and marketing materials for your company </p>
            </div>
          </div>
        </div>
        <div>
        <div className="relative flex flex-col items-center p-6  bg-white rounded shadow-xl">
            <div className="p-8 mt-8 bg-slate-100 rounded-full ">
              <img src={Brush} className="w-10" />
            </div>
            <div className="mt-6">
              <h1 className="font-bold text-xl">Illustration</h1>
            </div>
            <div className="mt-3 w-80 py-2">
              <p className="text-center text-gray-500 ">Create character kit , empty state illustration for your design </p>
            </div>
          </div>
        </div>

        <div>
        <div className="relative flex flex-col items-center p-6  bg-white rounded shadow-xl">
            <div className="p-8 mt-8 bg-slate-100 rounded-full ">
              <img src={Graphic} className="w-10" />
            </div>
            <div className="mt-6">
              <h1 className="font-bold text-xl">Motion Graphic</h1>
            </div>
            <div className="mt-3 w-80 py-2">
              <p className="text-center text-gray-500 ">Create motion graphic with smooth and high quality</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
