"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axiosClient from "@/lib/axios_config"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

const SignInPage = () => {

    const [username, setUserName] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const LogIn = async () => {
        setLoading(true)
        try {
            await axiosClient.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signin`,
                { username, password },
                { withCredentials: true }
            )

            toast.success("Đăng nhập thành công")

            window.location.href = "/"

        } catch (error) {
            toast.error("Sai tài khoản hoặc mật khẩu")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await LogIn()
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-sm shadow-lg rounded-2xl">
                
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-2xl font-bold">
                        Đăng nhập
                    </CardTitle>
                    <CardDescription>
                        Nhập tài khoản để tiếp tục
                    </CardDescription>

                    <CardAction>
                        <Link href="/signup">
                            <Button variant="outline" size="sm">
                                Sign Up
                            </Button>
                        </Link>
                    </CardAction>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                placeholder="username"
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2"
                            disabled={loading}
                        >
                            {loading ? "Đang đăng nhập..." : "Login"}
                        </Button>

                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full">
                        Login with Google
                    </Button>
                </CardFooter>

            </Card>
        </div>
    )
}

export default SignInPage