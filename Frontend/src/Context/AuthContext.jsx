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

        const interceptor = axios.interceptors.response.use((response) => response, 
        (error) => {
            if(error.response && error.response.status === 403 && error.response.data.message.includes("blocked")){
                logout()
            }
            return Promise.reject(error)
        })
        return () => {
    axios.interceptors.response.eject(interceptor)
}
    }, [token])

    // login 
    const login = async(email, password) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {email, password})
            const {token, user} = res.data
            setToken(token)
            setUser(user)

            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(user))

            return {success: true}
        } catch (err) { 
            return {
                success: false,
                message: err.response?.data?.message || "Login Denied or failed"
            }
        }
    }

    // Register a user
    const register = async (userData) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, userData)
            return {
                success: true,
                message: res.data.message
            }
        } catch (err) { 
            return {
                success: false,
                message: err.response?.data?.message || "Login Denied or failed"
            }
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)