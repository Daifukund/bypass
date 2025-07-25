"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, TrendingUp, Mail, Clock } from "lucide-react";
import posthog from "posthog-js";
import { TypingHeadline } from "@/components/ui/typing-headline";
import { AnimatedCtaButton } from "@/components/ui/animated-cta-button";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subheadlines for typing animation - different value propositions
  const subheadlines = [
    "90% of job applications get ignored. We fix that.",
    "Skip the job board queue. Contact decision-makers directly.",
    "3.2x more interviews. 67% response rate vs 2% on job boards.",
    "While others send 200+ apps, you'll send 20 targeted messages.",
    "From application to interview in 5 days, not 5 months.",
  ];

  useEffect(() => {
    posthog.capture("landing_page_viewed");
  }, []);

  const handleCtaClick = (ctaType: string, location: string) => {
    posthog.capture("cta_clicked", {
      cta_type: ctaType,
      cta_location: location,
      user_type: "anonymous",
    });
  };

  const handleDemoClick = () => {
    posthog.capture("demo_requested", {
      source: "hero_section",
    });
  };

  const handleNavClick = (navItem: string) => {
    posthog.capture("navigation_clicked", {
      nav_item: navItem,
      device: window.innerWidth < 768 ? "mobile" : "desktop",
    });
  };

  const handleSectionScroll = (sectionName: string) => {
    posthog.capture("section_viewed", {
      section: sectionName,
    });
  };

  const handleSignupClick = (location: string) => {
    posthog.capture("signup_clicked", {
      button_location: location,
    });
  };

  return (
    <div className="bg-white text-gray-900">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Bypass</div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex gap-6 text-sm font-medium">
            <li>
              <Link
                href="#how"
                onClick={() => handleNavClick("how_it_works")}
                className="hover:text-gray-600 transition-colors"
              >
                How it Works
              </Link>
            </li>
            <li>
              <Link
                href="#pricing"
                onClick={() => handleNavClick("pricing")}
                className="hover:text-gray-600 transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                onClick={() => handleNavClick("login")}
                className="hover:text-gray-600 transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                onClick={() => handleNavClick("signup_nav")}
                className="hover:text-gray-600 transition-colors"
              >
                Sign Up
              </Link>
            </li>
          </ul>

          {/* Desktop CTA - Enhanced */}
          <AnimatedCtaButton
            href="/signup"
            onClick={() => handleSignupClick("navbar")}
            className="hidden md:flex"
            showSparkles={false}
          >
            Start Free Trial
          </AnimatedCtaButton>

          {/* Mobile Menu Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              posthog.capture("mobile_menu_toggled", {
                action: !mobileMenuOpen ? "opened" : "closed",
              });
            }}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li>
                <Link
                  href="#how"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick("how_it_works_mobile");
                  }}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick("pricing_mobile");
                  }}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick("login_mobile");
                  }}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick("signup_nav_mobile");
                  }}
                  className="block py-2 hover:text-gray-600 transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
            <AnimatedCtaButton
              href="/signup"
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignupClick("mobile_menu");
              }}
              className="mt-4 w-full"
              showSparkles={false}
            >
              Start Free Trial
            </AnimatedCtaButton>
          </div>
        )}
      </nav>

      {/* Hero Section with animated background */}
      <section className="relative px-4 sm:px-6 py-8 sm:py-12 lg:py-20 text-center max-w-4xl mx-auto overflow-hidden">
        {/* Floating Blobs Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-200 to-purple-200"></div>
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-purple-400/40 to-pink-400/40 rounded-full blur-3xl animate-pulse-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        </div>

        {/* Your existing content here */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight px-2">
          <span className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-gradient">
            Stop Getting Ghosted
          </span>
          <br />
          <span className="text-gray-900">on Job Applications</span>
        </h1>

        {/* Dynamic Typing Subheadline */}
        <div className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 text-gray-600 max-w-2xl mx-auto px-2 min-h-[1.5em]">
          <TypingHeadline
            phrases={subheadlines}
            className="block"
            typingSpeed={60}
            deletingSpeed={30}
            pauseDuration={3000}
          />
        </div>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-4 px-2">
          <AnimatedCtaButton
            href="/signup"
            onClick={() => handleSignupClick("hero")}
            variant="primary"
            showSparkles={true}
          >
            Find Jobs in 5 Minutes
          </AnimatedCtaButton>

          <AnimatedCtaButton
            href="#demo"
            onClick={handleDemoClick}
            variant="secondary"
            showSparkles={false}
          >
            See Demo
          </AnimatedCtaButton>
        </div>

        <p className="text-xs sm:text-sm text-gray-500">
          No credit card required • 1,200+ students hired
        </p>

        {/* Before vs After Comparison */}
        <div className="mt-8 sm:mt-10 flex flex-col lg:flex-row gap-8 justify-center items-start max-w-6xl mx-auto">
          {/* Traditional Applications */}
          <div className="w-full lg:w-1/2 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-6 shadow-xl border border-slate-300 relative overflow-hidden">
              {/* Torn paper effect */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-red-500 to-red-400"></div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-slate-600 text-sm font-medium ml-2">
                  rejection_emails.txt
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 text-center">
                This is what most applications get you
              </h3>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="bg-white/80 p-3 rounded-xl shadow-sm border-l-4 border-red-400">
                  <p>
                    <span className="bg-yellow-200 px-1 rounded">Unfortunately</span>, after careful
                    consideration, we've decided to move forward with other candidates whose
                    qualifications more closely match the requirements of the position.
                  </p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl shadow-sm border-l-4 border-red-400">
                  <p>
                    We have carefully reviewed your application and{" "}
                    <span className="bg-yellow-200 px-1 rounded">unfortunately</span>, we have
                    decided not to move forward with your application at this time.
                  </p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl shadow-sm border-l-4 border-red-400">
                  <p>
                    <span className="bg-yellow-200 px-1 rounded">Unfortunately</span> we are unable
                    to provide feedback due to the high volume of applications received.
                  </p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl shadow-sm border-l-4 border-red-400">
                  <p>
                    <span className="bg-yellow-200 px-1 rounded">Unfortunately</span>, we won't be
                    progressing your application to the next stage. We know this may be
                    disappointing but we really value your time and efforts.
                  </p>
                </div>
                <div className="bg-white/80 p-3 rounded-xl shadow-sm border-l-4 border-red-400">
                  <p>
                    After reviewing your application,{" "}
                    <span className="bg-yellow-200 px-1 rounded">unfortunately</span> we will not be
                    proceeding with your application at this time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bypass Results */}
          <div className="w-full lg:w-1/2 transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-3xl p-6 shadow-xl border border-emerald-200 relative overflow-hidden">
              {/* Success ribbon */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400"></div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                <span className="text-slate-600 text-sm font-medium ml-2">success_replies.txt</span>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 text-center">
                This is what Bypass users receive
              </h3>

              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-700">
                <div className="bg-white/90 p-3 rounded-xl shadow-sm border-l-4 border-emerald-400">
                  <p className="mb-2">
                    Hi, we'd be happy to schedule an interview with you. Would Wednesday at 2:00 PM
                    work for you?
                  </p>
                  <p className="text-green-600 font-medium">✅ Interview Scheduled</p>
                </div>

                <div className="bg-white/90 p-3 rounded-xl shadow-sm border-l-4 border-blue-400">
                  <p className="mb-2">
                    Let's have a quick call to discuss the role further. Does tomorrow around 11:30
                    AM suit you?
                  </p>
                  <p className="text-blue-600 font-medium">📞 Call Confirmed</p>
                </div>

                <div className="bg-white/90 p-3 rounded-xl shadow-sm border-l-4 border-purple-400">
                  <p className="mb-2">
                    You can reach out to Julia and share your CV directly with her, she's leading
                    the recruitment for this position.
                  </p>
                  <p className="text-purple-600 font-medium">🎯 Referral Response</p>
                </div>

                <div className="bg-white/90 p-3 rounded-xl shadow-sm border-l-4 border-orange-400">
                  <p className="mb-2">
                    Hey, got your message. Yes, we can definitely have a quick conversation. How
                    about sometime tomorrow morning?
                  </p>
                  <p className="text-orange-600 font-medium">📩 Fast Reply</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Better mobile university logos */}
      <section className="bg-gray-50 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 text-center" id="trust">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-6 sm:mb-8">
          Trusted by Students from Top Universities
        </h2>
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <Image
            src="/universities/hec.svg"
            alt="HEC Paris"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/bocconi.svg"
            alt="Bocconi"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/lse.svg"
            alt="London School of Economics"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/essec.svg"
            alt="ESSEC"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/berkley.svg"
            alt="Berkley"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/mit.svg"
            alt="MIT"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/imperial.svg"
            alt="Imperial"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/stanford.svg"
            alt="Stanford"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
          <Image
            src="/universities/oxford.svg"
            alt="Oxford"
            width={120}
            height={120}
            className="opacity-70 hover:opacity-100 transition-opacity w-16 sm:w-20 lg:w-24 h-auto mx-auto"
          />
        </div>
        <p className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold mb-6 sm:mb-8 px-2">
          Used by 1,200+ students to land jobs at LVMH, McKinsey, Goldman Sachs, Google, BCG, Amazon
          and more.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="text-2xl sm:text-3xl mb-2">📈</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">3.2x</div>
            <div className="text-xs sm:text-sm text-gray-600">more interview invitations</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="text-2xl sm:text-3xl mb-2">📬</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">67%</div>
            <div className="text-xs sm:text-sm text-gray-600">
              response rate vs 2% on job boards
            </div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="text-2xl sm:text-3xl mb-2">⏱️</div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">5 days</div>
            <div className="text-xs sm:text-sm text-gray-600">avg time to first interview</div>
          </div>
        </div>
      </section>

      {/* How it Works - Better mobile layout */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 text-center" id="how">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8">How it Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center max-w-6xl mx-auto">
          <div className="px-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">🎯</span>
            </div>
            <div className="bg-red-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-lg font-bold mx-auto mb-3">
              1
            </div>
            <h3 className="font-bold text-lg sm:text-xl mb-3">Target</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Tell us your dream role and industry
              <br />→ AI finds 50+ hiring companies
            </p>
          </div>

          <div className="px-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">🔍</span>
            </div>
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-lg font-bold mx-auto mb-3">
              2
            </div>
            <h3 className="font-bold text-lg sm:text-xl mb-3">Connect</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Pick companies
              <br />→ We find the right people
            </p>
          </div>

          <div className="px-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl sm:text-3xl">💬</span>
            </div>
            <div className="bg-green-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-lg font-bold mx-auto mb-3">
              3
            </div>
            <h3 className="font-bold text-lg sm:text-xl mb-3">Contact</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Get verified emails + personalized
              <br />
              messages that get replies
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 p-4 sm:p-5 bg-gray-50 rounded-xl max-w-3xl mx-auto">
          <p className="text-sm sm:text-base">
            <span className="font-medium text-red-600">Traditional:</span> 3–6 months, 200+ apps
            <span className="mx-2 sm:mx-3 text-base sm:text-lg">VS</span>
            <span className="font-medium text-green-600">Bypass:</span> 2–3 weeks, 20 contacts
          </p>
        </div>
      </section>

      {/* Features - Better mobile cards */}
      <section className="bg-gray-100 py-8 sm:py-12 lg:py-16 px-4 sm:px-6" id="features">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-10">
          What You Get
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-base sm:text-lg mb-2">🚀 Smart Company Discovery</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Our AI identifies companies hiring for your profile—not just posting generic jobs.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-base sm:text-lg mb-2">🎯 Decision-Maker Detection</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Skip HR. Get access to hiring managers, leads, and founders directly.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-base sm:text-lg mb-2">🤖 AI Message Crafting</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Get personalized emails referencing company news, pain points, and projects.
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-base sm:text-lg mb-2">📧 Verified Contact Data</h3>
            <p className="text-sm sm:text-base text-gray-600">
              85% accuracy. Real people, real results.
            </p>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 text-center" id="demo">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6">See It in Action</h2>
        <div className="mx-auto rounded-xl shadow-xl w-full max-w-3xl bg-gradient-to-br from-gray-50 to-gray-100 aspect-video flex items-center justify-center border">
          <div className="text-center">
            <div className="text-5xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Demo Video Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              See how students get 3x more interviews in under 3 minutes
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Recording in progress</span>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Better mobile layout */}
      <section className="bg-gray-50 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 text-center">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8">Student Results</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="text-3xl sm:text-4xl mb-3">🎯</div>
            <blockquote className="text-sm sm:text-base text-gray-700 mb-3 italic">
              "Got 3 interviews in one week using Bypass. Way better than sending 100+ applications
              on LinkedIn."
            </blockquote>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Sarah, HEC Paris</p>
            <p className="text-xs text-gray-500">Marketing Role at LVMH</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="text-3xl sm:text-4xl mb-3">⚡</div>
            <blockquote className="text-sm sm:text-base text-gray-700 mb-3 italic">
              "Landed my dream consulting job in 2 weeks. The personalized emails actually get
              responses."
            </blockquote>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Marcus, LSE</p>
            <p className="text-xs text-gray-500">Consultant at McKinsey</p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="text-3xl sm:text-4xl mb-3">🚀</div>
            <blockquote className="text-sm sm:text-base text-gray-700 mb-3 italic">
              "Finally broke into tech! Bypass helped me connect directly with hiring managers
              instead of HR."
            </blockquote>
            <p className="text-xs sm:text-sm font-medium text-gray-900">Emma, Berkeley</p>
            <p className="text-xs text-gray-500">Product Manager at Google</p>
          </div>
        </div>
      </section>

      {/* Pricing - Better mobile cards */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 text-center" id="pricing">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">Pricing</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-2">
          Free forever. Pay only if you need more credits.
        </p>
        <p className="text-xs sm:text-sm text-green-600 font-medium mb-6 sm:mb-8">
          ✅ Most users get hired on the free plan
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="border rounded-xl p-4 sm:p-6 bg-white shadow-sm relative">
            <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                Perfect for trying out Bypass
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-2">Free Plan</h3>
            <div className="mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl font-bold">€0</div>
              <div className="text-xs sm:text-sm text-gray-500">Forever</div>
            </div>
            <ul className="text-xs sm:text-sm text-left space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">🏢</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Company Searches</div>
                  <div className="text-gray-600">Limited (until 5 emails used)</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">👤</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Contact Searches</div>
                  <div className="text-gray-600">Limited (until 5 emails used)</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">📧</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Email Generations</div>
                  <div className="text-gray-600">5 Free Emails</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">⚡</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">AI Customization</div>
                  <div className="text-gray-600">Limited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs">💬</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Support</div>
                  <div className="text-gray-600">Community</div>
                </div>
              </li>
            </ul>
            <Link
              href="/signup"
              className="block w-full bg-gray-100 text-gray-800 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              Get Started Free
            </Link>
            <p className="text-xs text-gray-500 mt-2">No credit card required</p>
          </div>

          <div className="border rounded-xl p-4 sm:p-6 bg-black text-white shadow-lg relative opacity-60">
            <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-orange-400 text-orange-900 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                🚧 Not available in beta
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 mt-2">Premium — €9.99</h3>
            <div className="mb-4 sm:mb-6">
              <div className="text-2xl sm:text-3xl font-bold">€9.99</div>
              <div className="text-xs sm:text-sm text-gray-300">per month</div>
            </div>
            <ul className="text-xs sm:text-sm text-left space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Company Searches</div>
                  <div className="text-gray-300">Unlimited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Contact Searches</div>
                  <div className="text-gray-300">Unlimited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Email Generations</div>
                  <div className="text-gray-300">Unlimited</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">AI Customization</div>
                  <div className="text-gray-300">Advanced AI Messaging</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white">✓</span>
                </div>
                <div>
                  <div className="font-medium">Support</div>
                  <div className="text-gray-300">Priority Support</div>
                </div>
              </li>
            </ul>
            <button
              disabled
              className="block w-full bg-gray-600 text-gray-400 px-4 py-3 rounded-xl font-medium cursor-not-allowed text-sm sm:text-base"
            >
              Coming After Beta
            </button>
            <p className="text-xs text-gray-300 mt-2">Available when we exit beta</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            💡 <strong>Pro tip:</strong> Most users get their first interview before upgrading
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Skip the Job Board Queue?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start finding decision-makers instead of applying to black holes
          </p>

          <AnimatedCtaButton
            href="/signup"
            onClick={() => handleSignupClick("final_cta")}
            variant="primary"
            showSparkles={true}
          >
            Start Now – No Credit Card Required
          </AnimatedCtaButton>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-6">
            <span>✅ Free forever</span>
            <span>✅ 5 free emails</span>
            <span>✅ 2-minute setup</span>
          </div>
        </div>
      </section>

      {/* Q&A - Better mobile spacing */}
      <section className="bg-gray-100 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              Is this better than LinkedIn Premium?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              LinkedIn shows you who's hiring. Bypass shows you who to contact and what to say.
              Plus, you're not competing with 500 other "InMail" messages. Our users get 67%
              response rates vs 2% on job boards.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Can I try before buying?</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Absolutely! Use Bypass completely free – no credit card, no commitment. You get 5
              email address generations. Most users get their first interview invitation before
              upgrading.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              How accurate are the email addresses?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              85%+ accuracy rate. Real people, real emails, real results.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              What's the success rate? Do people actually get hired?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Our users get 3.2x more interview invitations and land jobs 2-3x faster than
              traditional methods. Over 1,200+ students have used Bypass to get hired at companies
              like McKinsey, LVMH, Google, and JPMorgan.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Is this legal/ethical?</h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              100% legal and ethical. We only use publicly available information and follow GDPR
              guidelines. Think of it as smart networking, not cold emailing. We're helping you
              connect professionally, not spam.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              How is this different from cold emailing?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Our AI crafts personalized messages that reference company news, recent projects, and
              pain points. It's not generic "I'm interested in opportunities" emails – it's
              intelligent, relevant outreach that gets responses.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              How long does it take to see results?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Most users get their first positive response within 48 hours. Average time to first
              interview is 5 days. Compare that to 3-6 months of traditional job searching.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              What if I don't get any responses?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              We provide email templates, messaging tips, and support to maximize your success. If
              you're not getting responses, our team will help you optimize your approach. Most
              issues are easily fixable.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              Do you work for all industries?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Yes! Our AI works across all industries – tech, consulting, finance, marketing,
              healthcare, and more. We've helped students land jobs in startups, Fortune 500
              companies, and everything in between.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">
              What happens after I send the emails?
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              You'll typically get responses within 24-48 hours. Some will be interview invitations,
              others might be referrals or requests for more info. We provide guidance on how to
              handle each type of response to maximize your chances.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:nathan.douziech@gmail.com"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Email us!
          </a>
          <p className="text-sm text-gray-500 mt-2">We usually reply within 24 hours</p>
        </div>
      </section>

      {/* Footer - Better mobile layout */}
      <footer className="bg-white border-t py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Brand Column */}
            <div className="text-center sm:text-left">
              <div className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Bypass</div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Skip the job board queue. Connect directly with decision-makers.
              </p>
              <div className="flex justify-center sm:justify-start gap-3">
                <Link
                  href="https://linkedin.com"
                  target="_blank"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Link>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.197-2.25-1.197-3.654 0-1.404.449-2.706 1.197-3.654.749-.948 1.9-1.559 3.197-1.559s2.448.611 3.197 1.559c.748.948 1.197 2.25 1.197 3.654 0 1.404-.449 2.706-1.197 3.654-.749.948-1.9 1.559-3.197 1.559z" />
                  </svg>
                </Link>
                <Link
                  href="https://tiktok.com"
                  target="_blank"
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Product & Support Columns - Better mobile layout */}
            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <Link href="#how" className="hover:text-gray-800 transition-colors">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-gray-800 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#demo" className="hover:text-gray-800 transition-colors">
                    Demo
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-gray-800 transition-colors">
                    Start Free
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">
                <li>
                  <a
                    href="mailto:nathan.douziech@gmail.com"
                    className="hover:text-gray-800 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gray-800 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-gray-800 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar - Better mobile stacking */}
          <div className="border-t pt-6 sm:pt-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span>Bypass • Trusted by 1,200+ students</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>47 students got interviews this week</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
              © 2025 Bypass. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
