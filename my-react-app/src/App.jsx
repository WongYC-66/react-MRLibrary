import {
  createBrowserRouter, 
  createRoutesFromElements,
  Route, 
  RouterProvider
} from 'react-router-dom'

// pages
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Faq from './pages/help/Faq.jsx'
import Contact, { contactAction } from './pages/help/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import Careers, { careersLoader } from './pages/careers/Careers.jsx'
import CareerDetails, { careerDetailsLoader } from './pages/careers/CareerDetails.jsx'
import CareersError from './pages/careers/CareersError.jsx'


// layouts
import RootLayout from './layouts/RootLayout.jsx'
import HelpLayout from './layouts/HelpLayout.jsx'
import CareersLayout from './layouts/CareersLayout.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="help" element={<HelpLayout />} > 
        <Route path="faq" element={< Faq /> }/>
        <Route path="contact" element={< Contact /> } action={contactAction} />
      </Route > 
      <Route path="careers" element={< CareersLayout />} errorElement={< CareersError />}>
        <Route 
          index 
          element={<Careers />}
          loader={careersLoader}
          // errorElement={< CareersError />}
        />
          
        <Route 
          path=":id" 
          element={< CareerDetails />}
          loader={careerDetailsLoader}
          // errorElement={< CareersError />}  
        />
      </Route> 

      <Route path="*" element={<NotFound />} />
    </Route>
  )
)



function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App