import '@mui/material/styles';
import { Palette, PaletteOptions } from '@mui/material/styles/createPalette';

declare module '@mui/material/styles' {
  interface PaletteBackground {
    defaultChannel?: string;
    paperChannel?: string;
  }
  interface TypeBackground {
    defaultChannel?: string;
    paperChannel?: string;
  }
  
  interface Theme {
    vars?: {
      shape: {
        borderRadius: number;
      };
      palette: Palette;
    };
  }
  interface ThemeOptions {
    vars?: {
      shape?: {
        borderRadius?: number;
      };
      palette?: PaletteOptions;
    };
  }
}
