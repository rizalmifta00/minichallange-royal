import { page } from 'web-init'
import Header from 'src/components/Header'
import Video from 'src/components/Video'
import Job from 'src/components/Job'
import Footer from 'src/components/Footer'
import Product from 'src/components/Product'
import Testimoni from 'src/components/Testimoni'
import Services from 'src/components/Services'
import HowItWork from 'src/components/HowItWork'


export default page({
  url: '/landingpage',
  component: ({}) => {
    return <div>
        <div className="bg-emerald-900 min-h-screen ">
        <Header />
        <div className="m-auto">
          <div className="items-center justify-center   ">
            <div className="pt-28 text-center ">
              <div className="text-6xl text-white font-bold ">
              <h1 className="">We create digital product</h1>
              <h1>and solve your problem</h1>
              </div>
              <div className="text-md pt-8 text-white font-extralight opacity-75">
              <p>A fully integrated digital agency that will help you create beautiful website and</p>
              <p>solve your problem in your company</p>
              
              </div>
              <div className ="pt-7 space-x-10">
                <button className="bg-white rounded-full px-4 py-2 ">Get Started</button>
                <button className="text-white">Learn More</button>
              </div>
            </div>
          </div>
        </div>
    </div>
    
    <Video/>
    <Job/>
    <Services/>
    <HowItWork/>
    <Product/>
    <Testimoni/>
    <Footer/>
    </div>
  }
})