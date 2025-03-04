import {AuthChangeRedirector} from "../auth";
import {Outlet} from "react-router-dom";

export default function MainLayout() {
  return (
    <AuthChangeRedirector>
      <Outlet/>
    </AuthChangeRedirector>
  );
}
