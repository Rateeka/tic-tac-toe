import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';

function IconToggle({ label, pressed, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="surface grid h-11 w-11 shrink-0 place-items-center text-muted transition duration-200 hover:border-accent/50 hover:text-ink active:scale-95"
    >
      {children}
    </button>
  );
}

export default function Header({ sound, theme, onToggleSound, onToggleTheme }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div
          aria-hidden="true"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-accent to-violet shadow-glow"
        >
          <span className="text-[17px] font-black tracking-tighter text-onaccent">
            X<span className="opacity-70">O</span>
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="truncate bg-linear-to-r from-accent to-violet bg-clip-text text-lg font-extrabold tracking-[0.18em] text-transparent sm:text-2xl">
            TIC TAC TOE
          </h1>
          <p className="truncate text-xs text-muted sm:text-sm">Think smart. Make your move.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconToggle
          label={sound ? 'Sound: on' : 'Sound: off'}
          pressed={sound}
          onClick={onToggleSound}
        >
          {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
        </IconToggle>
        <IconToggle
          label={theme === 'dark' ? 'Theme: dark' : 'Theme: light'}
          pressed={theme === 'dark'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? <Moon size={19} /> : <Sun size={19} />}
        </IconToggle>
      </div>
    </header>
  );
}
