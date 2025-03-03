import {AuthChangeRedirector} from "../auth";
import {Outlet} from "react-router-dom";

export default function AuthenticationLayout() {
  return (
    <AuthChangeRedirector>
      <Outlet/>
    </AuthChangeRedirector>
  );
}
