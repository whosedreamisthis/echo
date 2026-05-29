import React from "react";
import Image from "next/image";

const Logo = () => {
  return (
    <div>
      <Image src="/logo-dark.png" alt="Logo" width={32} height={32} />
    </div>
  );
};

export default Logo;
