"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Users, TrendingUp, Layers, Rocket, BarChart2, FileText, Zap, Shield, Brain, Globe, PieChart, Code, Presentation, MessageCircle, BarChart, Cog } from "lucide-react";
import Link from "next/link";

// Check if required packages are available
if (typeof motion === 'undefined') {
  console.error('framer-motion is not installed. Run: npm install framer-motion');
}

const iconColors = [
  "text-yellow-400 bg-yellow-900/30",
  "text-pink-400 bg-pink-900/30", 
  "text-green-400 bg-green-900/30",
  "text-purple-400 bg-purple-900/30",
  "text-orange-400 bg-orange-900/30",
  "text-cyan-400 bg-cyan-900/30",
  "text-red-400 bg-red-900/30",
  "text-fuchsia-400 bg-fuchsia-900/30",
  "text-lime-400 bg-lime-900/30",
];

const currentFeatures = [
  {
    icon: Lightbulb,
    title: "Idea Validator",
    points: [
      "Validates startup ideas and checks feasibility",
      "Market fit analysis with scoring system",
      "Suggests refinements and improvements",
      "Competitor and trend comparison"
    ],
  },
  {
    icon: Users,
    title: "Advisory Mode",
    points: [
      "CEO AI: Guides on vision, mission, and strategy",
      "CFO AI: Advises on revenue models and fundraising",
      "CTO AI: Suggests tech stack and MVP path",
      "CMO AI: Provides positioning and GTM strategies"
    ],
  },
  {
    icon: TrendingUp,
    title: "0 → 1 Journey",
    points: [
      "Helps founders go from raw idea to structured plan",
      "Step-by-step startup development guidance",
      "Milestone tracking and progress monitoring",
      "Strategic roadmap creation and execution"
    ],
  },
  {
    icon: Shield,
    title: "Guidance",
    points: [
      "Acts like a mentor, giving direction and clarity",
      "Strategic advice without direct execution",
      "Expert consultation on business decisions",
      "Long-term vision and planning assistance"
    ],
  },
];

const futureFeatures = [
  {
    icon: Brain,
    title: "AI Co-Founder Team",
    points: [
      "Hire multiple specialized AI co-founders",
      "COO, CPO, Data Scientist roles available", 
      "Collaborative team decision making",
      "Role-specific expertise and insights"
    ],
  },
  {
    icon: Cog,
    title: "Build Mode",
    points: [
      "AI generates wireframes and prototypes",
      "Auto-creates code snippets and strategies",
      "Design system generation",
      "Complete roadmap development"
    ],
  },
  {
    icon: Presentation,
    title: "Pitch Room",
    points: [
      "Auto-generate investor pitch decks",
      "Pitch analysis and optimization",
      "Simulate investor Q&A sessions",
      "Presentation coaching and feedback"
    ],
  },
  {
    icon: MessageCircle,
    title: "AI Chat Partner",
    points: [
      "Real-time collaboration with AI co-founders",
      "Always-on strategic consultation",
      "Instant problem-solving assistance", 
      "24/7 business guidance availability"
    ],
  },
  {
    icon: Globe,
    title: "Community Integration",
    points: [
      "Network with other founders globally",
      "Connect with AI mentors and advisors",
      "Access to investor networks",
      "Collaborative startup ecosystem"
    ],
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    points: [
      "Track key milestones and KPIs",
      "Monitor co-founder performance metrics",
      "Business growth analytics",
      "Real-time progress monitoring"
    ],
  },
  {
    icon: Rocket,
    title: "Execution Layer",
    points: [
      "AI doesn't just guide, it executes",
      "Builds, markets, and models alongside you",
      "Automated pitch generation and delivery",
      "Complete end-to-end startup assistance"
    ],
  },
];

