import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AnonymousRoute, AuthChangeRedirector, AuthenticatedRoute, useConfig} from "../auth";
import {lazy, useEffect, useState} from "react";

const AppRouteLayout = lazy(() => import("./AppRouteLayout.tsx"));
const Home = lazy(() => import("../pages/Home.tsx"));
const Training = lazy(() => import("../pages/Training.tsx"));
const Body = lazy(() => import("../pages/Body.tsx"));
const Tasks = lazy(() => import("../pages/Tasks.tsx"));
const SignIn = lazy(() => import("../pages/SignIn.tsx"));
const SignUp = lazy(() => import("../pages/SignUp.tsx"));
const Promo = lazy(() => import("../pages/Promo.tsx"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail.tsx"));

function createRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <AuthChangeRedirector><AnonymousRoute><Promo /></AnonymousRoute></AuthChangeRedirector>,
    },
    {
      path: "/app",
      element: <AuthChangeRedirector><AuthenticatedRoute><AppRouteLayout/></AuthenticatedRoute></AuthChangeRedirector>,
      children: [
        { index: true, element: <Home/> },
        { path: "trainings", element: <Training/> },
        { path: "body", element: <Body/> },
        { path: "tasks", element: <Tasks/> },
      ],
    },
    {
      path: "/sign-in",
      element: <AuthChangeRedirector><AnonymousRoute><SignIn/></AnonymousRoute></AuthChangeRedirector>,
    },
    {
      path: "/sign-up",
      element: <AuthChangeRedirector><AnonymousRoute><SignUp/></AnonymousRoute></AuthChangeRedirector>,
    },
    {
      path: "/verify-email",
      element: <VerifyEmail/>
    }
    // {
    //   path: "/account/logout",
    //   element: <AnonymousRoute></AnonymousRoute>
    // }
  ]);

}

export default function Router() {
  const [router, setRouter] = useState<ReturnType<typeof createBrowserRouter> | null>(null)
  const config = useConfig()
  useEffect(() => {
    setRouter(createRouter())
  }, [config])
  return router ? <RouterProvider router={router} /> : null
}