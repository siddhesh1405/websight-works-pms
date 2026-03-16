import logo from "../assets/websight_works_logo.jpeg";

export default function BrandLogo({ size = "md" }) {
  const map = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <img
      src={logo}
      alt="Websight Works logo"
      className={`rounded-xl object-cover shadow-md ${map[size] || map.md}`}
    />
  );
}
