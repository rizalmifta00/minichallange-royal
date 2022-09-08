import React from 'react'

const menus = ["Pricing","About","Learn","Corporate","News"]
export default function Header() {
  return (
    <header className="max-w-7xl mx-auto flex flex-row pt-7 items-center space-x-72">
        <h1 className=" text-xl text-slate-300">Dorry</h1>
        <div className="flex">
            <ul className="flex flex-row space-x-16">
                {menus.map(menu => (
                    <li key={menu} className="text-slate-300 text-xl text-base hover:text-white">{menu}</li>
                ))}
            </ul>
        </div>
        <div className="space-x-6 flex flex-row items-center">

            <button className=" border border-white-500  text-slate-300 text-base rounded-full px-6 py-2 hover:text-white">Contact</button>
        </div>

       
    </header>

  )
}
