import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AnonymousRoute, AuthenticatedRoute, useConfig} from "../auth";
import {lazy, useEffect, useState} from "react";
import MainLayout from "./MainLayout.tsx";
import VerifyEmail, { loader as verifyEmailLoader } from "../pages/VerifyEmail.tsx";
import PageNotFound from "../pages/PageNotFound.tsx";

const AppRouteLayout = lazy(() => import("./AppRouteLayout.tsx"));
const Home = lazy(() => import("../pages/Home.tsx"));
const Training = lazy(() => import("../pages/Training.tsx"));
const Body = lazy(() => import("../pages/Body.tsx"));
const Tasks = lazy(() => import("../pages/Tasks.tsx"));
const SignIn = lazy(() => import("../pages/SignIn.tsx"));
const SignUp = lazy(() => import("../pages/SignUp.tsx"));
const Promo = lazy(() => import("../pages/Promo.tsx"));
const VerificationEmailSent = lazy(() => import("../pages/VerificationEmailSent.tsx"));

function createRouter() {
  return createBrowserRouter([
    {
      path: "/",
      element: <MainLayout/>,
      children: [
        {
          index: true,
          element: <AnonymousRoute><Promo /></AnonymousRoute>,
        },
        {
          path: "app",
          element: <AuthenticatedRoute><AppRouteLayout/></AuthenticatedRoute>,
          children: [
            { index: true, element: <Home/> },
            { path: "trainings", element: <Training/> },
            { path: "body", element: <Body/> },
            { path: "tasks", element: <Tasks/> },
          ],
        },
        {
          path: "sign-in",
          element: <AnonymousRoute><SignIn/></AnonymousRoute>,
        },
        {
          path: "sign-up",
          element: <AnonymousRoute><SignUp/></AnonymousRoute>,
        },
        {
          path: "verify-email",
          element: <VerificationEmailSent />
        },
        {
          path: "verify-email/:key",
          element: <VerifyEmail />,
          loader: verifyEmailLoader,
        }
      ]
    }
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