// app/page.js
// Root page — assembles all section components.
// 'use client' is NOT here; individual components declare it where needed.

import Preloader from '../components/Preloader';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import HowItWorks from '../components/HowItWorks';
import CustomBlend from '../components/CustomBlend';
import FeaturedFragrances from '../components/FeaturedFragrances';
import Reviews from '../components/Reviews';
import OrderForm from '../components/OrderForm';
import WhatsAppCTA from '../components/WhatsAppCTA';
import Footer from '../components/Footer';
import Toast from '../components/Toast';

export default function HomePage() {
  return (
    <>
      <Preloader />
      <Navbar />
      <Hero />
      <About />
      <HowItWorks />
      <CustomBlend />
      <FeaturedFragrances />
      <Reviews />
      <OrderForm />
      <WhatsAppCTA />
      <Footer />
      <Toast />
    </>
  );
}