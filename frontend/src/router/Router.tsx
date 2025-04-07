import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AnonymousRoute, AuthenticatedRoute, useConfig} from "../auth";
import {lazy, useEffect, useState} from "react";
import MainLayout from "./MainLayout.tsx";
import VerifyEmail, { loader as verifyEmailLoader } from "../core/pages/VerifyEmail.tsx";

const AppRouteLayout = lazy(() => import("./AppRouteLayout.tsx"));
const Exercises = lazy(() => import("../core/pages/Exercises.tsx"));
const Home = lazy(() => import("../core/pages/Home.tsx"));
const Training = lazy(() => import("../core/pages/Training.tsx"));
const Body = lazy(() => import("../core/pages/Body.tsx"));
const Tasks = lazy(() => import("../core/pages/Tasks.tsx"));
const SignIn = lazy(() => import("../core/pages/SignIn.tsx"));
const SignUp = lazy(() => import("../core/pages/SignUp.tsx"));
const Promo = lazy(() => import("../core/pages/Promo.tsx"));
const VerificationEmailSent = lazy(() => import("../core/pages/VerificationEmailSent.tsx"));

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
            { path: "exercises", element: <Exercises/>},
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
          path: "account/verify-email",
          element: <VerificationEmailSent />
        },
        {
          path: "account/verify-email/:key",
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