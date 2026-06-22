import Header from "@/components/Navigation/Header"
import BottomTabBar from "@/components/Navigation/BottomTabBar"
import Footer from "@/components/Footer/Footer"

export default function ShopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {/* pt-16 compense le header fixed (64px). Sur la homepage le hero remplit tout l'écran donc on ne le met pas ici mais le hero intègre pt-32 */}
      <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      <Footer />
      <BottomTabBar />
    </>
  )
}
