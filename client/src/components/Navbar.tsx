import { ArrowUpRightIcon, ChevronDownIcon, LogOutIcon, MapPinIcon, MenuIcon, PackageIcon, SearchIcon, ShieldIcon, ShoppingBasketIcon, UserIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";


const Navbar = () => {
    const user: any = {name: "Be Gee", email: "be@example.com", isAdmin: true} /* {name: "Be Gee", email: "be@example.com", isAdmin: true} or if [any = null] then sign in option will be showed */
    const {cartCount, setIsCartOpen} = useCart()
    const [searchQuery, setsearchQuery] = useState("")
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const navigate = useNavigate ()

    const handleSearch = (e: React.SubmitEvent)=>{
        e.preventDefault()
        if(searchQuery.trim()){
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setsearchQuery("")
        }
    }
    
    const handleLogout = () =>{
        setUserMenuOpen(false)
        navigate("/")
    }

  return (
    <nav className="bg-white sticky top-0 z-50 border-app-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
            {/* logo */}
            <Link to='/' onClick={()=> console.log("clicked")} className="flex items-center gap-2 text-[22px] font-medium shrink-0">
                <ShoppingBasketIcon size={24} /> Basket ~ Bounce
            </Link>

            <div className="w-full flex items-center justify-end gap-4 lg:gap-10">
                {/* Nav Links - Desktop */}
                <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600">
                    <Link to='/'>Home</Link>
                    <Link to='/products'>Products</Link>
                    <Link to='/sales' className="text-app-orange">Sales</Link>
                </div>
                {/* Search */}
                <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-sm text-xs sm:text-sm">
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-2.5 top-1/2-translate-y-1/2 size-5 text-zinc-500" />
                        <input type="text" placeholder="Search for Products..." value={searchQuery} onChange= {(e)=> setsearchQuery(e.target.value)} className="w-full pl-15 p-1.5 bg-orange-50 rounded-full ring ring-app-orange/15 focus:ring-app-orange/30" />
                    </div>
                </form>

                {/* Right Action */}
                <div className="flex items-center gap-3">
                    {/* Cart */}
                    <button className="relative p-2 rounded-xl" onClick={()=>setIsCartOpen(true)}>
                        <ShoppingBasketIcon className="size-5 text-zinc-900" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 size-4 bg-app-orange text-white text-[10px] rounded-full flex-center">{cartCount}</span>}
                    </button>
                    {/* User */}
                    <div className="relative">
                        {user ? (
                            <button onClick={()=> setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2">
                                <div className="size-7 rounded-full bg-green-950 text-white flex-center">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDownIcon className="size-3 text-zinc-500" />
                            </button>
                        )
                        : (
                            <div className="flex-center gap-2">
                                <Link to='/login' className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-950 rounded-full hover:bg-green-950-light transition-colors">
                                <UserIcon size={15}/> Sign In
                                </Link>
                                {userMenuOpen ? <XIcon className="md:hidden" onClick={()=> setUserMenuOpen(!userMenuOpen)}/> : <MenuIcon className="md:hidden" onClick={() => setUserMenuOpen(!userMenuOpen)}/>}
                            </div>
                        )}

                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={()=> setUserMenuOpen(false)} />
                                <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-x1 shadow-lg border border-app-border py-2 z-50 animate-fade-in">
                                    {user && (
                                        <div className="px-4 py-2 border-b border-app-border">
                                            <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
                                            <p className="text-xs text-zinc-500">{user?.email}</p>
                                        </div>
                                    )}
                                    <div onClick={()=> setUserMenuOpen(false)}>
                                    {!user && <Link to='/login' className="dropdown-link"><UserIcon size={15} /> Sign In </Link>}
                                    {user && <Link to='/order' className="dropdown-link"><PackageIcon size={15} /> My Orders </Link>}
                                    {user && <Link to='/address' className="dropdown-link"><MapPinIcon size={15} /> Address </Link>}
                                    <Link to='/products' className="dropdown-link md:hidden"><ArrowUpRightIcon size={15} /> Products </Link>
                                    <Link to='/sales' className="dropdown-link md:hidden"><ArrowUpRightIcon size={15} /> Sales </Link>
                                    
                                    {user?.isAdmin && (
                                        <Link to='/admin/products' className="dropdown-link"><ShieldIcon className="text-app-orange-dark" size={15} /> <span className="text-app-orange-dark"> Admin Panel </span> </Link>)}
                                    {user && (
                                        <div className="border-t border-app-border pt-1">
                                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-app-error hover:bg-red-50 w-full transition-colors">
                                                <LogOutIcon size={16} /> Logout
                                            </button>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </nav>
  )
}

export default Navbar