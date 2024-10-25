import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
const theme = extendTheme({
  initialColorMode: "dark",
  styles: {
    global: (props: any) => ({
      body: {
        bg: mode("gray.700", "gray.900")(props),
      },
    }),
  },
  colors: {
    green: {
      50: "#CCF5F5",
      100: "#B3EFEF",
      200: "#99EAEA",
      300: "#80E0E0",
      400: "#66D6D6",
      500: "#45D5C7", // ロゴカラー1
      600: "#00B8C3", // ロゴカラー2
      700: "#149999", // ロゴカラー3
      800: "#008080",
      900: "#004C4C",
    },
  },
  components: {},
});

export default theme;
