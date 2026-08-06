import Hero from "../components/Home/Hero"
import Features from "../components/Home/Features"
import HomeCategories from "../components/Home/HomeCategories"
import PopularProduct from "../components/Home/PopularProduct"
import AppPromoBanner from "../components/Home/AppPromoBanner"
import Newsletter from "../components/Home/Newsletter"

const Home = () => {
  return (
    <div className="min-h-screen max-w-[1400px] mx-auto px-6 py-12">
        <Hero />
        <Features />
        <HomeCategories />
        <PopularProduct />
        <AppPromoBanner />
        <Newsletter />
    </div>
  )
}

export default Home 