export default function FeaturesPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<'current' | 'future' | null>(null);

  // Simple mobile layout - just list the features
  const MobileFeaturesList = () => (
    <div className="space-y-6">
      {/* Current Features */}
      <div>
        <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">Current Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {currentFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            const iconColor = iconColors[idx % iconColors.length];
            return (
              <div key={idx} className="bg-slate-900/50 border border-blue-800/30 rounded-lg p-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${iconColor} mx-auto mb-2`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white text-center">{feature.title}</h4>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future Features */}
      <div>
        <h3 className="text-xl font-bold text-purple-300 mb-4 text-center">Future Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {futureFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            const iconColor = iconColors[(idx + currentFeatures.length) % iconColors.length];
            return (
              <div key={idx} className="bg-slate-900/50 border border-purple-800/30 rounded-lg p-3">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${iconColor} mx-auto mb-2`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white text-center">{feature.title}</h4>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Tablet/Desktop props - keep original design
  const circleProps = {
    radius: 280,
    center: 320,
    iconSize: 80,
    containerWidth: 640,
    containerHeight: 640,
    circleSize: 560,
    fontSize: "text-[120px] sm:text-[140px] lg:text-[160px]",
    labelSize: "text-sm"
  };

  const renderFeatureIcons = (features: typeof currentFeatures, isTop: boolean, startIdx: number = 0) => {
    return features.map((feature, idx) => {
      const totalFeatures = features.length;
      let angle;
      
      if (isTop) {
        // For top semicircle (4 features) - slightly increase spacing
        const angleRange = Math.PI * 0.5; // Increased from 0.4 to 0.5 (50% of semicircle)
        const startAngle = Math.PI + (Math.PI * 0.25); // Adjusted center positioning
        angle = startAngle + (idx / (totalFeatures - 1)) * angleRange;
      } else {
        // For bottom semicircle (7 features) - use full semicircle
        const angleRange = Math.PI;
        const startAngle = 0;
        angle = startAngle + (idx / (totalFeatures - 1)) * angleRange;
      }
      
      // Adjust positions for semicircles
      const x = circleProps.center + circleProps.radius * Math.cos(angle) - circleProps.iconSize / 2;
      const y = circleProps.center + circleProps.radius * Math.sin(angle) - circleProps.iconSize / 2;
      
      const Icon = feature.icon;
      const iconColor = iconColors[(startIdx + idx) % iconColors.length];
      const globalIdx = startIdx + idx;
      const isOpen = openIdx === globalIdx;
      
      return (
        <motion.div
          key={`${isTop ? 'current' : 'future'}-${idx}`}
          initial={false}
          animate={isOpen ? { scale: 1.25, zIndex: 20 } : { scale: 1, zIndex: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute cursor-pointer group"
          style={{
            left: x,
            top: y,
            width: circleProps.iconSize,
            height: circleProps.iconSize,
            zIndex: isOpen ? 20 : 10,
          }}
          onMouseEnter={() => setOpenIdx(globalIdx)}
          onMouseLeave={() => setOpenIdx(null)}
          onClick={() => setOpenIdx(isOpen ? null : globalIdx)}
        >
          {/* Icon Circle */}
          <div
            className={`flex items-center justify-center rounded-full shadow-lg transition-all duration-300 ${iconColor} w-full h-full border-2 border-slate-700 group-hover:border-blue-400`}
          >
            <Icon className="w-10 h-10" />
          </div>
          
          {/* Expanded Card */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 20 }}
              transition={{ duration: 0.25 }}
              className="absolute left-1/2 top-[110%] -translate-x-1/2 w-80 bg-[#181e2a]/90 border border-gray-800 rounded-2xl shadow-2xl p-5 mt-2 z-30"
            >
              <h2 className="text-lg font-bold text-white mb-2 text-center">
                {feature.title}
              </h2>
              <ul className="list-disc list-inside text-blue-100 space-y-2 pl-2 mt-2">
                {feature.points.map((point, i) => (
                  <li key={i} className="text-sm">{point}</li>
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      );
    });
  };

  return (
    <div
      className="min-h-screen w-full py-4 sm:py-6 lg:py-8 px-2 sm:px-4"
      style={{
        background:
          "linear-gradient(220deg, rgb(15, 15, 16) 20%, rgb(7, 20, 52) 40%, rgb(22, 21, 21) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-4 sm:mb-6 lg:mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Vision Strategy Growth</h1>
        <p className="text-lg text-blue-100">Discover the features that make <b>021 AI</b> your go-to startup partner</p>
        </motion.div>

        {/* Main Feature Circle Container - Hidden on Mobile */}
        <div className="relative mx-auto my-6 sm:my-8 lg:my-12 justify-center hidden sm:flex">
          <div className="relative" style={{ 
            width: circleProps.containerWidth, 
            height: circleProps.containerHeight 
          }}>
            
            {/* Main Circle Background */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/40 border border-blue-900/30 shadow-2xl z-0" 
              style={{ 
                width: circleProps.circleSize, 
                height: circleProps.circleSize 
              }}
            />
            
            {/* Horizontal Divider Line */}
            <div 
              className="absolute left-1/2 top-3/8 -translate-x-1/2 -translate-y-0.5 h-0.5 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent z-5" 
              style={{ width: circleProps.circleSize * 0.85 }}
            />
            
            {/* Current Features Label - Curved Text Top */}
            <div className="absolute mt-1 left-1/2 top-[15%] -translate-x-1/2 z-10">
              <div className="bg-slate-800/80 border border-blue-600/50 rounded-full px-3 sm:px-4 lg:px-6 py-1 sm:py-2">
                <span className={`text-blue-300 font-semibold ${circleProps.labelSize} tracking-wider uppercase`}>
                  Current Features
                </span>
              </div>
            </div>
            
            {/* Future Features Label - Curved Text Bottom */}
            <div className="absolute left-1/2 bottom-[15%] -translate-x-1/2 z-10 mb-2 sm:mb-5">
              <div className="bg-slate-800/80 border border-purple-600/50 rounded-full px-3 sm:px-4 lg:px-6 py-1 sm:py-2">
                <span className={`text-purple-300 font-semibold ${circleProps.labelSize} tracking-wider uppercase`}>
                  Future Advancements
                </span>
              </div>
            </div>

            {/* Centered 021 text */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-5 flex items-center justify-center">
              <span
                className={` font-extrabold ${circleProps.fontSize} bg-gradient-to-br from-blue-300 via-cyan-200 to-green-200 bg-clip-text text-transparent drop-shadow-lg select-none opacity-20`}
                style={{ fontFamily:  "Exo 2, sans-serif"  }}
              >
                021
              </span>
            </div>

            {/* Current Features Icons - Top Semicircle */}
            {renderFeatureIcons(currentFeatures, true, 0)}
            
            {/* Future Features Icons - Bottom Semicircle */}
            {renderFeatureIcons(futureFeatures, false, currentFeatures.length)}

          </div>
        </div>

        {/* Mobile Simple Layout - Only visible on mobile */}
        <div className="block sm:hidden my-6">
          <MobileFeaturesList />
        </div>

        {/* Feature Details Sections - Only show on tablet/desktop */}
        <div className="hidden sm:grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 lg:mt-16 px-2 sm:px-0">
          {/* Current Features Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-slate-900/50 border border-blue-800/30 rounded-xl p-4 sm:p-6"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-blue-300 mb-3 sm:mb-4 text-center">
              Current Capabilities (Now)
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• Idea Validator</h4>
                <p className="text-blue-200 text-sm ml-4">Validates startup ideas, checks feasibility, and suggests refinements.</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• AI Co-Founders (Advisory Mode)</h4>
                <ul className="text-blue-200 text-sm ml-4 space-y-1">
                  <li><strong>CEO AI</strong> → Guides on vision, mission, and strategy.</li>
                  <li><strong>CFO AI</strong> → Advises on revenue models, cost structures, and fundraising.</li>
                  <li><strong>CTO AI</strong> → Suggests tech stack, MVP path, and product feasibility.</li>
                  <li><strong>CMO AI</strong> → Provides positioning, GTM strategies, and marketing direction.</li>
                </ul>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• 0 → 1 Journey</h4>
                <p className="text-blue-200 text-sm ml-4">Helps founders go from raw idea to structured plan.</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• Guidance, Not Execution</h4>
                <p className="text-blue-200 text-sm ml-4">Acts like a mentor, giving direction and clarity.</p>
              </div>
            </div>
          </motion.div>

          {/* Future Features Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-slate-900/50 border border-purple-800/30 rounded-xl p-4 sm:p-6"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-purple-300 mb-3 sm:mb-4 text-center">
              Future Advancements (Next)
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• AI Co-Founder Team Expansion</h4>
                <p className="text-purple-200 text-sm ml-4">Hire multiple AI co-founders (CEO, CTO, CFO, CMO, COO, CPO, Data Scientist, etc.).</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• Build Mode</h4>
                <p className="text-purple-200 text-sm ml-4">AI generates wireframes, code snippets, strategies, designs, and roadmaps.</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• Pitch Room</h4>
                <p className="text-purple-200 text-sm ml-4">Create, analyze, and auto-generate investor pitch decks + simulate investor Q&A.</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• AI Chat (Always-On Partner)</h4>
                <p className="text-purple-200 text-sm ml-4">Real-time collaboration with specialized AI co-founders.</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• Community Integration</h4>
                <p className="text-purple-200 text-sm ml-4">Network with other founders, AI mentors, and investors.</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• Analytics Dashboard</h4>
                <p className="text-purple-200 text-sm ml-4">Track milestones, KPIs, and co-founder performance.</p>
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">• Execution Layer</h4>
                <p className="text-purple-200 text-sm ml-4">AI doesn't just guide, it does — builds, markets, models, and pitches alongside you.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-8 sm:mt-12 lg:mt-16 text-center px-2"
        >
          <div className="inline-block bg-gradient-to-r from-slate-800 to-black px-4 sm:px-6 lg:px-8 py-4 sm:py-5 rounded-2xl shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Ready to build with 021 AI?</h3>
            <p className="text-blue-100 mb-3 text-sm sm:text-base">Start your journey with an AI co-founder today.</p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg transition-all text-sm sm:text-base"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}