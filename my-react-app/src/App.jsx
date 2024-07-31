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
import EquipDetail from './pages/equips/EquipDetail.jsx'

import Use, { useAction } from './pages/items/Use.jsx'
import Setup, { setupAction } from './pages/items/Setup.jsx'
import Etc, { etcAction } from './pages/items/Etc.jsx'
import Gacha, { gachaAction } from './pages/items/Gacha.jsx'
import ItemDetail from './pages/items/ItemDetail.jsx'

import Skill, { skillAction } from './pages/skill/Skill.jsx'
import SkillDetail from './pages/skill/SkillDetail.jsx'

import All, { globalSearchAction } from './pages/all/All.jsx'

import ExpTable from './pages/tables/ExpTable.jsx'
import ElementalTable, { elementalTableAction } from './pages/tables/ElementalTable.jsx'
import NotFound from './pages/NotFound.jsx'
import AboutMe from './pages/AboutMe.jsx'

// layouts
import RootLayout from './layouts/RootLayout.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={< RootLayout />} >
      <Route index element={< Home />} />

      {/* Monster */}
      <Route path="monster" action={monsterAction}>
        <Route index element={< Monster />}></Route>
        <Route path=":mobId" element={< MonsterDetail />}></Route>
      </Route >

      {/* Equips */}
      {
        ["weapon", 'hat', "top", "bottom", "overall", "shoes", "gloves", "cape", "shield", "faceacc", "eyeacc", "earring", "ring", "pendant", "belt", "medal"].map(pathname =>
          <Route path={pathname} action={equipsAction} key={pathname}>
            <Route index element={< Equips />}></Route>
            <Route path=":equipId" element={< EquipDetail />}></Route>
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

      <Route path="gacha" action={gachaAction}>
        <Route index element={< Gacha />}></Route>
      </Route >
      {/* Items */}

      {/* Skill */}
      <Route path="skill" action={skillAction}>
        <Route index element={< Skill />}></Route>
        <Route path=":skillId" element={< SkillDetail />}></Route>
      </Route >


      {/* Tables */}
      <Route path="exptable" element={< ExpTable />} />

      <Route path="elemental-table" element={< ElementalTable />} action={elementalTableAction} />
      {/* Tables */}

      {/* Links */}
      <Route path="about-me" element={< AboutMe />} />

      <Route path="all" element={< All />} action={globalSearchAction} />

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