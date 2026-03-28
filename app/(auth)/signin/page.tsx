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
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"





const SignInPage = () => {

    const [username , setUserName] = useState("")
    const [password , setPassword] = useState("")

    const router = useRouter()

    const LogIn = async () => {
        try {
            const res = await axiosClient.post("http://localhost:5001/api/auth/signin" , {
                username , 
                password
            }, { withCredentials: true })
           

            console.log("Đăng nhập thành công")
            toast.success("Đăng nhập thành công")
            router.replace("/")

        } catch (error) {
            console.log("Lỗi đăng nhập" , error)
            toast.error("Lỗi đăng nhập")
        }
    }

    const handleSubmit = async () => {
        try {
            await LogIn()
        } catch (error) {
            console.log("Lỗi submit " , error)
        }
    }


    return (
        <div  className="items-center justify-center flex mt-40">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your username below to login to your account
                    </CardDescription>
                    <CardAction>
                        <Link href="/signup">
                            <Button> Sign Up
                            </Button>
                        </Link>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="username"
                                    placeholder="username"
                                    required
                                    value={username}
                                    onChange={(u) => setUserName(u.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="password"
                                    value={password}
                                    onChange={(p)=> setPassword(p.target.value)}

                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button 
                    type="submit" 
                    className="w-full"
                    onClick={handleSubmit}
                    >
                        Login
                    </Button>
                    <Button variant="outline" className="w-full">
                        Login with Google
                    </Button>
                </CardFooter>
            </Card>
        </div>

    )
}


export default SignInPage