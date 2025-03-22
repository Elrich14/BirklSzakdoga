"use client"

import { redirect } from "next/navigation"
import { useEffect } from "react"

export default function Logout() {
    useEffect(() => {
        localStorage.removeItem("user")
        window.dispatchEvent(new Event("userChanged"))
        redirect("/login")
    }, [])

}