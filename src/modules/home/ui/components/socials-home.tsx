"use client";

import { CiMail } from "react-icons/ci";
import { FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";

export const SocialsHome = () => {
  return (
    <div className="flex gap-6 pt-4">
      <a href="mailto:blackhorse.lines@gmail.com" className="transition-transform hover:text-primary hover:rotate-15"><CiMail size={28} /></a>
      <a href="https://github.com/BlackHorseTeck" target="_blank" className="transition-transform hover:text-primary hover:rotate-15"><FaGithub size={28} /></a>
      <a href="https://x.com/BlackhorseTeck" target="_blank" className="transition-transform hover:text-primary hover:rotate-15"><FaXTwitter size={28} /></a>
      <a href="https://www.linkedin.com/company/bahia-llm-works" target="_blank" className="transition-transform hover:text-primary hover:rotate-15"><FaLinkedin size={28} /></a>
    </div>
  );
};
