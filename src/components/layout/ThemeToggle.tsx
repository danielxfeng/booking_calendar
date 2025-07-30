import { useAtom } from 'jotai';
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { themeAtom } from '@/lib/atoms';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ThemeValues = ['light', 'dark', 'system'] as const;
type TypeTheme = (typeof ThemeValues)[number];

const ThemeToggle = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='hover:bg-muted text-muted-foreground hover:text-muted-foreground flex h-8 w-8 items-center justify-center rounded-md p-0 transition-all duration-200 hover:shadow-sm focus-visible:ring-0 active:scale-95'
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='flex w-auto justify-between gap-1.5 p-1'
          align='end'
          sideOffset={6}
        >
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Monitor className='h-8 w-8' />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Sun className='h-8 w-8' />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Moon className='h-8 w-8' />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ThemeToggle;

export type { TypeTheme };
