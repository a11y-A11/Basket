import { useState } from "react"
import { heroSectionData } from "../assets/assets"
import { Link } from "react-router-dom"
import { Loader2Icon, LockIcon, MailIcon, ShoppingBasketIcon, UserIcon } from "lucide-react"


const Login = () => {
    const [isLogindistrict, setIsLogindistrict] = useState(true)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent)=>{
        e.preventDefault()
        setLoading(true);
        setTimeout(()=> window.location.href = "/", 1000)
    }

  return ( 
    <div className="min-h-screen flex">
        {/*left side*/}
        <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center"> 
        <img src={heroSectionData.hero_image} alt="" className="absolute inset-0 object-cover h-full bg-center opacity-10"/>
            <div className="relative text-center px-12">
                <h2 className="text-4xl font-semibold text-white mb-4"> Welcome back to Basket~Bounce</h2>
                <p className="text-white/60 font-serif text-xl max-w-sm mx-auto"> Fresh organic products, delivered to you.</p>
            </div>
        </div>

        {/*right side*/}
        <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
            <div className="w-full max-w-md">
                {/* form header message */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <ShoppingBasketIcon className="size-8 text-app-green" />
                        <span className="text-2x1 font-semibold text-app-green">Basket ~ Bounce</span>
                    </Link>
                    <h1 className="text-2x1 font-semibold text-app-green mb-2">{isLogindistrict ? "Sign in to your account" : "Sign up for an account!"}</h1>
                    <p>{isLogindistrict ? "Don't have an account?" : "Already have an account!"}<button onClick={()=>setIsLogindistrict(!isLogindistrict)} 
                    className="text-orange-500 ml-1 font-semibold hover:text-orange-600 transition-colors">{isLogindistrict ? "Create one" : "Sign in"}</button></p>
                </div>

                {/* login/register form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogindistrict && (
                        <label className="text-sm flex-col gap-1">
                            Name
                            <div className="relative">
                                <UserIcon className="absolute left-3.5 top-1/6-translate-y-1/2 size-6 text-app-text-light" />
                                <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required placeholder="Your Name" className="w-full pl-13
                                pr-4 py-3 text-sm bg-white rounded-x1 border not-focus:border-app-border transition-all" />

                            </div>
                        </label>
                    )}
                        <label className="text-sm flex-col gap-1">
                            Email Address
                            <div className="relative">
                                <MailIcon className="absolute left-3.5 top-1/2-translate-y-1/2 size-6 text-app-text-light" />
                                <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required placeholder="you@Example.com" className="w-full pl-13 
                                pr-16 py-3 text-sm bg-white rounded-x1 border not-focus:border-app-border transition-all" />
                                
                            </div>
                        </label>
                        <label className="text-sm flex-col gap-1">
                            Password
                            <div className="relative">
                                <LockIcon className="absolute left-3.5 top-1/2-translate-y-1/2 size-6 text-app-text-light" />
                                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required placeholder="*******" className="w-full 
                                pl-13 pr-16 py-3 text-sm bg-white rounded-x1 border not-focus:border-app-border transition-all" />
                                
                            </div>
                        </label>
                    <button type="submit" disabled={loading} className="block w-1/2 mx-auto py-3 bg-green-950 text-white font-semibold rounded-x1 hover:bg-green-900  
                    transition-colors disabled:opacity-50"> {loading ? <Loader2Icon className="animate-spin"/> : isLogindistrict ? "Sign In" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default Login