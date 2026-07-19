import Header from '@/components/Header'
import Hero from '@/components/Hero'
import VideoIntro from '@/components/VideoIntro'
import SectionIntro from '@/components/SectionIntro'
import SectionAISolution from '@/components/SectionAISolution'
import SectionProductDemo from '@/components/SectionProductDemo'
import SectionFeatureExperience from '@/components/SectionFeatureExperience'
import SectionInfo from '@/components/SectionInfo'
import SectionTeam from '@/components/SectionTeam'
import SectionCTA from '@/components/SectionCTA'
import SectionContact from '@/components/SectionContact'
import Footer from '@/components/Footer'
import SectionStory from '@/components/SectionStory'

export default function HomePage() {
  return (
    <>
      <VideoIntro />
      <Header />
      <Hero />
      <SectionStory />
      <SectionIntro />
      <SectionAISolution />
      <SectionProductDemo />
      <SectionFeatureExperience />
      <SectionInfo />
      <SectionTeam />
      <SectionContact />
      <SectionCTA />
      <Footer />
    </>
  )
}
