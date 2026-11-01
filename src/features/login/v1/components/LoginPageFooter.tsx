const LoginPageFooter = () => {
  return (
    <footer className="relative z-10 mt-10 w-full max-w-5xl mx-auto border-t border-white/[0.08] pt-5">
      <div className="flex flex-col items-center justify-between gap-4 text-xs sm:flex-row">
        {/* Copyright */}
        <p className="text-center text-zinc-500">
          © {new Date().getFullYear()} <span className="font-medium text-zinc-300">Eduvanta</span>. All
          rights reserved.
        </p>

        {/* Footer Links */}
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3"
        >
          <a
            href="https://github.com/abhishek-nexgen-dev/ednora"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.12.08 1.7 1.15 1.7 1.15 1 .1.76 2.07 3.24 1.57.1-.72.39-1.21.7-1.49-2.47-.28-5.07-1.24-5.07-5.5 0-1.21.43-2.2 1.15-2.97-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.1-1.43 3.04-1.14 3.04-1.14.61 1.53.23 2.67.11 2.95.72.77 1.15 1.76 1.15 2.97 0 4.27-2.6 5.21-5.08 5.49.4.34.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
            GitHub
          </a>

          <a
            href="https://github.com/abhishek-nexgen-dev/ednora/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors hover:text-white"
          >
            Support
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default LoginPageFooter;
