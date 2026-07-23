"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CiMail } from "react-icons/ci";
import { FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const socialLinks = [
    { name: "Email", icon: CiMail, href: "mailto:blackhorse.lines@gmail.com", color: "hover:text-primary" },
    { name: "GitHub", icon: FaGithub, href: "https://github.com/BlackHorseTeck", color: "hover:text-gray-900 dark:hover:text-gray-100" },
    { name: "X", icon: FaXTwitter, href: "https://x.com/BlackhorseTeck", color: "hover:text-gray-900 dark:hover:text-gray-100" },
    { name: "LinkedIn", icon: FaLinkedin, href: "https://www.linkedin.com/company/bahia-llm-works", color: "hover:text-primary" },

  ];

  if (!mounted) return null;

  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full px-6 py-[10vh]">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Main Content */}
        <div className="bg-background border border-border rounded-2xl p-12 shadow-lg">
          {/* Brand Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-semibold text-foreground">
                Minder
              </h1>
            <p className="text-muted-foreground mt-2 text-lg">Building the future, one line at a time</p>
          </div>

          {/* Story Content */}
          <div className="space-y-8 mb-12">
            <div className="border-l-4 border-primary pl-6 py-2">
              <p className="text-lg leading-relaxed text-muted-foreground">
                I'm not from the <span className="text-primary font-medium">"right school."</span> I didn&apos;t inherit wealth&lsquo; status, or a golden ticket into the tech world. I'm a <span className="text-foreground font-semibold">college dropout</span> who decided that instead of waiting for permission, I'd build my own future with nothing but curiosity, stubbornness, and code.
              </p>
            </div>

            <div className="border-l-4 border-muted pl-6 py-2">
              <p className="text-lg leading-relaxed text-muted-foreground">
                <span className="text-primary font-semibold">Minder</span> is more than just a project. It's <span className="text-foreground font-medium">proof</span>. Proof that a single person, with no safety net, can create tools that rival what companies with millions in funding are still trying to figure out. It's not about hype or buzzwords—it's about <span className="text-primary font-semibold">execution, creativity</span>, and belief that ideas are worthless until they're built.
              </p>
            </div>

            <div className="border-l-4 border-muted pl-6 py-2">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Every line of code in this app is a declaration: you don't need a degree from Ivy League schools, you don't need billions in venture funding, you don't need approval from gatekeepers. You just need <span className="text-primary font-semibold">fire</span>.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6 py-2">
              <p className="text-lg leading-relaxed text-muted-foreground">
                This is my story so far. From nothing, I'm <span className="text-foreground font-semibold">building</span>. From nowhere, I'm aiming everywhere. And Minder is only the beginning.
              </p>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="border-t border-border pt-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">Connect With Me</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`relative p-4 rounded-xl border border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all duration-300 hover:shadow-md hover:shadow-black/5 hover:-translate-y-1 group`}
                    onMouseEnter={() => setHoveredSocial(social.name)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    aria-label={`Connect on ${social.name}`}
                  >
                    <IconComponent className="w-6 h-6 mx-auto" />
                    
                    {/* Tooltip */}
                    <span 
                      className={`absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium text-primary-foreground bg-foreground rounded-lg opacity-0 pointer-events-none transition-all duration-200 whitespace-nowrap ${
                        hoveredSocial === social.name 
                          ? 'opacity-100 -translate-y-1' 
                          : 'opacity-0 translate-y-0'
                      }`}
                    >
                      {social.name}
                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <div className="inline-block p-6 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-muted-foreground mb-4">
                Ready to see what's possible?
              </p>
              <Link
                href="/"
                className="group relative bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                Explore Minder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;