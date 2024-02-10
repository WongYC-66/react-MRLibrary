import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'

// pages
import Home from './pages/Home.jsx'
import Monster, { monsterAction } from './pages/monster/Monster.jsx'
import MonsterDetail from './pages/monster/MonsterDetail.jsx'
import Equips, { equipsAction } from './pages/equips/Equips.jsx'

import ExpTable from './pages/exptable/ExpTable.jsx'
import Use, { useAction } from './pages/items/Use.jsx'
import Setup, { setupAction } from './pages/items/Setup.jsx'
import Etc, { etcAction } from './pages/items/Etc.jsx'
import ItemDetail from './pages/items/ItemDetail.jsx'

import NotFound from './pages/NotFound.jsx'

// layouts
import RootLayout from './layouts/RootLayout.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={< RootLayout />}>
      <Route index element={< Home />} />
      <Route path="monster" action={monsterAction}>
        <Route index element={< Monster />}></Route>
        <Route path=":mobId" element={< MonsterDetail />}></Route>
      </Route >

      {/* Equips */}
      {
        ["weapon", 'hat', "top", "bottom", "overall", "shoes", "gloves", "cape", "shield", "faceacc", "eyeacc", "earring", "ring", "pendant"].map(pathname =>
          <Route path={pathname} action={equipsAction} key={pathname}>
            <Route index element={< Equips />}></Route>
            <Route path=":itemId" element={< ItemDetail />}></Route>
          </Route >
        )
      }
      {/* Equips */}


      {/* Items */}
      <Route path="use" action={useAction}>
        <Route index element={< Use />}></Route>
        <Route path=":itemId" element={< ItemDetail />}></Route>
      </Route >

      <Route path="setup" action={setupAction}>
        <Route index element={< Setup />}></Route>
        <Route path=":itemId" element={< ItemDetail />}></Route>
      </Route >

      <Route path="etc" action={etcAction}>
        <Route index element={< Etc />}></Route>
        <Route path=":itemId" element={< ItemDetail />}></Route>
      </Route >
      {/* Items */}

      <Route path="exptable" element={< ExpTable />} />

      <Route path="*" element={< NotFound />} />
    </Route>
  )
)



function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App