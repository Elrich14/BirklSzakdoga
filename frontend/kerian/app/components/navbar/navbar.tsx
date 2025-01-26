"use client"
import { AppBar, Button, Link, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";

export default function Navbar( ){
    const [user, setUser] = useState<string | null>(null);

    const routes = [
        {
            path: "/",
            name: "Home",
        },
        {
            path: "/login",
            name: "Login",
            if: "loggedOut"
        },
        {
            path: "/register",
            name:"Register",
            if: "loggedOut"
        },
        {
            path: "/logout",
            name: "Logout",
            if:"loggedIn"
        }
    ]

    useEffect(() => {
        const handleCustomEvent = () => {
            const user = localStorage.getItem('user');
            if (user) {
                setUser(user);

            }
        };
        handleCustomEvent();
    
        window.addEventListener('userChanged', handleCustomEvent);
    
        return () => {
          window.removeEventListener('userChanged', handleCustomEvent);
        };
      }, []);
    return (
        <AppBar position="static">
              <Toolbar>
                {
                    routes.filter(
                        (r) => r.if ? r.if === (user ? "loggedIn" : "loggedOut") :true 
                    ).map((route, index) => (
                        <Link href={route.path}
                        key={index}>
                            <Button>
                                {route.name}
                            </Button>
                            </Link>))
                }
              </Toolbar>
            </AppBar>     
    )    
}