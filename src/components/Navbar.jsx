import React, { useState } from 'react'
import settingIcon from '../assets/setting.svg'
import Setting from './Setting'

function Navbar({ screen, setScreen }) {
  const [showSettings, setShowSettings] = useState(false)

  const sections = ["sales", "purchase", "statistics"];
  return (
    <>
      <div className="flex w-[95%] items-center justify-between p-4 mx-auto text-white">
        <div className="text-xl font-bold">Ganinath Enterprise</div>
        <div className="flex space-x-4">
          {sections.map((section) => (
            <div
              key={section}
              id={section}
              className={`sectionButton cursor-pointer text-xl hover:text-blue-500 ${screen === section ? "text-blue-500 font-bold" : ""
                }`}
              onClick={() => setScreen(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="h-8 w-8 cursor-pointer rounded-lg p-1 transition hover:rotate-45 hover:bg-white/10"
          aria-label="Settings"
        >
          <img
            src={settingIcon}
            alt="Settings"
            className="h-full w-full object-contain brightness-0 invert"
          />
        </button>
      </div>

      {showSettings && (
        <Setting onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}

export default Navbar