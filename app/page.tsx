import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SectionStory from '@/components/SectionStory'
import SectionProblem from '@/components/SectionProblem'
import SectionBenefits from '@/components/SectionBenefits'
import SectionDemo from '@/components/SectionDemo'
// import SectionGallery from '@/components/SectionGallery'
// import SectionSolution from '@/components/SectionSolution'
import SectionTeam from '@/components/SectionTeam'
import SectionCTA from '@/components/SectionCTA'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <SectionStory />
      <SectionProblem />
      <SectionBenefits />
      <SectionDemo />
      <SectionTeam />
      {/* <SectionGallery />
      <SectionSolution /> */}
      <SectionCTA />
      <Footer />
    </>
  )
}
