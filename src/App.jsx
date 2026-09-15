import { useState } from 'react'
import Navbar from './components/Navbar'
import SalesScreen from './screens/SalesScreen'
import PurchaseScreen from './screens/PurchaseScreen'
import StatisticsScreen from './screens/StatisticsScreen'
import './App.css'

function App() {
  const [screen, setScreen] = useState("sales")

  return (
    <>
      <div id="container" className="flex flex-col h-screen">
        <Navbar screen={screen} setScreen={setScreen} />
        <div id="content" className=" grow p-4">
          {screen === "sales" && <SalesScreen />}
          {screen === "purchase" && <PurchaseScreen />}
          {screen === "statistics" && <StatisticsScreen />}
        </div>
      </div>
    </>
  )
}

export default App
