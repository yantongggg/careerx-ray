interface BrandLogoProps {
  size?: "sm" | "md";
}

const sizeClass = {
  sm: "w-6 h-6 rounded-md",
  md: "w-8 h-8 rounded-lg",
};

export function BrandLogo({ size = "md" }: BrandLogoProps) {
  return (
    <img
      src="/brand-logo.svg"
      alt="CareerX-Ray"
      className={`${sizeClass[size]} flex-shrink-0`}
      width={size === "sm" ? 24 : 32}
      height={size === "sm" ? 24 : 32}
    />
  );
}
