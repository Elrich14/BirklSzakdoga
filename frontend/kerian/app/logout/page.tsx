"use client"

import { redirect } from "next/navigation"

export default function Logout() {
    localStorage.removeItem("user")
    window.dispatchEvent(new Event("userChanged"))
    redirect("/login")
}