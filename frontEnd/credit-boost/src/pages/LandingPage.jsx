import React from 'react';
import Layout from '../components/Common/Layout';
import HeroSection from '../components/Landing/Hero';
import Solution from '../components/Landing/Solution';
import HowTo from '../components/Landing/HowTo';
import Contact from '../components/Landing/Contact';

function LandingPage() {
  return (
    <Layout>
      <main className="space-y-10 ">
        <HeroSection/>
        <HowTo/>
        <Solution/>
        <Contact/> 
      </main>
    </Layout>
  );
}

export default LandingPage;
