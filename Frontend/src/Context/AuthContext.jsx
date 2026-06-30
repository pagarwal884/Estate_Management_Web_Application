import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import API_URL from '../config.js'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const [token, setToken] = useState(
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        null
    )

    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (token) {
            const storedUser =
                localStorage.getItem("user") ||
                sessionStorage.getItem("user")

            if (storedUser) {
                setUser(JSON.parse(storedUser))
            }
        }

        setLoading(false)
    }, [token])

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)