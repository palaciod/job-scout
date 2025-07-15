import { IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useDrawer } from "../../contexts/DrawerContext";

const DrawerButton = () => {
  const { openDrawer } = useDrawer();

  return (
    <IconButton
      onClick={openDrawer}
      sx={{
        position: "relative",
        color: "#fff",
        p: 1,
        "&:hover": {
          backgroundColor: "#3d3d3d",
        },
      }}
    >
      <MenuIcon />
    </IconButton>
  );
};

export default DrawerButton;
